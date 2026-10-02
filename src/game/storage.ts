import { LEVELS, levelById } from "./levels.ts";
import { initialState, samePoint, transition } from "./simulation.ts";
import type { Direction, Echo, GameState, Level, Point, SaveData } from "./types.ts";

export const SAVE_KEY = "lanternwake:v1";
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
function parsePath(value: unknown, level: Level): Point[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > level.maxBeats + 1) return null;
  const path: Point[] = [];
  for (const p of value) {
    if (!isRecord(p) || !Number.isInteger(p.x) || !Number.isInteger(p.y)) return null;
    const point = { x: p.x as number, y: p.y as number };
    if (!level.map[point.y]?.[point.x] || level.map[point.y][point.x] === "_") return null;
    if (path.length && Math.abs(path.at(-1)!.x - point.x) + Math.abs(path.at(-1)!.y - point.y) > 1) return null;
    path.push(point);
  }
  return samePoint(path[0], level.spawn) ? path : null;
}
function directionBetween(from: Point, to: Point): Direction {
  return to.x > from.x ? "right" : to.x < from.x ? "left" : to.y > from.y ? "down" : to.y < from.y ? "up" : "wait";
}
function replayPath(level: Level, path: Point[], echoes: Echo[]): GameState | null {
  let state = { ...initialState(level), echoes };
  for (let i = 1; i < path.length; i++) {
    state = transition(level, state, { type: "step", direction: directionBetween(path[i - 1], path[i]) });
    if (state.beat !== i || !samePoint(state.path[i], path[i])) return null;
  }
  return state;
}
export function parseSave(raw: string | null): SaveData | null {
  if (!raw || raw.length > 40_000) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== 1 || !isRecord(data.state)) return null;
    const saved = data.state;
    if (!LEVELS.some(level => level.id === saved.levelId)) return null;
    const level = levelById(String(saved.levelId));
    if (!Array.isArray(saved.echoes) || saved.echoes.length > level.maxEchoes) return null;
    const echoes: Echo[] = [];
    for (const e of saved.echoes) {
      if (!isRecord(e) || !Number.isInteger(e.id) || Number(e.id) < 1) return null;
      const path = parsePath(e.path, level);
      if (!path || path.length < 2 || !replayPath(level, path, echoes) || echoes.some(prior => prior.id === e.id)) return null;
      echoes.push({ id: Number(e.id), path });
    }
    const path = parsePath(saved.path, level);
    if (!path) return null;
    const state = replayPath(level, path, echoes);
    if (!state || saved.beat !== state.beat || saved.won !== state.won) return null;
    const completed = Array.isArray(data.completed) ? data.completed.filter((id): id is string => typeof id === "string" && LEVELS.some(l => l.id === id)) : [];
    return { version: 1, state: { ...state, loops: Math.max(0, ...echoes.map(e => e.id)), paused: false, message: "The garden kept your place." }, completed: [...new Set(completed)], sound: data.sound === true };
  } catch { return null; }
}
