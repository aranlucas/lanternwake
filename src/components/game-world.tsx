import { useEffect, useRef, useState } from "react";
import { currentPosition } from "../game/simulation.ts";
import { createGarden, GardenScene } from "../game/renderer.ts";
import type { Direction, GameState, Level } from "../game/types.ts";

type WorldProps = {
  level: Level;
  state: GameState;
  onMove: (direction: Direction) => void;
};

export function GameWorld({ level, state, onMove }: WorldProps) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<GardenScene | null>(null);
  const move = useRef(onMove);

  const [ready, setReady] = useState(false);
  const [initial] = useState(() => ({ level, state }));
  useEffect(() => {
    move.current = onMove;
  }, [onMove]);
  useEffect(() => {
    if (!host.current) {
      throw new Error("Missing garden host");
    }

    const garden = new GardenScene(
      initial.level,
      initial.state,
      (direction) => move.current(direction),
      matchMedia("(prefers-reduced-motion: reduce)").matches,
      () => setReady(true),
    );

    scene.current = garden;
    const game = createGarden(host.current, garden);

    return () => {
      scene.current = null;
      game.destroy(true);
    };
    // Scene lifetime belongs to the mounted world; state flows through render below.
  }, [initial]);
  useEffect(() => {
    scene.current?.render(level, state);
  }, [level, state]);

  const position = currentPosition(state);

  return (
    <div
      className="world"
      role="img"
      aria-label={`${level.title}. You are at column ${position.x}, row ${position.y}. ${state.echoes.length} echoes. ${state.won ? "Room complete." : "Use the direction controls to move."}`}
    >
      <div className="canvas-host" ref={host} />
      {!ready && (
        <div className="loading" role="status">
          Lighting the garden…
        </div>
      )}
      <span className="world-ready" data-ready={ready} hidden />
    </div>
  );
}
