# Feature roadmap

Planning baseline: `d0effdb39605` on `origin/main`, 2026-10-26. This small local puzzle follows Digits/MCP in portfolio priority.

## Outcome

Help players understand their echoes and enjoy a short complete journey. The [current game](README.md) already provides four rooms, undo, echo recovery, gentle journal hints, an optional musical choir, local saves and offline play.

## 1. Inspect an echo before the next move

Add an optional paused inspection that makes each echo's recorded path, next position and resting endpoint understandable without requiring color or sound.

Acceptance:

- Inspection does not advance the deterministic simulation.
- Keyboard and touch players can select an echo and return to play.
- Bridge timing and the next beat are stated consistently with the simulation.
- The feature helps explain a blocked route without automatically solving the room.

Observe a few voluntary playthroughs. Record misunderstandings about echo timing and whether inspection helps. Keep the no-analytics policy.

## 2. Offer one new room with a distinct idea

Create a room that combines familiar mechanics in a new way before introducing a new rule. Provide a verified solution, gradual hints and an optional challenge.

Acceptance: the complete solution works through real controls; restart, undo and echo recovery remain valid throughout.

## 3. Preserve a favorite musical solution

If players request it, add a small local replay of a completed solution using the existing note and echo system. Replay must be explicitly started and stopped, remain silent without opt-in and carry a simulation version.

## Boundaries

No AI provider, remote gameplay service, account, analytics or copyrighted character is part of this plan. Keep pure deterministic rules separate from rendering, and validate gameplay changes through the existing sequential checks and browser suite. Deployment remains a separate decision. Success is understandable play and voluntary revisiting, not an endless content treadmill.
