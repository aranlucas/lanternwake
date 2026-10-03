import type { GameAction, GameState, Level } from "../game/types.ts";
import { Icon } from "./icon.tsx";

type ControlsProps = {
  level: Level;
  state: GameState;
  onAction: (action: GameAction) => void;
};

export function Controls({ level, state, onAction }: ControlsProps) {
  const locked = state.paused || state.won;

  return (
    <div className="controls">
      <div className="main-controls">
        <button
          className="rewind"
          onClick={() => onAction({ type: "rewind" })}
          disabled={
            locked || state.beat === 0 || state.echoes.length >= level.maxEchoes
          }
        >
          <Icon name="rewind" />
          Rewind & leave an echo
        </button>
        <button
          onClick={() => onAction({ type: "step", direction: "wait" })}
          disabled={locked || state.beat === level.maxBeats}
        >
          <Icon name="wait" />
          Wait
        </button>
        <button
          onClick={() => onAction({ type: "undo" })}
          disabled={locked || state.beat === 0}
        >
          <Icon name="undo" />
          Undo step
        </button>
        <button onClick={() => onAction({ type: "restart" })}>
          <Icon name="restart" />
          Restart
        </button>
      </div>
      <div className="touch-controls" aria-label="Direction controls">
        {(["up", "left", "down", "right"] as const).map((direction) => (
          <button
            className={`direction ${direction}`}
            key={direction}
            aria-label={`Move ${direction}`}
            disabled={locked}
            onClick={() => onAction({ type: "step", direction })}
          >
            <Icon name={direction} size={26} />
          </button>
        ))}
      </div>
      {state.echoes.length > 0 && !locked && (
        <button
          className="undo-echo"
          onClick={() => onAction({ type: "undo-echo" })}
        >
          Take back your last echo
        </button>
      )}
    </div>
  );
}
