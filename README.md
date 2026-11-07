# Lanternwake

**Leave an echo. Become your own company.**

A small, illustrated browser puzzle about borrowing help from your past selves.
Walk onto a lantern pad, rewind, and your echo repeats that walk. It waits where
you left it while you take a different path. The first courtyard takes less than
a minute; later rooms need two or three echoes and a bridge with its own rhythm.

![An echo holds the moon pad while you cross the gate](evidence/first-echo.png)

Four authored rooms, original generated winter artwork, keyboard and touch
controls, step undo, echo recovery, a journal with gentle hints, an optional
musical echo choir, local saves, and a versioned offline cache. No accounts, analytics,
AI requests, or remote gameplay services.

## Play locally

Requires Node.js 24.8+ and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Open **http://127.0.0.1:4317**. Development: `pnpm dev` at **https://lanternwake.localhost**, served through [Portless](https://github.com/vercel-labs/portless) (a dev dependency); its first run may ask for `sudo` to bind port 443 and trust a local certificate.
Offline caching is enabled in the production build. Wait for **Ready for offline
play** before disconnecting; reopen the same browser and origin. The local
server must stay running for a fresh uncached browser, but a previously cached
browser can reload without network access.

Move with arrow keys or WASD. **R** rewinds and leaves an echo, **Space** waits,
**Z** undoes one step, and **Escape** pauses/resumes. Mobile provides direction
buttons; a neighboring stone can also be clicked or tapped. Enable sound using
the upper-right sound button. Sound starts muted after each page load.

With sound enabled, stepping stones become notes. Each echo repeats your tune
in its own register and stereo position. Wait to hear moving echoes on their
own; resting echoes stay silent. [Hear a real two-echo solution](evidence/echo-choir.wav).

The clock moves only when you do. A blocked move costs no beat. Echoes repeat
recorded positions and hold their endpoint. The moon bridge is bright on beats
2–3 of each four-beat cycle; entering it uses the **next** beat. Standing on it
is safe when it dims. Reaching the bell requires every pad held simultaneously.

Use **Take back your last echo** to resume its recorded path, or **Restart** for
a fresh room. Opening the journal or moving the tab into the background pauses
the game. Foreground return needs a deliberate resume.

## Verification

```sh
pnpm check       # Lint, TypeScript, and deterministic unit/property tests
pnpm build      # Production assets + content-versioned offline cache
pnpm test:e2e   # Full Chromium interaction tests, one worker
pnpm test:journeys # Deterministic tester-army/e2e save/recovery journeys, one worker
```

Install a browser only if it is absent: `pnpm exec playwright install chromium`.
Both browser suites use the production build, so run the commands in order.
The pinned `e2e` and `@e2e-dev/web` packages drive deterministic controls and
assertions with no model calls or credentials. CI disables framework telemetry
and uploads failure traces and reports.

[Gameplay clip](evidence/lanternwake-demo.webm) · [Mobile screenshot](evidence/mobile.png)
· [Design rationale and experiments](docs/research.md) · [Artwork provenance](docs/assets.md)
· [Feature roadmap](ROADMAP.md)

## Hosting scaffold and limits

Dockerfile and `railway.toml` are provided for a future Railway deployment.
The build is static. Keep any hosted demo private behind an access policy;
the prototype itself has no server authentication. Deployment requires explicit
authorization.

The scope is a short toy, not a full game: four rooms, no level editor, no cloud
sync, no real-time co-op, and no gamepad support. Browser tests target Chromium.
Safari/Firefox, physical touch devices, and the Docker/Railway runtime have no
recorded validation. Audio balance still needs human listening, and the game
has not had a complete screen-reader gameplay audit. Echo readability on a
Canvas fallback also needs checking because tint may differ from WebGL.

The time-loop mechanic has prior art. Lanternwake's experiment is its quiet,
turn-based, position-replay interpretation and atmosphere. See the research
brief rather than treating it as a new genre.
