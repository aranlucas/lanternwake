import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS } from "../src/game/levels.ts";
import {
  activePads,
  bridgeOpen,
  currentPosition,
  echoPosition,
  initialState,
  transition,
} from "../src/game/simulation.ts";
import { parseSave } from "../src/game/storage.ts";
import type {
  Direction,
  GameAction,
  GameState,
  Level,
} from "../src/game/types.ts";

function play(level: Level, paths: Direction[][]): GameState {
  let state = initialState(level);
  paths.forEach((path, index) => {
    for (const direction of path) {
      const previous = state.beat;
      state = transition(level, state, { type: "step", direction });
      assert.equal(
        state.beat,
        previous + 1,
        `Blocked solution: ${level.id} loop ${index} ${direction}: ${state.message}`,
      );
    }

    if (index < paths.length - 1)
      state = transition(level, state, { type: "rewind" });
  });

  return state;
}

for (const level of LEVELS)
  test(`${level.title}: authored solution cooperates with all required echoes`, () => {
    const state = play(level, level.solutions);
    assert.equal(state.won, true);
    assert.deepEqual(currentPosition(state), level.goal);
    assert.equal(activePads(level, state).length, level.pads.length);
    assert.equal(state.echoes.length, level.solutions.length - 1);

    const saved = parseSave(
      JSON.stringify({
        version: 1,
        state,
        completed: [level.id],
        sound: false,
      }),
    );

    assert.ok(
      saved,
      "Winning state must round-trip through validated local persistence",
    );
    assert.equal(saved.state.won, true);
  });

test("a player cannot hold a pad while crossing its gate alone", () => {
  const level = LEVELS[0];
  let state = initialState(level);
  state = transition(level, state, { type: "step", direction: "right" });
  state = transition(level, state, { type: "step", direction: "right" });

  const blocked = transition(level, state, {
    type: "step",
    direction: "right",
  });

  assert.equal(blocked.beat, 2);
  assert.deepEqual(currentPosition(blocked), { x: 3, y: 3 });
  assert.equal(blocked.echoes.length, 0);
});

test("echo replays exact recorded positions and holds its final position", () => {
  const level = LEVELS[0],
    state = play(level, [level.solutions[0]]);

  const rewound = transition(level, state, { type: "rewind" });
  assert.deepEqual(rewound.echoes[0].path, state.path);
  assert.equal(rewound.beat, 0);
  assert.deepEqual(echoPosition(rewound.echoes[0].path, 1), { x: 2, y: 3 });
  assert.deepEqual(echoPosition(rewound.echoes[0].path, 16), { x: 3, y: 3 });
});

test("moon bridge refuses sleeping-beat crossing without advancing time", () => {
  const level = LEVELS[2];
  let state = play(level, [level.solutions[0]]);
  state = transition(level, state, { type: "rewind" });

  for (const direction of ["right", "right", "right", "right"] as const)
    state = transition(level, state, { type: "step", direction });
  const blocked = transition(level, state, { type: "step", direction: "up" });
  assert.equal(blocked.beat, 4);
  assert.match(blocked.message, /bridge sleeps/);
  state = transition(level, blocked, { type: "step", direction: "wait" });
  state = transition(level, state, { type: "step", direction: "up" });
  assert.equal(state.beat, 6);
  assert.equal(currentPosition(state).y, 3);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map(bridgeOpen), [
    false,
    false,
    true,
    true,
    false,
    false,
    true,
    true,
  ]);
});

test("pause freezes movement/rewinds; restart clears echoes; undo restores synchronized beat", () => {
  const level = LEVELS[0];
  let state = play(level, [level.solutions[0]]);
  const paused = transition(level, state, { type: "pause", value: true });
  assert.equal(
    transition(level, paused, { type: "step", direction: "left" }),
    paused,
  );
  assert.equal(transition(level, paused, { type: "rewind" }), paused);
  state = transition(level, paused, { type: "pause", value: false });
  const rewound = transition(level, state, { type: "rewind" });
  let moved = transition(level, rewound, { type: "step", direction: "right" });
  moved = transition(level, moved, { type: "undo" });
  assert.equal(moved.beat, 0);
  assert.equal(moved.path.length, 1);
  const takenBack = transition(level, moved, { type: "undo-echo" });
  assert.deepEqual(takenBack.path, state.path);
  assert.equal(takenBack.echoes.length, 0);
  assert.deepEqual(
    transition(level, paused, { type: "restart" }),
    initialState(level),
  );
});

