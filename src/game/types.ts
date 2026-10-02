export type Direction = "up" | "down" | "left" | "right" | "wait";
export type Point = { x: number; y: number };
export type Pad = Point & { id: string; name: string };
export type Gate = Point & { pads: string[] };
export type Level = {
  id: string; title: string; subtitle: string; story: string;
  map: string[]; spawn: Point; goal: Point; pads: Pad[]; gates: Gate[];
  maxBeats: number; maxEchoes: number; hints: string[];
  solutions: Direction[][];
};
export type Echo = { id: number; path: Point[] };
export type GameState = {
  levelId: string; path: Point[]; echoes: Echo[]; beat: number;
  won: boolean; paused: boolean; message: string; loops: number;
};
export type GameAction =
  | { type: "step"; direction: Direction }
  | { type: "rewind" }
  | { type: "undo" }
  | { type: "undo-echo" }
  | { type: "restart" }
  | { type: "pause"; value: boolean };
export type SaveData = { version: 1; state: GameState; completed: string[]; sound: boolean };
