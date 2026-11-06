# Reliability audit — 2026-11-06

## Baseline and scope (recorded before implementation)

Clean isolated worktree at current remote default `6bb847df1039f01d743fb1bc8c90f7b4098572df`,
after the merged untangle pass (#25). Preserve its APIs, deterministic rules,
accessible React controls and Phaser renderer. Tests/builds run only in CI by
campaign policy, overriding local validation instructions. No deployment.

## Interface and boundary inventory

| Surface                              | Success and failure paths inspected                                                                                                                                                             | Existing evidence                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Pure simulation, four authored rooms | Steps, blocked terrain/gates, next-beat bridges, held endpoints, win, pause, undo, echo recovery, limits and restart                                                                            | Authored solutions, bridge/gate/undo/limit unit tests; keyboard journey through all rooms |
| Local save boundary                  | Zod shape/version/size/integer validation, terrain/adjacency/spawn checks, chronological legal replay, forged wins, deduplicated completion list, unavailable storage                           | Save rejection/round-trip unit tests; production offline save/reload E2E                  |
| React state/control flow             | Synchronous current-state ref for rapid actions; completion state and persistence; muted reload; keyboard modifiers, repeat suppression, touch controls, modal focus/Escape, journal navigation | Playwright control, mobile and modal tests                                                |
| Audio lifecycle                      | User opt-in, failed AudioContext initialization, pause/background suspension, mute, voice cap, oscillator/node cleanup, unmount                                                                 | Real Web Audio rendering and scheduling E2E; note-contract unit tests                     |
| Phaser lifecycle                     | Initialization before render updates, level switching, actor/tween replacement, reduced motion, adjacent-tile pointer actions, teardown                                                         | Production artwork readiness and mobile/reduced-motion E2E                                |
| Offline lifecycle                    | Production-only service worker, content-versioned cache, activation/readiness, offline reload and replay                                                                                        | Offline Chromium E2E finishes the saved room without network                              |
| Static HTTP/hosting                  | GET/HEAD, health, URL decoding, root containment, MIME/CSP/cache headers, file errors, process signals                                                                                          | Static inspection; hosting scaffold has no production deployment authorization            |
| CI/dependencies                      | Sequential check/build/browser tests; one worker; lockfile/runtime compatibility; failure evidence                                                                                              | Existing CI preserves unit and meaningful Playwright suites                               |

No account, tenant, remote transaction, gameplay request, provider call or
production data boundary exists. Authorization/isolation here means local
browser origin/storage isolation and the server's static-root boundary. No
remote retries or idempotency mechanism is warranted for deterministic local
actions. Storage exceptions are caught and gameplay remains usable with a
warning. Audio and service-worker promise rejections are handled. Server
request failures become HTTP errors.

## Findings and hypotheses before changes

No runtime defect is yet confirmed by the primary static pass. Independent
review is in progress; findings will be added with realistic triggers and
confidence before any corresponding fix.

The requested tester-army framework is applicable: this is a browser game with
accessible controls, local persistence and an observable completion journey.
The existing meaningful Playwright suite must remain. Add a deterministic
`e2e` journey that leaves an echo, reloads persisted progress, completes the
room, navigates onward and confirms journal completion. No agent/model calls,
credentials, external services or synthetic UI are needed. Also exercise
corrupt/unavailable storage at the actual browser boundary where appropriate.

Published npm metadata verified `e2e@0.23.0` and `@e2e-dev/web@0.15.5` (peer
`e2e >=0.22.1 <1`; both require Node `^22.22.3 || >=24.8.0`). The engine uses
Playwright core `1.64.1`, matching the existing Playwright suite. Read current
quickstart and CI docs; the installed guide/types will establish exact APIs.
Raise the project's runtime floor to 24.8 for this requested integration.
Disable framework telemetry. Preserve the existing CI gates and upload useful
failure traces/reports.

Rejected hypotheses from inspection:

- Saving a legal bridge wait is rejected: replay infers `wait`, and simulation
  explicitly allows waiting on a dim bridge. No change.
- Duplicate rapid steps lose state: `act` updates its current-state ref before
  React renders. No change.
- Restored sound starts without a gesture: sound deliberately starts false on
  each load. No change.
- All rooms must be locked until prior completion: journal's free room visits
  are documented behavior, not an authorization failure. No change.
- Echo IDs must be contiguous after taking back an echo: loops deliberately
  retain sequence history; IDs need only be distinct. No migration/rewrite.
- Terrain-only save checks admit impossible movement: replay also validates
  gates, timing, budgets and wins in chronological echo order. No change.

## Validation and review

No local tests, browser sessions, benchmarks or builds executed. CI results,
regression evidence, independent review and final outcome will be recorded here.

## Findings raised by independent static review (before fixes)

### Rejected — delayed audio enable after Pause

Independent review initially suggested a pending resume could retain a suspended
state until completion. Checking the Web Audio specification rejected that
premise: an allowed resume sets the control-thread state to running synchronously,
and the state getter exposes it. A deferred fake retaining the suspended state
would manufacture a failure. No concrete native trigger established; no audio
fix or artificial regression retained.

### F1 — decorative footer may intercept lower-stone clicks (candidate)

Location: `src/styles.css`, `.game-footer`; `src/game/renderer.ts`, tile input.
The absolute footer has a transparent 85px top padding and z-index 2 above
Phaser. In shorter desktop viewports, lower-row stones may be covered by this
padding. README promises adjacent-stone pointer movement. Add an actual
pointer regression at the rendered stone center and save pre-fix CI evidence.
Treat this as a candidate until CI demonstrates blocked movement; do not
change layout or styles speculatively.

### First CI execution and stronger pointer reproduction

[CI run 42303373515](https://github.com/aranlucas/lanternwake/actions/runs/42303373515)
at `d6969bc091ba5e39cd73927b830361860d64b877` passed lint/types, formatting,
production build, all 16 unit tests, all six existing Playwright flows and all
three new tester-army journeys. The new suite ran `e2e v0.23.0` with one
Chromium worker, no model and telemetry disabled. Reports and a screenshot
were uploaded as `browser-evidence`.

The initial pointer flow passed with no recorded echo. That does not establish
the reviewer's specific overlap condition: the echo-recovery button increases
the footer height. Extend this flow to record an echo and positively assert
that button is visible before clicking the lower stone. Retain the same
expected next beat/position. No game or CSS changes before this CI result.

Independent whole-repository and integration reviews completed with no other
concrete worthwhile findings. The installed guide/types confirm the config,
viewport, initialization, reload, storage injection and locator APIs used.
