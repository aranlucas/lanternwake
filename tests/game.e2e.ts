import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { LEVELS } from "../src/game/levels.ts";
import type { Direction } from "../src/game/types.ts";

const keys: Record<Direction, string> = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", wait: "Space" };
type AudioTrace = { contexts: AudioContext[]; starts: { frequency: number; waveform: OscillatorType }[]; active: Set<OscillatorNode>; maxActive: number };
declare global { interface Window { audioTrace: AudioTrace } }
async function open(page: Page) { await page.goto("/"); await expect(page.locator(".world-ready")).toHaveAttribute("data-ready", "true"); }
async function steps(page: Page, path: Direction[]) {
  for (const direction of path) {
    const previous = Number(await page.getByTestId("state").getAttribute("data-beat"));
    await page.keyboard.press(keys[direction]); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", String(previous + 1));
  }
}
test("first echo reveals the mechanic and all four rooms finish through keyboard input", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", e => { if (e.type() === "error") errors.push(e.text()); });
  const outgoing: string[] = []; page.on("request", request => { const url = new URL(request.url()); if (["http:", "https:"].includes(url.protocol) && url.origin !== "http://127.0.0.1:4317") outgoing.push(request.url()); });
  await open(page); await expect(page).toHaveTitle(/Lanternwake/);
  await page.waitForTimeout(200); await page.screenshot({ path: "evidence/desktop.png", fullPage: true });
  for (const [chapter, level] of LEVELS.entries()) {
    await expect(page.getByTestId("state")).toHaveAttribute("data-level", level.id);
    for (const [index, path] of level.solutions.entries()) {
      await steps(page, path);
      if (index < level.solutions.length - 1) {
        await page.keyboard.press("r"); await expect(page.getByTestId("state")).toHaveAttribute("data-echoes", String(index + 1));
        if (chapter === 0) {
          await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight");
          await page.waitForTimeout(220); await page.screenshot({ path: "evidence/first-echo.png", fullPage: true });
          await page.keyboard.press("z"); await page.keyboard.press("z"); await page.keyboard.press("z");
        }
      }
    }
    await expect(page.getByTestId("state")).toHaveAttribute("data-won", "true");
    if (chapter === 3) await page.screenshot({ path: "evidence/morning.png", fullPage: true });
    await page.getByRole("button", { name: chapter === 3 ? "Wander again" : "The next little moment" }).click();
  }
  await expect(page.getByTestId("state")).toHaveAttribute("data-level", "company");
  await page.getByRole("button", { name: "Open journal", exact: true }).click();
  await expect(page.locator(".chapter-complete").filter({ hasText: "Completed" })).toHaveCount(4);
  expect(errors).toEqual([]); expect(outgoing).toEqual([]);
});
test("undo, echo recovery, pause, restart and foreground return preserve control", async ({ page }) => {
  await open(page); await steps(page, ["right", "right"]);
  await page.keyboard.press("ArrowRight"); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "2");
  await page.keyboard.press("r"); await steps(page, ["right"]);
  await page.getByRole("button", { name: "Undo step", exact: true }).click(); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "0");
  await page.getByRole("button", { name: "Take back your last echo" }).click(); await expect(page.getByTestId("state")).toHaveAttribute("data-echoes", "0"); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "2");
  await page.getByRole("button", { name: "Pause game" }).click(); await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "2"); await page.getByRole("button", { name: "Keep wandering" }).click();
  await page.getByRole("button", { name: "Restart", exact: true }).click(); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "0");
  // Deterministic visibility event: browser frame timing is intentionally absent from game rules.
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByTestId("state")).toHaveAttribute("data-paused", "true");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.getByRole("button", { name: "Keep wandering" }).click(); await steps(page, ["right"]);
  await page.getByRole("button", { name: "Enable sound" }).click(); await expect(page.getByRole("button", { name: "Mute sound" })).toBeVisible();
});
test("service worker caches the real artwork and game; offline reload restores an in-progress echo", async ({ page, context }) => {
  await open(page); await expect(page.getByText("Ready for offline play")).toBeVisible();
  await steps(page, ["right", "right"]); await page.keyboard.press("r"); await steps(page, ["right"]);
  await page.evaluate(async () => { if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
  await context.setOffline(true); await page.reload();
  await expect(page.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("state")).toHaveAttribute("data-echoes", "1"); await expect(page.getByTestId("state")).toHaveAttribute("data-beat", "1");
  await steps(page, ["right", "right", "right", "right", "right"]); await expect(page.getByTestId("state")).toHaveAttribute("data-won", "true");
  await context.setOffline(false);
});
test("mobile touch controls finish a room and reduced-motion layout does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" }); await open(page);
  const right = page.getByRole("button", { name: "Move right", exact: true });
  await right.click(); await right.click(); await page.getByRole("button", { name: "Rewind & leave an echo", exact: true }).click();
  await right.click(); await right.click();
  await page.waitForTimeout(100); await page.screenshot({ path: "evidence/mobile.png", fullPage: true });
  for (let i = 0; i < 4; i++) await right.click();
  await expect(page.getByTestId("state")).toHaveAttribute("data-won", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "The next little moment" }).click();
  await page.getByRole("button", { name: "Open journal", exact: true }).click(); await page.getByRole("button", { name: "A gentle nudge" }).click();
  await expect(page.locator(".hint")).toBeVisible(); await page.getByRole("button", { name: "Back to the garden" }).click();
  await expect(page.getByTestId("state")).toHaveAttribute("data-paused", "false");
});

