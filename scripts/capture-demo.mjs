import { chromium } from "@playwright/test";
import { rename, mkdir } from "node:fs/promises";

await mkdir("evidence/video", { recursive: true });

const browser = await chromium.launch();

const context = await browser.newContext({
  viewport: { width: 1200, height: 800 },
  recordVideo: { dir: "evidence/video", size: { width: 1200, height: 800 } },
});

const page = await context.newPage();

await page.goto("http://127.0.0.1:4317");

await page
  .locator('.world-ready[data-ready="true"]')
  .waitFor({ state: "attached" });

await page.waitForTimeout(900);

for (const key of ["ArrowRight", "ArrowRight"]) {
  await page.keyboard.press(key);
  await page.waitForTimeout(650);
}

await page.waitForTimeout(800);

await page.keyboard.press("r");

await page.waitForTimeout(1100);

for (let i = 0; i < 6; i++) {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(i === 2 ? 1300 : 650);
}

await page.waitForTimeout(1600);

const video = page.video();

await page.close();

await context.close();

const path = await video.path();

await rename(path, "evidence/lanternwake-demo.webm");

await browser.close();

console.log("Captured evidence/lanternwake-demo.webm");
