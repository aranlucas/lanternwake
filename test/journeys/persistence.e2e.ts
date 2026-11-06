/* eslint-disable no-await-in-loop -- Each input depends on the previous game beat. */
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("a saved echo survives reload and completes the room and journal", async ({
  app,
  screen,
  browser,
}) => {
  await app.open();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await browser.keyboard.press("ArrowRight");
  await browser.keyboard.press("ArrowRight");
  await screen.getByRole("button", "Rewind & leave an echo").tap();
  await browser.keyboard.press("ArrowRight");
  await expect(screen.getByTestId("beat")).toContainText("Beat 01");
  await expect(screen.getByTestId("echo-count")).toHaveText("1 echo beside you");

  await browser.reload();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await expect(screen.getByTestId("beat")).toContainText("Beat 01");
  await expect(screen.getByTestId("echo-count")).toHaveText("1 echo beside you");
  await expect(screen.getByRole("button", "Enable sound")).toBeVisible();

  for (let i = 0; i < 5; i++) {
    await browser.keyboard.press("ArrowRight");
  }

  await expect(screen.getByRole("dialog", "A little more morning.")).toBeVisible();
  await screen.getByRole("button", "The next little moment").tap();
  await expect(browser.locator(".chapter-title")).toContainText("Two wishes");
  await browser.reload();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await expect(browser.locator(".chapter-title")).toContainText("Two wishes");
  await screen.getByRole("button", "Open journal").tap();
  await expect(screen.getByRole("button", /A little company/)).toContainText("Completed");
  await screen.getByRole("button", "Back to the garden").tap();
  await browser.keyboard.press("ArrowRight");
  await expect(screen.getByTestId("beat")).toContainText("Beat 01");
});

test("corrupt saves recover and denied storage still permits a complete game", async ({
  app,
  screen,
  browser,
}) => {
  await app.open();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await browser.evaluate(() => {
    localStorage.setItem("lanternwake:v1", "{broken");

    return null;
  });
  await browser.reload();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await expect(screen.getByTestId("beat")).toContainText("Beat 00");
  await expect(screen.getByTestId("echo-count")).toHaveText("No echoes yet");
  await browser.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage denied by browser policy", "SecurityError");
      },
    });
  });
  await browser.reload();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await expect(
    screen.getByText("This browser cannot save your place. You can still play this visit."),
  ).toBeVisible();
  await browser.keyboard.press("ArrowRight");
  await browser.keyboard.press("ArrowRight");
  await screen.getByRole("button", "Rewind & leave an echo").tap();

  for (let i = 0; i < 6; i++) {
    await browser.keyboard.press("ArrowRight");
  }

  await expect(screen.getByRole("dialog", "A little more morning.")).toBeVisible();
});

test("neighboring lower stones accept pointer input through the decorative footer", async ({
  app,
  screen,
  browser,
}) => {
  await browser.setViewport({ width: 1080, height: 720 });
  await app.open();
  await expect(browser.locator(".world-ready")).toHaveAttribute("data-ready", "true");
  await screen.getByRole("button", "Open journal").tap();
  await screen.getByRole("button", /The last light/).tap();
  await browser.keyboard.press("ArrowRight");
  await browser.keyboard.press("ArrowRight");
  await screen.getByRole("button", "Rewind & leave an echo").tap();
  await expect(screen.getByTestId("echo-count")).toHaveText("1 echo beside you");
  await expect(screen.getByRole("button", "Take back your last echo")).toBeVisible();
  await browser.keyboard.press("ArrowRight");
  await browser.keyboard.press("ArrowDown");
  await expect(screen.getByTestId("state")).toHaveAttribute("data-y", "4");

  // Original board coordinates of the adjacent stone (column 2, row 5).
  // Scale from the real canvas box so the click tests Phaser and DOM hit testing.
  const target = await browser.evaluate(() => {
    const canvas = document.querySelector("canvas");

    if (!canvas) {
      throw new Error("Expected the rendered garden canvas");
    }

    const rect = canvas.getBoundingClientRect();

    return { x: rect.left + (485 / 1536) * rect.width, y: rect.top + (645 / 1024) * rect.height };
  });

  await app.screenshot("before-lower-stone-click");
  await browser.mouse.move(target.x, target.y);
  await browser.mouse.down();
  await browser.mouse.up();
  await expect(screen.getByTestId("state")).toHaveAttribute("data-y", "5");
  await expect(screen.getByTestId("beat")).toContainText("Beat 03");
});