test("empty echoes and the fourth echo are refused; full beat budget remains undoable", () => {
  const level = LEVELS[0];
  let state = initialState(level);
  assert.equal(transition(level, state, { type: "rewind" }).echoes.length, 0);

  for (let i = 0; i < 3; i++) {
    state = transition(level, state, { type: "step", direction: "right" });
    state = transition(level, state, { type: "rewind" });
  }

  for (let i = 0; i < 16; i++)
    state = transition(level, state, { type: "step", direction: "wait" });
  assert.equal(transition(level, state, { type: "rewind" }).echoes.length, 3);
  assert.equal(
    transition(level, state, { type: "step", direction: "wait" }).beat,
    16,
  );
  assert.equal(transition(level, state, { type: "undo" }).beat, 15);
});

test("save validation rejects malformed, teleporting, stale-version, forged and oversized states", () => {
  const state = initialState(LEVELS[0]);

  const make = (replacement: GameState) =>
    JSON.stringify({ version: 1, state: replacement, completed: [] });

  assert.equal(parseSave("not json"), null);
  assert.equal(parseSave("x".repeat(40_001)), null);
  assert.equal(parseSave(JSON.stringify({ version: 2, state })), null);
  assert.equal(parseSave(make({ ...state, levelId: "missing" })), null);
  assert.equal(parseSave(make({ ...state, won: true })), null);
  assert.equal(
    parseSave(
      make({ ...state, path: [state.path[0], { x: 7, y: 3 }], beat: 1 }),
    ),
    null,
  );
  assert.equal(
    parseSave(
      make({
        ...state,
        echoes: [{ id: 1, path: [state.path[0], { x: 9, y: 9 }] }],
      }),
    ),
    null,
  );
});

test("deterministic replay holds across duplicate randomized action runs", () => {
  let seed = 42;

  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;

    return seed;
  };

  const choices: GameAction[] = (
    ["up", "down", "left", "right", "wait"] as const
  ).map((direction) => ({ type: "step", direction }));

  choices.push(
    { type: "undo" },
    { type: "rewind" },
    { type: "undo-echo" },
    { type: "restart" },
    { type: "pause", value: true },
    { type: "pause", value: false },
  );

  for (const level of LEVELS) {
    const actions = Array.from(
      { length: 400 },
      () => choices[random() % choices.length],
    );

    const run = () =>
      actions.reduce((state, action) => {
        const result = transition(level, state, action);
        assert.equal(result.beat, result.path.length - 1);
        assert.ok(result.beat <= level.maxBeats);
        assert.ok(result.echoes.length <= level.maxEchoes);
        assert.notEqual(
          level.map[currentPosition(result).y][currentPosition(result).x],
          "_",
        );

        return result;
      }, initialState(level));

    assert.deepEqual(run(), run());
  }
});

test("save boundary preserves filtering and rejects malformed coordinates without coercion", () => {
  const state = initialState(LEVELS[0]);

  const save = (replacement: GameState) =>
    JSON.stringify({
      version: 1,
      state: replacement,
      completed: [null, 1, state.levelId, state.levelId, "missing"],
      sound: "true",
    });

  const parsed = parseSave(save(state));
  assert.ok(parsed);
  assert.deepEqual(parsed.completed, [state.levelId]);
  assert.equal(parsed.sound, false);
  assert.equal(parseSave(save(state).replace('"x":1', '"x":"1"')), null);
  assert.equal(parseSave(save(state).replace('"x":1', '"x":1.5')), null);
});
