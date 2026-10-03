import { useEffect, useRef } from "react";
import { LEVELS } from "../game/levels.ts";
import type { Level } from "../game/types.ts";
import { Icon } from "./icon.tsx";

type JournalProps = {
  level: Level;
  completed: string[];
  hint: string;
  showHint: boolean;
  onHint: () => void;
  onClose: () => void;
  onChoose: (id: string) => void;
};

export function Journal({
  level,
  completed,
  hint,
  showHint,
  onHint,
  onClose,
  onChoose,
}: JournalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();

    return () => dialog.current?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="journal"
      onCancel={onClose}
      aria-labelledby="journal-title"
    >
      <button
        className="dialog-close icon-button"
        aria-label="Close journal"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <h2 id="journal-title">A few borrowed moments</h2>
      <p className="journal-intro">
        Walk a path. Rewind. Your echo walks it again, then waits where you left
        it. Every move is one beat for everyone.
      </p>
      <ol className="chapter-list">
        {LEVELS.map((room, i) => (
          <li key={room.id}>
            <button
              className={level.id === room.id ? "selected" : ""}
              onClick={() => onChoose(room.id)}
            >
              <span className="chapter-number">0{i + 1}</span>
              <span>
                {room.title}
                <small>{room.subtitle}</small>
              </span>
              <span className="chapter-complete">
                {completed.includes(room.id)
                  ? "Completed"
                  : level.id === room.id
                    ? "Here now"
                    : "Visit"}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div className="journal-help">
        <p>
          There is no rush. The garden waits when you do. Undo a step with Z.
          Rewind with R. Use Space to wait. Taking back an echo lets you edit
          that path.
        </p>
        <button onClick={onHint}>A gentle nudge</button>
        {showHint && (
          <p className="hint" role="status">
            {hint}
          </p>
        )}
      </div>
      <p className="private-note">
        With sound on, your footsteps become a tune. Each echo carries it in a
        different voice. Wait to listen; resting echoes stay quiet. Progress
        stays on this device.
      </p>
      <button className="resume-button" onClick={onClose}>
        Back to the garden
      </button>
    </dialog>
  );
}
