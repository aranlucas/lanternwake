# Untangle decisions — 2026-11-06

## Baseline and scope

Started at `c76951b` with a clean worktree. Read the root AGENTS.md (the only
repository instructions), every source/test/configuration module, README,
roadmap, research and asset provenance, and recent cleanup history. Preserve
those earlier decisions. Main CI at this commit succeeded (run 41698331878).
No local test/build/benchmark/browser command was running for this thread;
validation for this work is CI only by explicit user instruction.

## Inventory and redesign (recorded before implementation)

- Share the existing native dialog component across all modal content.
  - Journal duplicates showModal/close lifecycle but misses the focus wrapping
    and controlled Escape behavior already required by pause and win dialogs.
  - Keep native HTML modality; React supplies the button focus loop required
    by existing behavior. No additional library is needed for this glue.
- Author contextual guidance beside each room and derive bridge presence from
  the map. Leave deterministic game rules in simulation.ts.
  - App knows the company/beat room IDs and their special guidance.
  - App identifies the bridge room by ID rather than the actual bridge tiles.
  - Guidance compares message text against an initial-state sentinel. Use an
    empty initial message, already the representation for ordinary movement.
- Make CI execute the repository's validation order sequentially.
  - The existing workflow parallelizes lint, unit tests and build despite the
    sequential requirement. Keep one Playwright worker and all behavioral tests.
- Remove test capture scaffolding and assertions with no independent oracle last.
  - E2E sleeps and first-room-only extra moves exist solely to refresh committed
    screenshots; evidence generation need not be part of regression checks.
  - Music compares a function call with the identical call; the same test's
    distinct voices, pan and gain assertions already protect useful behavior.
  - Retain randomized deterministic replay: it also checks beat/path, capacity
    and terrain invariants and would detect mutation or nondeterminism.
- Remove implementation-restating comments; retain external/browser constraints,
  lint suppression explanations, music design rationale and atlas provenance.
- Remove Docker's extra hardcoded pnpm version; package.json already pins it.

## Intentional boundaries and special cases retained

Save parsing uses zod for shape and simulation replay for legality; terrain,
spawn and adjacency checks reject malformed paths before replay. Corrupt saves,
unavailable storage, rejected audio and service-worker operations remain
recoverable browser boundaries. No persistence format migration is needed.
The fixed atlas frames, three echo voices/tints, per-room authored solutions,
bridge wait exception and endpoint holding are current game/art requirements.
Phaser remains the sprite/scaling library. React owns accessible menus/controls.
The small production server supplies health, CSP and cache policy used by the
hosting scaffold; do not replace it with a development server. No new scripts,
dependencies, deployment, accounts, network gameplay or analytics.

## Review and validation

Implemented the inventory. The added journal regression extends the existing
modal E2E test: reverse Tab must wrap from Close to Back, forward Tab must
wrap back, and Escape must close and resume. This catches omitted shared-modal
wiring; expected behavior follows the established pause/win focus contract.
All other behavioral tests remain; only the identical-call music assertion and
screenshot capture scaffolding were removed. Audio's 300 ms sample collection
remains because MediaRecorder needs actual rendered audio, not scheduling alone.

First independent static review caught an incomplete lifecycle extraction;
fixed before commit. It also requested journal behavioral coverage and a single
owner for repeated company guidance; both addressed. No local tests or builds
run. CI and final review results follow.

Final independent static re-check found no remaining worthwhile issues. Local
oxlint passed; formatting completed and git diff --check was clean. No local
tests or builds were executed. CI is required before merge.
