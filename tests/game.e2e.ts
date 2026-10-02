import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { LEVELS } from "../src/game/levels.ts";
import type { Direction } from "../src/game/types.ts";

const keys: Record<Direction, string> = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", wait: "Space" };
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
