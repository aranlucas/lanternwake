import { currentPosition, echoPosition, samePoint } from "./simulation.ts";
import type { GameState, Point } from "./types.ts";

export type GardenNote = {
  voice: number;
  midi: number;
  frequency: number;
  waveform: OscillatorType;
  gain: number;
  duration: number;
  pan: number;
};

// C-major pentatonic keeps routes consonant without choosing a melody for them.
const SCALE = [0, 2, 4, 7, 9];

const VOICES = [
  { root: 60, waveform: "triangle", gain: 0.016, duration: 0.24, pan: 0 },
  { root: 72, waveform: "sine", gain: 0.012, duration: 0.38, pan: -0.45 },
  { root: 48, waveform: "triangle", gain: 0.012, duration: 0.46, pan: 0.45 },
  { root: 84, waveform: "sine", gain: 0.008, duration: 0.3, pan: 0.15 },
] as const;

function noteAt(point: Point, voice: number): GardenNote {
  const instrument = VOICES[voice];
  const midi = instrument.root + SCALE[(point.x + point.y * 2) % SCALE.length];

  return {
    voice,
    midi,
    frequency: 440 * 2 ** ((midi - 69) / 12),
    ...instrument,
  };
}

/** Only an accepted forward beat creates music. Waiting gives moving echoes the floor. */
export function notesForStep(
  before: GameState,
  after: GameState,
): GardenNote[] {
  if (
    before.levelId !== after.levelId ||
    before.paused ||
    before.won ||
    after.beat !== before.beat + 1 ||
    after.path.length !== before.path.length + 1
  )
    return [];
  const notes: GardenNote[] = [];

  if (!samePoint(currentPosition(before), currentPosition(after)))
    notes.push(noteAt(currentPosition(after), 0));
  before.echoes.slice(0, 3).forEach((echo, index) => {
    const from = echoPosition(echo.path, before.beat),
      to = echoPosition(echo.path, after.beat);

    if (!samePoint(from, to)) notes.push(noteAt(to, index + 1));
  });

  return notes;
}