test("native game dialogs contain focus and Escape resumes only the pause screen", async ({ page }) => {
  await open(page); await steps(page, ["right"]);
  await page.getByRole("button", { name: "Pause game" }).click();
  const resume = page.getByRole("button", { name: "Keep wandering" });
  await expect(resume).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
  await page.keyboard.press("r"); await expect(page.getByTestId("state")).toHaveAttribute("data-echoes", "0");
  await page.keyboard.press("Escape"); await expect(page.getByTestId("state")).toHaveAttribute("data-paused", "false");
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await steps(page, LEVELS[0].solutions[0]); await page.keyboard.press("r"); await steps(page, LEVELS[0].solutions[1]);
  await expect(page.getByRole("button", { name: "The next little moment" })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(page.getByRole("button", { name: "Open the journal", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
  await page.keyboard.press("Escape"); await expect(page.getByRole("dialog", { name: "A little more morning." })).toBeVisible();
  await expect(page.getByTestId("state")).toHaveAttribute("data-paused", "false");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.locator("dialog.game-dialog[open]")).toHaveCount(1);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); });
  await page.getByRole("button", { name: "The next little moment" }).click();
  await expect(page.getByTestId("state")).toHaveAttribute("data-level", "wishes");
  await expect(page.getByTestId("state")).toHaveAttribute("data-paused", "false");
});

test("real Web Audio plays recorded echo voices only after opt-in and stops on pause or mute", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const trace: AudioTrace = { contexts: [], starts: [], active: new Set(), maxActive: 0 };
    window.audioTrace = trace;
    const NativeAudioContext = window.AudioContext;
    window.AudioContext = new Proxy(NativeAudioContext, {
      construct(target, args) {
        const context = Reflect.construct(target, args) as AudioContext;
        trace.contexts.push(context);
        const create = context.createOscillator.bind(context);
        context.createOscillator = () => {
          const oscillator = create(), start = oscillator.start.bind(oscillator), disconnect = oscillator.disconnect.bind(oscillator);
          oscillator.start = (when = 0) => {
            trace.starts.push({ frequency: oscillator.frequency.value, waveform: oscillator.type });
            trace.active.add(oscillator); trace.maxActive = Math.max(trace.maxActive, trace.active.size);
            start(when);
          };
          oscillator.disconnect = () => { trace.active.delete(oscillator); disconnect(); };
          return oscillator;
        };
        return context;
      },
    });
  });
  await open(page); await steps(page, ["right"]);
  expect(await page.evaluate(() => window.audioTrace.contexts.length)).toBe(0);
  await page.getByRole("button", { name: "Enable sound" }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.starts.length)).toBe(3);
  await page.evaluate(() => { window.audioTrace.starts = []; });
  await steps(page, ["right"]);
  const keeper = await page.evaluate(() => window.audioTrace.starts);
  expect(keeper).toHaveLength(1); expect(keeper[0].waveform).toBe("triangle");
  await page.keyboard.press("r"); await page.evaluate(() => { window.audioTrace.starts = []; (document.activeElement as HTMLElement).blur(); });
  await steps(page, ["wait", "wait"]);
  const echoes = await page.evaluate(() => window.audioTrace.starts);
  expect(echoes).toHaveLength(2); expect(echoes[1].waveform).toBe("sine");
  expect(echoes[1].frequency).toBeCloseTo(keeper[0].frequency * 2, 3);
  await steps(page, ["wait"]);
  expect(await page.evaluate(() => window.audioTrace.starts.length)).toBe(2);
  await page.getByRole("button", { name: "Pause game" }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.contexts[0].state)).toBe("suspended");
  expect(await page.evaluate(() => window.audioTrace.active.size)).toBe(0);
  await page.getByRole("button", { name: "Keep wandering" }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.contexts[0].state)).toBe("running");
  // Many immediate actions exercise the voice cap before their envelopes can finish.
  await page.evaluate(() => {
    for (let i = 0; i < 70; i++) document.body.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: i % 2 ? "ArrowLeft" : "ArrowRight" }));
  });
  expect(await page.evaluate(() => window.audioTrace.maxActive)).toBe(16);
  await page.getByRole("button", { name: "Mute sound" }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.contexts[0].state)).toBe("suspended");
  expect(await page.evaluate(() => window.audioTrace.active.size)).toBe(0);
  const mutedCount = await page.evaluate(() => window.audioTrace.starts.length);
  await page.keyboard.press("ArrowLeft");
  expect(await page.evaluate(() => window.audioTrace.starts.length)).toBe(mutedCount);
  await page.getByRole("button", { name: "Enable sound" }).click();
  await page.getByRole("button", { name: "Open journal", exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.contexts[0].state)).toBe("suspended");
  await page.getByRole("button", { name: /Two wishes/ }).click();
  await expect.poll(() => page.evaluate(() => window.audioTrace.contexts[0].state)).toBe("running");
  await page.evaluate(() => { window.audioTrace.starts = []; }); await steps(page, ["right"]);
  expect(await page.evaluate(() => window.audioTrace.starts.length)).toBe(1);
  await page.reload(); await expect(page.getByRole("button", { name: "Enable sound" })).toBeVisible();
  expect(await page.evaluate(() => window.audioTrace.contexts.length)).toBe(0);
  expect(errors).toEqual([]);
});
