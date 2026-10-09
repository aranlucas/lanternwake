import type { Level } from "./types.ts";

export const LEVELS: Level[] = [
  {
    id: "company",
    title: "A little company",
    subtitle: "One light. Two of you.",
    story: "The garden has been waiting for someone. Perhaps it was waiting for you, twice.",
    map: [
      "_________",
      "__...____",
      "__...____",
      "_S.aA..!_",
      "__...____",
      "_________",
      "_________",
    ],
    spawn: { x: 1, y: 3 },
    goal: { x: 7, y: 3 },
    pads: [{ id: "a", name: "Moon pad", x: 3, y: 3 }],
    gates: [{ x: 4, y: 3, pads: ["a"] }],
    maxBeats: 16,
    maxEchoes: 3,
    hints: [
      "Move right twice, onto the moon pad.",
      "Rewind while you are on the pad. Your echo will stay there.",
      "Follow your echo, then pass through the gate to the bell.",
    ],
    solutions: [
      ["right", "right"],
      ["right", "right", "right", "right", "right", "right"],
    ],
  },
  {
    id: "wishes",
    title: "Two wishes",
    subtitle: "Some doors ask for company.",
    story: "One wish opens the path. Another lets the morning in. Neither needs to be made alone.",
    map: [
      "_________",
      "__.b..___",
      "__._.____",
      "_S.aA.C!_",
      "__...____",
      "_________",
      "_________",
    ],
    spawn: { x: 1, y: 3 },
    goal: { x: 7, y: 3 },
    pads: [
      { id: "a", name: "Moon pad", x: 3, y: 3 },
      { id: "b", name: "Star pad", x: 3, y: 1 },
    ],
    gates: [
      { x: 4, y: 3, pads: ["a"] },
      { x: 6, y: 3, pads: ["b"] },
    ],
    maxBeats: 16,
    maxEchoes: 3,
    hints: [
      "Leave your first echo on the moon pad.",
      "Walk right, up, up, right to the star pad. Leave another echo.",
      "Your echoes hold both wishes. Take the path to the bell.",
    ],
    solutions: [
      ["right", "right"],
      ["right", "up", "up", "right"],
      ["right", "right", "right", "right", "right", "right"],
    ],
  },
  {
    id: "beat",
    title: "A borrowed beat",
    subtitle: "Even bridges have a rhythm.",
    story: "The moon bridge breathes in two beats, out two beats. Listen with your feet.",
    map: [
      "_________",
      "_____..._",
      "_____pb._",
      "_____p___",
      "_S.aA..!_",
      "__...____",
      "_________",
    ],
    spawn: { x: 1, y: 4 },
    goal: { x: 7, y: 4 },
    pads: [
      { id: "a", name: "Moon pad", x: 3, y: 4 },
      { id: "b", name: "Star pad", x: 6, y: 2 },
    ],
    gates: [{ x: 4, y: 4, pads: ["a"] }],
    maxBeats: 16,
    maxEchoes: 3,
    hints: [
      "The moon pad still needs an echo.",
      "At the bridge entrance, wait one beat. Cross on beats 6 and 7, then turn right to the star pad.",
      "Return to the bell. Wait there until both echoes reach their pads.",
    ],
    solutions: [
      ["right", "right"],
      ["right", "right", "right", "right", "wait", "up", "up", "right"],
      ["right", "right", "right", "right", "right", "right", "wait", "wait"],
    ],
  },
  {
    id: "together",
    title: "The last light",
    subtitle: "A small constellation of selves.",
    story:
      "Three lights, borrowed from three little moments. You were never as alone as you thought.",
    map: [
      "_________",
      "__.b..___",
      "__._.____",
      "_S.aA.C!_",
      "__._.____",
      "__.c..___",
      "_________",
    ],
    spawn: { x: 1, y: 3 },
    goal: { x: 7, y: 3 },
    pads: [
      { id: "a", name: "Moon pad", x: 3, y: 3 },
      { id: "b", name: "Star pad", x: 3, y: 1 },
      { id: "c", name: "Dawn pad", x: 3, y: 5 },
    ],
    gates: [
      { x: 4, y: 3, pads: ["a"] },
      { x: 6, y: 3, pads: ["b", "c"] },
    ],
    maxBeats: 16,
    maxEchoes: 3,
    hints: [
      "Leave echoes on the moon, star, and dawn pads.",
      "The upper pad is right, up, up, right. The lower pad mirrors it.",
      "Three echoes will make a constellation. You carry the last light to the bell.",
    ],
    solutions: [
      ["right", "right"],
      ["right", "up", "up", "right"],
      ["right", "down", "down", "right"],
      ["right", "right", "right", "right", "right", "right"],
    ],
  },
];

export function levelById(id: string): Level {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
