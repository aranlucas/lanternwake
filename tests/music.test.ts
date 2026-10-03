import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS } from "../src/game/levels.ts";
import { notesForStep } from "../src/game/music.ts";
import { initialState, transition } from "../src/game/simulation.ts";
import type { Direction, GameState } from "../src/game/types.ts";

const level = LEVELS[0];

function step(state: GameState, direction: Direction) {
  return transition(level, state, { type: "step", direction });
}

function record() {
  let state = initialState(level);
  const tune = [];

  for (const direction of level.solutions[0]) {
    const after = step(state, direction);
    tune.push(notesForStep(state, after)[0].midi);
    state = after;
  }

  return { state: transition(level, state, { type: "rewind" }), tune };
}

test("an echo repeats the recorded tune one octave above its keeper, independently of the new route", () => {
  const recorded = record();
  let state = recorded.state;
  const heard = [];

  for (let i = 0; i < recorded.tune.length; i++) {
    const after = step(state, "wait"),
      notes = notesForStep(state, after);

    assert.equal(notes.length, 1);
    assert.equal(notes[0].voice, 1);
    heard.push(notes[0].midi - 12);
    state = after;
  }

  assert.deepEqual(heard, recorded.tune);
});

test("waits leave moving echoes audible; held endpoints and stationary keeper stay silent", () => {
  let state = record().state;

  for (let i = 0; i < level.solutions[0].length; i++)
    state = step(state, "wait");
  const wait = step(state, "wait");
  assert.deepEqual(notesForStep(state, wait), []);
  const move = step(wait, "right");
  assert.deepEqual(
    notesForStep(wait, move).map((note) => note.voice),
    [0],
  );
});

test("blocked moves, rewind, undo, pause and completed states cannot manufacture musical steps", () => {
  const initial = initialState(level),
    first = step(initial, "right"),
    second = step(first, "right");

  for (const after of [
    step(second, "right"),
    transition(level, second, { type: "undo" }),
    transition(level, second, { type: "rewind" }),
  ])
    assert.deepEqual(notesForStep(second, after), []);
  const paused = transition(level, first, { type: "pause", value: true });
  assert.deepEqual(notesForStep(paused, step(paused, "right")), []);
  let won = record().state;

  for (const direction of level.solutions[1]) won = step(won, direction);
  assert.equal(won.won, true);
  assert.deepEqual(notesForStep(won, step(won, "wait")), []);
  assert.deepEqual(notesForStep(first, { ...second, levelId: "other" }), []);
});

test("three cooperating echoes form four distinct, bounded musical voices on one beat", () => {
  let state = initialState(level);

  for (let i = 0; i < 3; i++) {
    state = step(state, "right");
    state = transition(level, state, { type: "rewind" });
  }

  const after = step(state, "right"),
    notes = notesForStep(state, after);

  assert.equal(notes.length, 4);
  assert.equal(new Set(notes.map((note) => note.frequency)).size, 4);
  assert.equal(new Set(notes.map((note) => note.pan)).size, 4);
  assert.ok(notes.reduce((sum, note) => sum + note.gain, 0) <= 0.05);
  assert.deepEqual(notesForStep(state, after), notesForStep(state, after));
});
