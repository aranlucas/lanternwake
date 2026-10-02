import { useCallback, useEffect, useRef, useState } from "react";
import { GardenAudio } from "./audio.ts";
import { LEVELS, levelById } from "./levels.ts";
import { initialState, transition } from "./simulation.ts";
import { parseSave, SAVE_KEY } from "./storage.ts";
import type { GameAction, GameState } from "./types.ts";

function loadInitial() { try { return parseSave(localStorage.getItem(SAVE_KEY)); } catch { return null; } }
export function useGame() {
  const [saved] = useState(loadInitial);
  const [state, setState] = useState<GameState>(saved?.state ?? initialState(LEVELS[0]));
  const [completed, setCompleted] = useState<string[]>(saved?.completed ?? []);
  const [sound, setSound] = useState(false); // Even a saved sound preference needs a fresh user gesture.
  const [storageAvailable, setStorageAvailable] = useState(true);
  const audio = useRef<GardenAudio | null>(null);
  const current = useRef(state); current.current = state;
  const level = levelById(state.levelId);
  useEffect(() => {
    audio.current = new GardenAudio();
    return () => { void audio.current?.dispose(); };
  }, []);
  const act = useCallback((action: GameAction) => {
    const before = current.current, after = transition(levelById(before.levelId), before, action);
    current.current = after; setState(after);
    if (action.type === "step") audio.current?.play(after.won ? "win" : after.beat > before.beat ? "step" : "blocked");
    if (action.type === "rewind" && after.echoes.length > before.echoes.length) audio.current?.play("rewind");
  }, []);
  const chooseLevel = useCallback((id: string) => { const next = initialState(levelById(id)); current.current = next; setState(next); }, []);
  const toggleSound = async () => {
    const value = !sound;
    try { await audio.current?.enable(value); setSound(value); } catch { setSound(false); }
  };
  useEffect(() => {
    if (state.won) setCompleted(previous => previous.includes(state.levelId) ? previous : [...previous, state.levelId]);
  }, [state.won, state.levelId]);
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state, completed, sound })); }
    catch { setStorageAvailable(false); }
  }, [state, completed, sound]);
  useEffect(() => {
    const visibility = () => { if (document.hidden) { act({ type: "pause", value: true }); void audio.current?.suspend(); } };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [act]);
  const resume = () => { act({ type: "pause", value: false }); void audio.current?.resume(); };
  return { state, level, completed, sound, storageAvailable, act, chooseLevel, toggleSound, resume };
}
