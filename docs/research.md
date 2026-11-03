# Lanternwake: concept and design rationale

Recommendation: a small time-loop puzzle where your past attempts become
helpful company. Its first useful interaction is also its explanation: an echo
stays on a moon pad so you can walk through the gate. No model needs to tell
the player what happened.

A deterministic puzzle makes temporal cooperation testable while adding no
external integration to maintain.

## Three different playful opportunities

| Concept                  | Immediate hook and user benefit                                                                           | Difference worth testing                                                                                    | Feasibility and technical depth                                                                                          | Playable slice                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Lanternwake**          | Rewind a short walk; watch an echo help you. A quiet diversion that can travel offline.                   | Familiar replay-cooperation rendered as deliberate beats, endpoint-holding echoes, and a warm little story. | High feasibility: pure simulation, temporal dependencies, reversible state, replay-validated saves, renderer separation. | Four authored rooms, complete progression, touch/keyboard play, genuine offline reload. |
| **Impossible Postcards** | Drag a lighthouse next to a train station to deliver an absurd postcard. Build a world by rearranging it. | Spatial collage becomes routing logic; the map is an object to play with rather than a destination list.    | Medium-high: graph rewrites, route constraints, satisfying drag physics, authored surprising requests.                   | A small rearrangeable atlas and several increasingly strange deliveries.                |
| **Soup Weather**         | Drop ingredients into a bowl-sized planet; carrots grow warm islands and herbs change the winds.          | A cooking metaphor becomes a visible ecology, with discoveries instead of recipes or shopping.              | Medium: deterministic cellular simulation, weather propagation, creatures, readable causal feedback.                     | Three ingredient systems and a small emergent ecosystem.                                |

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

## Visual direction

The [original concept](concept.png) establishes the teal winter garden, amber
lamps, serif wordmark and violet echoes. Authored puzzle routes replace its
decorative path, and contextual guidance replaces its footer slogan. The mobile
layout adds direction controls below a full board. These are intentional
playability changes to the reference, rather than a pixel-identical target.
See [artwork provenance](assets.md) for the source of the images.

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
