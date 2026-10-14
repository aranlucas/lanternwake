import { useCallback, useEffect, useRef, useState } from "react";
import { GardenAudio } from "./audio.ts";
import { LEVELS, levelById } from "./levels.ts";
import { initialState, transition } from "./simulation.ts";
import { parseSave, SAVE_KEY } from "./storage.ts";
import type { GameAction, GameState } from "./types.ts";

function loadInitial() {
  try {
    return parseSave(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

export function useGame() {
  const [saved] = useState(loadInitial);

  const [state, setState] = useState<GameState>(saved?.state ?? initialState(LEVELS[0]));

  const [completed, setCompleted] = useState<string[]>(() => {
    const restored = saved?.completed ?? [];

    return saved?.state.won && !restored.includes(saved.state.levelId)
      ? [...restored, saved.state.levelId]
      : restored;
  });

  const [sound, setSound] = useState(false); // Even a saved sound preference needs a fresh user gesture.
  const [storageAvailable, setStorageAvailable] = useState(true);
  const audio = useRef<GardenAudio | null>(null);
  const current = useRef(state);
  const level = levelById(state.levelId);
  useEffect(() => {
    const gardenAudio = new GardenAudio();
    audio.current = gardenAudio;

    return () => {
      void gardenAudio.dispose().catch(() => {});
    };
  }, []);

  const act = useCallback((action: GameAction) => {
    const before = current.current;
    const after = transition(levelById(before.levelId), before, action);

    current.current = after;
    setState(after);

    if (after.won) {
      setCompleted((previous) =>
        previous.includes(after.levelId) ? previous : [...previous, after.levelId],
      );
    }

    if (action.type === "step" && !before.paused && !before.won) {
      audio.current?.playStep(before, after);

      if (after.won) {
        audio.current?.play("win");
      } else if (after.beat === before.beat) {
        audio.current?.play("blocked");
      }
    }

    if (action.type === "rewind" && after.echoes.length > before.echoes.length) {
      audio.current?.play("rewind");
    }

    if (action.type === "pause" && action.value) {
      void audio.current?.suspend().catch(() => {});
    }

    if (action.type === "restart") {
      audio.current?.silence();
    }
  }, []);

  const chooseLevel = useCallback((id: string) => {
    const next = initialState(levelById(id));
    current.current = next;
    setState(next);
    void audio.current?.resume().catch(() => {});
  }, []);

  const toggleSound = async () => {
    const value = !audio.current?.enabled;
    setSound(value);

    try {
      await audio.current?.enable(value);
    } catch {
      setSound(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, state, completed, sound }));
    } catch {
      // Browser storage errors are only known after writing the latest game state.
      // eslint-disable-next-line react/set-state-in-effect
      setStorageAvailable(false);
    }
  }, [state, completed, sound]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        act({ type: "pause", value: true });
      }
    };

    document.addEventListener("visibilitychange", visibility);

    return () => document.removeEventListener("visibilitychange", visibility);
  }, [act]);

  const resume = () => {
    act({ type: "pause", value: false });
    void audio.current?.resume().catch(() => {});
  };

  return {
    state,
    level,
    completed,
    sound,
    storageAvailable,
    act,
    chooseLevel,
    toggleSound,
    resume,
  };
}
