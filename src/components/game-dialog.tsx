import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type GameDialogProps = { labelId: string; onDismiss?: () => void; children: ReactNode };

export function GameDialog({ labelId, onDismiss, children }: GameDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} className="game-dialog" aria-labelledby={labelId} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    const first = buttons[0], last = buttons.at(-1);
    if (!first || !last) return;
    // Native modality makes the background inert; explicit wrapping also keeps
    // Tab from moving into browser chrome at the end of this small button group.
    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }} onCancel={event => {
    event.preventDefault();
    onDismiss?.();
  }}>{children}</dialog>;
}
