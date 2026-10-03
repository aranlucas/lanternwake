import { useEffect, useRef, useState } from "react";
import { createGarden, GardenScene } from "../game/renderer.ts";
import type { Direction, GameState, Level } from "../game/types.ts";

type WorldProps = { level: Level; state: GameState; onMove: (direction: Direction) => void };

export function GameWorld({ level, state, onMove }: WorldProps) {
  const host = useRef<HTMLDivElement>(null), scene = useRef<GardenScene | null>(null), move = useRef(onMove);
  const [ready, setReady] = useState(false);
  move.current = onMove;
  useEffect(() => {
    if (!host.current) return;
    const garden = new GardenScene(level, state, direction => move.current(direction), matchMedia("(prefers-reduced-motion: reduce)").matches, () => setReady(true));
    scene.current = garden;
    const game = createGarden(host.current, garden);

    return () => { scene.current = null; game.destroy(true); };
    // Scene lifetime belongs to the mounted world; state flows through render below.
  }, []);
  useEffect(() => { scene.current?.render(level, state); }, [level, state]);

  return <div className="world" role="img" aria-label={`${level.title}. You are at column ${state.path.at(-1)!.x}, row ${state.path.at(-1)!.y}. ${state.echoes.length} echoes. ${state.won ? "Room complete." : "Use the direction controls to move."}`}>
    <div className="canvas-host" ref={host} />
    {!ready && <div className="loading" role="status">Lighting the garden…</div>}
    <span className="world-ready" data-ready={ready} hidden />
  </div>;
}

