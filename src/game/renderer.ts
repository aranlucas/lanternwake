import Phaser from "phaser";
import { activePads, bridgeOpen, currentPosition, echoPosition, gateOpen } from "./simulation.ts";
import type { Direction, GameState, Level, Point } from "./types.ts";

export const ASSETS = { garden: "/assets/garden.png", atlas: "/assets/atlas.png" };

const WIDTH = 1536, HEIGHT = 1024;

const tilePoint = (p: Point) => ({ x: 265 + p.x * 110, y: 195 + p.y * 90 });

const TINTS = [0xc8a7ff, 0x8ce3e1, 0xffd4ab];

export class GardenScene extends Phaser.Scene {
  private world: Phaser.GameObjects.Container | null = null;
  private actors: Phaser.GameObjects.Image[] = [];
  private ring: Phaser.GameObjects.Image | null = null;
  private ready = false;
  private level: Level;
  private state: GameState;
  private reducedMotion: boolean;
  private onMove: (direction: Direction) => void;
  private onReady: () => void;
  constructor(level: Level, state: GameState, onMove: (direction: Direction) => void, reducedMotion: boolean, onReady: () => void) {
    super("garden"); this.level = level; this.state = state; this.onMove = onMove; this.reducedMotion = reducedMotion; this.onReady = onReady;
  }
  preload(): void { this.load.image("garden", ASSETS.garden); this.load.image("atlas", ASSETS.atlas); }
  create(): void {
    this.add.image(WIDTH / 2, HEIGHT / 2, "garden").setDisplaySize(WIDTH, HEIGHT);
    // Frame extraction uses the atlas directly; source raster files are unmodified.
    const source = this.textures.get("atlas").getSourceImage();
    const cellWidth = Math.floor(source.width / 4), cellHeight = Math.floor(source.height / 3);

    for (let frame = 0; frame < 12; frame++) this.textures.get("atlas").add(String(frame), 0, (frame % 4) * cellWidth, Math.floor(frame / 4) * cellHeight, cellWidth, cellHeight);
    this.world = this.add.container(0, 0); this.ready = true; this.render(this.level, this.state, true); this.onReady();
  }
  private image(point: Point, frame: number, size = 172): Phaser.GameObjects.Image {
    const p = tilePoint(point), image = this.add.image(p.x, p.y, "atlas", String(frame)).setDisplaySize(size, size * .889);
    this.world!.add(image);

 return image;
  }
  render(level: Level, state: GameState, instant = false): void {
    const changedLevel = level.id !== this.level.id;
    this.level = level; this.state = state;

    if (!this.ready || !this.world) return;
    this.world.removeAll(true);
    const lit = activePads(level, state);
    level.map.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === "_") return;
      const pad = level.pads.find(p => p.x === x && p.y === y);
      const baseFrame = pad ? pad.id === "a" ? 2 : pad.id === "b" ? 8 : 10 : 1;
      const frame = pad && lit.includes(pad.id) ? baseFrame + 1 : baseFrame;
      const stone = this.image({ x, y }, frame);

      if (tile === "p") stone.setTint(0xadebfa).setAlpha(bridgeOpen(state.beat) ? 1 : .24);
      stone.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        const player = currentPosition(this.state), dx = x - player.x, dy = y - player.y;

        if (Math.abs(dx) + Math.abs(dy) === 1) this.onMove(dx === 1 ? "right" : dx === -1 ? "left" : dy === 1 ? "down" : "up");
      });
    }));

    for (const gate of level.gates) this.image(gate, gateOpen(level, state, gate) ? 5 : 4, 210).setDepth(100 + gate.y);
    this.ring?.destroy();
    this.ring = this.image(level.goal, state.won ? 7 : 6, 216).setDepth(110);
    const occupants = [...state.echoes.map(e => echoPosition(e.path, state.beat)), currentPosition(state)];

    while (this.actors.length > occupants.length) this.actors.pop()!.destroy();
    occupants.forEach((point, i) => {
      const player = i === occupants.length - 1, p = tilePoint(point);
      const previous = this.actors[i];

      if (!previous) this.actors[i] = this.add.image(p.x, p.y - 24, "atlas", "0").setDisplaySize(166, 148);
      const actor = this.actors[i];
      actor.setDepth(200 + point.y * 10 + i).setAlpha(player ? 1 : .64).clearTint();

      if (!player) actor.setTint(TINTS[i % 3]);
      this.tweens.killTweensOf(actor);
      const stacked = occupants.filter(p2 => p2.x === point.x && p2.y === point.y).length > 1;
      const localOccupants = occupants.flatMap((p2, index) => p2.x === point.x && p2.y === point.y ? [{ point: p2, index }] : []);
      const localIndex = localOccupants.findIndex(p2 => p2.index === i);
      const destination = { x: p.x + (stacked ? (localIndex - (localOccupants.length - 1) / 2) * 48 : 0), y: p.y - 24 - (player ? 0 : 8) };

      if (instant || changedLevel || this.reducedMotion) actor.setPosition(destination.x, destination.y);
      else this.tweens.add({ targets: actor, ...destination, duration: 140, ease: "Sine.easeInOut" });
    });

    if (state.won && !this.reducedMotion) this.tweens.add({ targets: this.ring, alpha: .8, duration: 800, yoyo: true, repeat: 1 });
  }
}

export function createGarden(parent: HTMLElement, scene: GardenScene): Phaser.Game {
  return new Phaser.Game({ type: Phaser.AUTO, parent, width: WIDTH, height: HEIGHT, transparent: true,
    scale: { mode: Phaser.Scale.ENVELOP, autoCenter: Phaser.Scale.CENTER_BOTH }, scene,
    render: { antialias: true, roundPixels: false }, fps: { target: 30, forceSetTimeOut: true },
    audio: { noAudio: true }, banner: false });
}

