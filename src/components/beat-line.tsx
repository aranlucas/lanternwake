import { activePads } from "../game/simulation.ts";
import type { GameState, Level } from "../game/types.ts";

type BeatProps = { level: Level; state: GameState };

export function BeatLine({ level, state }: BeatProps) {
  const pads = activePads(level, state);

  return <div className="beat-line">
    <div className="beats" aria-hidden="true">
      {Array.from({ length: level.maxBeats }, (_, i) => <span key={i} className={i < state.beat ? "beat lit" : "beat"} />)}
    </div>
    <div className="beat-caption"><span data-testid="beat">Beat {String(state.beat).padStart(2, "0")} / {level.maxBeats}</span>
      <span className="echo-caption" data-testid="echo-count">{state.echoes.length === 0 ? "No echoes yet" : `${state.echoes.length} ${state.echoes.length === 1 ? "echo" : "echoes"} beside you`}</span>
      <span className="pad-caption" role="img" aria-label={`${pads.length} of ${level.pads.length} lights held`}>{level.pads.map(pad => <span className={pads.includes(pad.id) ? "held" : ""} key={pad.id} title={pad.name}>{pad.id === "a" ? "☾" : pad.id === "b" ? "✧" : "☼"}</span>)}</span>
    </div>
  </div>;
}

