// Short synthesized tones only. The AudioContext is created after a user gesture.
export class GardenAudio {
  private context: AudioContext | null = null;
  enabled = false;
  async enable(value: boolean): Promise<void> {
    this.enabled = value;
    if (!value) return;
    this.context ??= new AudioContext();
    if (this.context.state === "suspended") await this.context.resume();
    this.play("rewind");
  }
  play(kind: "step" | "rewind" | "win" | "blocked"): void {
    if (!this.enabled || !this.context || document.hidden) return;
    const ctx = this.context;
    const notes = kind === "win" ? [261.63, 329.63, 392, 523.25] : kind === "rewind" ? [523.25, 392, 329.63] : kind === "blocked" ? [146.83] : [196];
    notes.forEach((frequency, i) => {
      const start = ctx.currentTime + i * .11, length = kind === "step" ? .09 : .65;
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      oscillator.type = "sine"; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(kind === "step" ? .018 : .05, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + length);
      oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(start); oscillator.stop(start + length);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  }
  async suspend(): Promise<void> { if (this.context?.state === "running") await this.context.suspend(); }
  async resume(): Promise<void> { if (this.enabled && this.context?.state === "suspended") await this.context.resume(); }
  async dispose(): Promise<void> { await this.context?.close(); }
}
