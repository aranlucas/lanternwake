# Lanternwake: a playful overnight experiment

Recommendation: a small time-loop puzzle where your past attempts become
helpful company. Its first useful interaction is also its explanation: an echo
stays on a moon pad so you can walk through the gate. No model needs to tell
the player what happened.

Lucas's projects show strong event/state systems (agents, Pantry Pulse), local
interactive practice (Onsite Lab), and semantic visual tooling (System Design
Companion). A deterministic puzzle lets those technical strengths produce a
delightful experience, while adding no external integration to maintain.
Only public project descriptions and synthetic, newly authored game data were
used. Existing repositories and their branches were untouched.

## Three different playful opportunities

| Concept | Immediate hook and user benefit | Difference worth testing | Feasibility and technical depth | Overnight demonstration |
| --- | --- | --- | --- | --- |
| **Lanternwake** | Rewind a short walk; watch an echo help you. A quiet diversion that can travel offline. | Familiar replay-cooperation rendered as deliberate beats, endpoint-holding echoes, and a warm little story. | High feasibility: pure simulation, temporal dependencies, reversible state, replay-validated saves, renderer separation. | Four authored rooms, complete progression, touch/keyboard play, genuine offline reload. |
| **Impossible Postcards** | Drag a lighthouse next to a train station to deliver an absurd postcard. Build a world by rearranging it. | Spatial collage becomes routing logic; the map is an object to play with rather than a destination list. | Medium-high: graph rewrites, route constraints, satisfying drag physics, authored surprising requests. | A small rearrangeable atlas and several increasingly strange deliveries. Separate parent-managed prototype. |
| **Soup Weather** | Drop ingredients into a bowl-sized planet; carrots grow warm islands and herbs change the winds. | A cooking metaphor becomes a visible ecology, with discoveries instead of recipes or shopping. | Medium: deterministic cellular simulation, weather propagation, creatures, readable causal feedback. | Three ingredient systems and a small emergent ecosystem. Separate parent-managed prototype. |

Lanternwake wins for this track because the first puzzle teaches the surprising
mechanic in seconds, the deeper puzzles are provably solvable, and the app can
be packaged as a static offline toy. The other ideas deserve their own playable
slices; they are not alternate skins for this game.

## Comparison with established work

**This is not a novelty claim.** [Chronotron's publisher page](https://www.xgenstudios.com/play/chronotron)
describes traveling back and seeing a past version repeat the previous attempt.
[Chronotron on Kongregate](https://www.kongregate.com/en/games/scarybug/chronotron)
also explicitly describes cooperation with past selves. The useful reference
is temporal cooperation, not the character, artwork, level layouts, or physics.

[Valve's Portal 2 co-op puzzle update](https://www.thinkwithportals.com/blog.php?id=8663)
describes community co-op chambers and quick-play puzzles. That reference supports
the appeal of coordinated actions across constrained spaces; Lanternwake
replaces a second live player with an inspectable recorded route.

Lanternwake uses **position replay**, not input replay. Past routes remain stable
when a later self changes a gate. That deliberately avoids paradox management
and makes mistakes easy to undo. Time is a discrete beat advanced by an explicit
move or wait, not a wall-clock countdown. Neither choice is asserted to be
unique; their combination is the prototype's testable design hypothesis.

Phaser is pinned to 3.90.0 and its bundled type definitions guided implementation.
The [official Phaser scaling API](https://docs.phaser.io/api-documentation/namespace/scale)
documents the fit/envelop family; current documentation now labels version 4,
so the installed v3 definitions remain authoritative for this prototype.

## What is demonstrated

1. **A little company**: one echo holds a pad while the player traverses its gate.
2. **Two wishes**: independent echoes hold two lights; neither route alone succeeds.
3. **A borrowed beat**: a two-bright/two-quiet bridge adds wait timing and endpoint synchronization.
4. **The last light**: three recorded paths form a small constellation before the player reaches the bell.

All rooms have authored solution paths tested independently and through browser
controls. There is no procedural filler or simulated victory screen.

## Overnight follow-up: an echo choir

The musical-canon experiment is now tangible. Each moving keeper or echo plays
a note derived from its destination stone in a C-major pentatonic scale. Echoes
repeat the recorded melody in distinct registers, with quiet envelopes and
stereo positions. Waiting leaves the moving echoes audible; held endpoints are
silent. The composition uses the same accepted discrete transitions as the
puzzle, so it adds no timing dependence to the game rules.

Four new deterministic tests verify replayed melody, silence, invalid actions
and four-voice cooperation. A real Web Audio browser check observes the actual
oscillator frequencies and lifecycle. `evidence/echo-choir.wav` records a real
two-echo room solution directly from the app's synthesizer. It uses no samples,
microphone, model or remote service. Human listening and artistic balance are
still the next useful evaluation; technical correctness is not proof of delight.

## Concrete next experiments

- Watch three fresh players for 60 seconds. Do they independently discover
  **pad → rewind → gate**? If not, animate a two-step footprint hint rather than add prose.
- Add one optional “passing the light” room where an echo must leave a pad at
  a specific beat. Keep earlier rooms forgiving; verify the intended time window.
- Let a fresh player compare muted play with the echo choir, then test a small
  completion keepsake that replays their paths at a chosen tempo. Keep opt-in
  sound and avoid rewarding aimless extra steps just to generate more notes.
- Build a five-stone pocket editor with local puzzle codes. Test whether sending
  a tiny authored garden is fun before adding multiplayer, accounts, or hosting.

The supplied reset/X post was not verified. No timing claim about account usage
or its reset is part of this work.
