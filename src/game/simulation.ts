import type { Direction, GameAction, GameState, Level, Point } from "./types.ts";

const DELTAS: Record<Direction, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }, wait: { x: 0, y: 0 } };
export const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
export function currentPosition(state: GameState): Point { return state.path[state.path.length - 1]; }
export function echoPosition(path: Point[], beat: number): Point { return path[Math.min(beat, path.length - 1)]; }
export function bridgeOpen(beat: number): boolean { return beat % 4 >= 2; }
export function activePads(level: Level, state: GameState, beat = state.beat, player = currentPosition(state)): string[] {
  const occupants = [player, ...state.echoes.map(echo => echoPosition(echo.path, beat))];
  return level.pads.filter(pad => occupants.some(point => samePoint(point, pad))).map(pad => pad.id);
}
export function gateOpen(level: Level, state: GameState, point: Point, beat = state.beat, player = currentPosition(state)): boolean {
  const gate = level.gates.find(g => samePoint(g, point));
  return !gate || gate.pads.every(id => activePads(level, state, beat, player).includes(id));
}
export function initialState(level: Level): GameState {
  return { levelId: level.id, path: [{ ...level.spawn }], echoes: [], beat: 0, won: false, paused: false, message: "Every step is a moment you can borrow.", loops: 0 };
}
function recordEcho(level: Level, state: GameState): GameState {
  if (state.path.length === 1) return { ...state, message: "Take a step first. Give your echo somewhere to go." };
  if (state.echoes.length >= level.maxEchoes) return { ...state, message: "Three echoes is a full constellation. Undo an echo to try another path." };
  return { ...state, path: [{ ...level.spawn }], beat: 0, loops: state.loops + 1,
    echoes: [...state.echoes, { id: state.loops + 1, path: state.path.map(point => ({ ...point })) }],
    message: "An echo remembers your path. It will wait where you left it." };
}
export function transition(level: Level, state: GameState, action: GameAction): GameState {
  if (action.type === "restart") return initialState(level);
  if (action.type === "pause") return { ...state, paused: action.value };
  if (state.paused || state.won) return state;
  if (action.type === "rewind") return recordEcho(level, state);
  if (action.type === "undo-echo") {
    const echo = state.echoes.at(-1);
    if (!echo) return state;
    return { ...state, echoes: state.echoes.slice(0, -1), path: echo.path.map(p => ({ ...p })), beat: echo.path.length - 1, message: "That moment is yours again. Take a different turn." };
  }
  if (action.type === "undo") {
    if (state.beat === 0) return state;
    return { ...state, path: state.path.slice(0, -1), beat: state.beat - 1, message: "One step back. Your echoes step back with you." };
  }
  if (state.beat >= level.maxBeats) return { ...state, message: "This moment is full. Rewind to keep the path, or undo a step." };
  const before = currentPosition(state), delta = DELTAS[action.direction];
  const target = { x: before.x + delta.x, y: before.y + delta.y }, nextBeat = state.beat + 1;
  const tile = level.map[target.y]?.[target.x];
  if (!tile || tile === "_") return { ...state, message: "Only the stepping stones remember your footsteps." };
  if (!gateOpen(level, state, target, nextBeat, target)) return { ...state, message: "The gate needs its lights held. Leave an echo on a matching pad." };
  if (tile === "p" && !bridgeOpen(nextBeat) && action.direction !== "wait") return { ...state, message: "The moon bridge sleeps on this beat. Wait, then try again." };
  const next = { ...state, path: [...state.path, target], beat: nextBeat, message: action.direction === "wait" ? "You wait. Your echoes keep their promises." : "" };
  const lit = activePads(level, next);
  const won = samePoint(target, level.goal) && level.pads.every(pad => lit.includes(pad.id));
  return { ...next, won, message: won ? "The bell remembers all of you. A little more morning." : samePoint(target, level.goal) ? "Almost morning. Wait here until every light is held." : next.message };
}
