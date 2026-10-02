import { useCallback, useEffect, useState } from "react";
import { BeatLine } from "./components/beat-line.tsx";
import { Controls } from "./components/controls.tsx";
import { GameDialog } from "./components/game-dialog.tsx";
import { GameWorld } from "./components/game-world.tsx";
import { Icon } from "./components/icon.tsx";
import { Journal } from "./components/journal.tsx";
import { LEVELS } from "./game/levels.ts";
import { activePads, bridgeOpen, currentPosition } from "./game/simulation.ts";
import { useGame } from "./game/use-game.ts";
import type { Direction, GameState, Level } from "./game/types.ts";

function guidance(level: Level, state: GameState): string {
  if (state.message && state.message !== "Every step is a moment you can borrow.") return state.message;
  if (state.echoes.length === 0 && activePads(level, state).length) return "Here is a good place to rewind. Your echo will hold this light.";
  if (state.echoes.length === 0) return level.hints[0];
  if (level.id === "company") return "Your echo keeps the light. Walk through the gate to the bell.";
  if (level.id === "beat" && state.echoes.length === 1) return "Find the star pad across the moon bridge. Wait for its bright beats.";
  if (state.echoes.length < level.pads.length) return "Another light is waiting. Leave an echo on its pad.";
  return "Your company is complete. Carry the last light to the bell.";
}
export default function App() {
  const { state, level, completed, sound, storageAvailable, act, chooseLevel, toggleSound, resume } = useGame();
  const [journal, setJournal] = useState(false), [showHint, setShowHint] = useState(false), [offline, setOffline] = useState(!navigator.onLine);
  const [cacheReady, setCacheReady] = useState(false);
  const chapter = LEVELS.findIndex(room => room.id === level.id), final = chapter === LEVELS.length - 1;
  const move = useCallback((direction: Direction) => act({ type: "step", direction }), [act]);
  const closeJournal = () => { setJournal(false); setShowHint(false); resume(); };
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (journal || document.querySelector("dialog[open]") || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select, [contenteditable=true]")) return;
      const directions: Record<string, Direction> = { ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
      if (directions[event.key] || directions[event.key.toLowerCase()]) { event.preventDefault(); move(directions[event.key] ?? directions[event.key.toLowerCase()]); }
      else if (event.key.toLowerCase() === "r") { event.preventDefault(); act({ type: "rewind" }); }
      else if (event.key.toLowerCase() === "z") { event.preventDefault(); act({ type: "undo" }); }
      else if (event.key === " " && target.tagName !== "BUTTON") { event.preventDefault(); move("wait"); }
      else if (event.key === "Escape") { event.preventDefault(); state.paused ? resume() : act({ type: "pause", value: true }); }
    };
    window.addEventListener("keydown", keys); return () => window.removeEventListener("keydown", keys);
  }, [act, move, journal, state.paused, resume]);
  useEffect(() => {
    const network = () => setOffline(!navigator.onLine);
    window.addEventListener("online", network); window.addEventListener("offline", network);
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      void navigator.serviceWorker.register("/sw.js").then(async () => { await navigator.serviceWorker.ready; setCacheReady(true); }).catch(() => setCacheReady(false));
    }
    return () => { window.removeEventListener("online", network); window.removeEventListener("offline", network); };
  }, []);
  const position = currentPosition(state);
  return <main className={`game-shell ${state.won ? "morning" : ""}`}>
    <header className="game-header">
      <h1><Icon name="lantern" size={36} />Lanternwake</h1>
      <div className="chapter-title"><span>0{chapter + 1}</span><span className="chapter-divider">/</span><span>{level.title}</span></div>
      <nav aria-label="Game settings"><button className="icon-button" aria-label={sound ? "Mute sound" : "Enable sound"} onClick={() => void toggleSound()} title={sound ? "Mute sound" : "Enable sound"}><Icon name={sound ? "sound" : "mute"} size={23} /></button><button className="icon-button" aria-label="Pause game" onClick={() => act({ type: "pause", value: true })}><Icon name="pause" size={22} /></button><button className="icon-button" aria-label="Open journal" onClick={() => { act({ type: "pause", value: true }); setJournal(true); }}><Icon name="book" size={24} /></button></nav>
    </header>
    <GameWorld level={level} state={state} onMove={move} />
    <div className="game-footer">
      <div className="guidance" role="status" aria-live="polite">{guidance(level, state)}</div>
      {level.id === "beat" && <p className="bridge-rhythm">Moon bridge: <span>{bridgeOpen(state.beat) ? "awake" : "asleep"}</span> · two beats bright, two beats quiet</p>}
      <BeatLine level={level} state={state} />
      <Controls level={level} state={state} onAction={act} />
      <div className="quiet-footer"><span>{offline ? cacheReady ? "Offline · the garden is with you" : "Offline" : cacheReady ? "Ready for offline play" : "A little company, whenever you need it."}</span><span className="key-help">Move: arrows or WASD · Rewind: R · Wait: Space</span></div>
      {!storageAvailable && <p className="save-warning">This browser cannot save your place. You can still play this visit.</p>}
    </div>
    {state.paused && !state.won && !journal && <GameDialog labelId="pause-title" onDismiss={resume}><div className="pause-card"><Icon name="lantern" size={40} /><h2 id="pause-title">The garden can wait.</h2><p>Your echoes are right where you left them.</p><button className="resume-button" autoFocus onClick={resume}>Keep wandering</button></div></GameDialog>}
    {state.won && <GameDialog labelId="win-title"><div className="win-card"><span className="win-symbol">☼</span><h2 id="win-title">{final ? "You brought the morning." : "A little more morning."}</h2><p>{level.story}</p><button className="resume-button" autoFocus onClick={() => { resume(); chooseLevel(final ? LEVELS[0].id : LEVELS[chapter + 1].id); }}>{final ? "Wander again" : "The next little moment"}<Icon name="right" /></button><button className="text-button" onClick={() => { act({ type: "pause", value: true }); setJournal(true); }}>Open the journal</button></div></GameDialog>}
    {journal && <Journal level={level} completed={completed} hint={level.hints[Math.min(state.echoes.length, level.hints.length - 1)]} showHint={showHint} onHint={() => setShowHint(true)} onClose={closeJournal} onChoose={id => { chooseLevel(id); setJournal(false); setShowHint(false); }} />}
    <div className="state-proof" data-testid="state" data-beat={state.beat} data-echoes={state.echoes.length} data-level={state.levelId} data-x={position.x} data-y={position.y} data-won={state.won} data-paused={state.paused} hidden />
  </main>;
}
