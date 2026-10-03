import { notesForStep } from "./music.ts";
import type { GardenNote } from "./music.ts";
import type { GameState } from "./types.ts";

type Voice = { oscillator: OscillatorNode; gain: GainNode; pan: StereoPannerNode };

// Gesture-created local synthesis. No samples, autoplay, wall-clock game rules or network.
export class GardenAudio {
  private context: AudioContext | null = null;
  private voices = new Set<Voice>();
  enabled = false;
  async enable(value: boolean): Promise<void> {
    this.enabled = value;

    if (!value) { await this.suspend();

 return; }

    try {
      this.context ??= new AudioContext();

      if (this.context.state === "suspended") await this.context.resume();
      this.play("rewind");
    } catch (error) { this.enabled = false; throw error; }
  }
  playStep(before: GameState, after: GameState): void {
    for (const note of notesForStep(before, after)) this.schedule(note);
  }
  play(kind: "rewind" | "win" | "blocked"): void {
    const notes = kind === "win" ? [261.63, 329.63, 392, 523.25] : kind === "rewind" ? [523.25, 392, 329.63] : [146.83];
    notes.forEach((frequency, i) => this.schedule({ voice: 0, midi: 0, frequency, waveform: "sine", gain: .025, duration: .55, pan: 0 }, i * .11));
  }
  private schedule(note: GardenNote, delay = 0): void {
    if (!this.enabled || !this.context || this.context.state !== "running" || document.hidden) return;

    // Rapid input stays bounded; cancel the oldest voice rather than accumulating nodes.
    while (this.voices.size >= 16) this.stop(this.voices.values().next().value!);
    const ctx = this.context, start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), pan = ctx.createStereoPanner();
    oscillator.type = note.waveform; oscillator.frequency.value = note.frequency;
    pan.pan.value = note.pan;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(note.gain, start + .016);
    gain.gain.exponentialRampToValueAtTime(.0001, start + note.duration);
    oscillator.connect(gain); gain.connect(pan); pan.connect(ctx.destination);
    const voice = { oscillator, gain, pan }; this.voices.add(voice);
    oscillator.onended = () => this.disconnect(voice);
    oscillator.start(start); oscillator.stop(start + note.duration);
  }
  private disconnect(voice: Voice): void {
    voice.oscillator.disconnect(); voice.gain.disconnect(); voice.pan.disconnect(); this.voices.delete(voice);
  }
  private stop(voice: Voice): void {
    voice.oscillator.stop(); this.disconnect(voice);
  }
  silence(): void { for (const voice of this.voices) this.stop(voice); }
  async suspend(): Promise<void> {
    this.silence();

    if (this.context?.state === "running") await this.context.suspend();
  }
  async resume(): Promise<void> { if (this.enabled && this.context?.state === "suspended") await this.context.resume(); }
  async dispose(): Promise<void> { await this.suspend(); await this.context?.close(); }
}

