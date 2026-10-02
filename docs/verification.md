# Verification and handoff

## Result

The complete local slice passes. Four authored rooms finish through actual
browser input. No relevant console errors or external HTTP requests were
observed. Progress and original artwork reload with the browser offline.

Commands, run sequentially:

```sh
pnpm check
pnpm build
pnpm test:e2e
node scripts/capture-demo.mjs
```

`pnpm check`: TypeScript passes and **11/11 unit/property tests** pass, including
all four authored solutions, gate occupancy, echo endpoint replay, bridge
timing, pause/reset/undo/echo recovery, bounded paths, malformed/forged save
rejection, and repeatability across 400 seeded actions per room.

`pnpm build`: passes. Vite warns that the Phaser-containing 1.44 MB JavaScript
bundle exceeds its generic 500 kB advisory. It is not an error; reducing cold
load weight remains a future optimization. The content-versioned service
worker precaches six app/art files.

`pnpm test:e2e`: **5/5 Chromium tests** pass with one worker:

| Browser check | Evidence / observed result |
| --- | --- |
| Page identity and meaningful render | Title is Lanternwake; Phaser assets finish loading; actual keeper, paths, pads, gate and bell render. |
| Full progression | All four room solutions through keyboard; four completion markers in journal. |
| Runtime health | No page errors or console errors; no external HTTP(S) requests. Same-origin blob textures are local resources. |
| Core first echo | Walk onto pad, rewind, echo repeats and holds endpoint, gate opens, player reaches bell. |
| Reversibility | Undo step, take back echo, pause/resume, restart all update actual state. |
| Foreground/background | Visibility-change handler pauses input and sound; explicit foreground resume permits movement. Handler exercised deterministically; not a physical OS lifecycle test. |
| Audio | User-gesture enable toggles sound and activates its audio context; human listening not performed. |
| Offline | Wait for cache readiness, set browser network offline, reload, recover saved echo, render actual art and finish room. |
| Mobile | 390×844, reduced motion, real touch-control clicks, room completion, hint/journal flow, no document horizontal overflow. |
| Modal keyboard access | Tab/Shift+Tab stay inside the pause/completion controls, Escape resumes pause, completion remains visible, and backgrounding a completed room cannot stack two game dialogs. |
| Screenshots | Native concept viewport 1536×1024 desktop plus full-page mobile capture. |

The IAB/CUA entry point failed with **Transport closed**. Playwright Chromium
was used because the built-in browser was unavailable. `view_image` initially
had the same connection symptom, then recovered. Both `docs/concept.png` and
the final desktop/first-echo/mobile renders were inspected directly with
`view_image` in the same visual pass.

## Fidelity ledger

| Comparison point | Concept evidence | Render evidence | Repair or intentional change |
| --- | --- | --- | --- |
| Palette and environment | Teal winter garden, frosted stone, amber lamps, distant moon | Standalone garden preserves the illustrated setting and colors | No color wash added to the background. |
| Typography | Large serif wordmark, restrained serif captions | Georgia wordmark/chapter/buttons; explicit UI control sizes | Preserved serif personality; small status text uses readable sans-serif. |
| Playfield and UI separation | World occupies most of screen; bottom timeline/control strip | Same native 1536×1024 screen composition | Authored maps intentionally replace the decorative concept path. |
| Sprite readability | Distinct violet echo next to cream keeper | First-echo screenshot shows violet echo holding pad and separate keeper at open gate | Fixed overlap via local occupant spacing; WebGL tint preserves echo distinction. |
| Controls | Rewind, wait, undo, restart; small sound/journal actions | Same labels and order with real controls | Added pause and take-back-echo controls as functional necessities. |
| Beats and feedback | Sixteen dots; beat label | Sixteen computed dots, beat counter, echo count and held-light status | Dynamic explanatory feedback replaces static concept slogan. |
| Responsive composition | Desktop concept only | Mobile world above stacked actions and direction pad | Intentional touch layout; portrait tablets retain a full board rather than cropping it. Short desktop screens scroll vertically. |

Above-the-fold copy comparison preserves Lanternwake, chapter title, and the
four primary action labels. The concept's generic footer slogan is replaced
by contextual guidance. Added copy is limited to actual beat/echo/light state,
offline readiness, pause, recovery, journal hints and progress. Those are
intentional functional extensions, not marketing claims.

The implementation was visually checked against the accepted concept for
palette, typography, artwork, hierarchy, control anatomy, and unobstructed
playfield. It faithfully carries that visual direction. It is **not claimed
to be a pixel-identical reproduction**: board geometry, task guidance and
mobile controls differ intentionally so the game actually works.

## Artifacts and remaining limits

- `evidence/desktop.png`: first actionable screen, 1536×1024.
- `evidence/first-echo.png`: genuine recorded echo and opened gate.
- `evidence/mobile.png`: touch-ready responsive view.
- `evidence/morning.png`: completed final room.
- `evidence/lanternwake-demo.webm`: short real gameplay recording.

Library saves succeeded for the first-echo screenshot, mobile screenshot and
video. Exact Library identifiers are provided separately to the parent for
native attachment. No invented transfer/download URL is supplied.

Safari/Firefox, physical phones, human audio listening and Docker/Railway
runtime remain untested. Canvas fallback may show opacity without the WebGL
echo tint. The game has keyboard and labeled touch controls; it has not had a
complete screen-reader gameplay audit.

No production infrastructure or public demo was created. Source was published
to the [private Lanternwake repository](https://github.com/aranlucas/lanternwake)
using the existing GitHub keyring session with approved host network access;
private visibility and the exact remote commit were verified. The initial
sandbox authentication check could not use that network route. Credentials
were not changed. Native Mac app transport initially blocked browser entry
and parent progress messages; those connections later recovered, and the local
HTTP `/health` endpoint was confirmed healthy.

## Draft PR follow-up: accessible game dialogs

The initial prototype is preserved on main. A genuine follow-up replaces the
pause and completion overlays with native modal dialogs. This keeps keyboard
focus inside the open dialog and makes the rest of the game inert. Escape
resumes a paused game, while a completion dialog remains until its next-room
or journal action is chosen. Keyboard game commands cannot run behind any
open dialog, and backgrounding a completed room cannot stack a second pause
dialog over its completion screen. Browser tests verify these behaviors.
