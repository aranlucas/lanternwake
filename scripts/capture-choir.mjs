import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { LEVELS } from "../src/game/levels.ts";

// Record the application's real synthesizer output; no microphone or external audio.
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    const NativeAudioContext = window.AudioContext;
    window.AudioContext = new Proxy(NativeAudioContext, {
      construct(target, args) {
        const context = Reflect.construct(target, args),
          output = context.createMediaStreamDestination();

        const create = context.createStereoPanner.bind(context);
        context.createStereoPanner = () => {
          const pan = create(),
            connect = pan.connect.bind(pan);

          pan.connect = (destination) => {
            connect(output);

            return connect(destination);
          };

          return pan;
        };

        window.choirCapture = {
          context,
          recorder: new MediaRecorder(output.stream),
          chunks: [],
        };
        window.choirCapture.recorder.ondataavailable = (event) =>
          window.choirCapture.chunks.push(event.data);

        return context;
      },
    });
  });
  await page.goto("http://127.0.0.1:4317");
  await page
    .locator('.world-ready[data-ready="true"]')
    .waitFor({ state: "attached" });
  await page.getByRole("button", { name: "Enable sound" }).click();
  await page.waitForTimeout(850);
  await page.getByRole("button", { name: "Open journal", exact: true }).click();
  await page.getByRole("button", { name: /Two wishes/ }).click();
  await page.evaluate(() => {
    document.activeElement.blur();
    window.choirCapture.recorder.start();
  });

  const keys = {
    right: "ArrowRight",
    left: "ArrowLeft",
    up: "ArrowUp",
    down: "ArrowDown",
    wait: "Space",
  };

  for (const [index, route] of LEVELS[1].solutions.entries()) {
    for (const direction of route) {
      const before = Number(
        await page.getByTestId("state").getAttribute("data-beat"),
      );

      await page.keyboard.press(keys[direction]);
      await expect(page.getByTestId("state")).toHaveAttribute(
        "data-beat",
        String(before + 1),
      );
      await page.waitForTimeout(420);
    }

    if (index < LEVELS[1].solutions.length - 1) {
      await page.keyboard.press("r");
      await page.waitForTimeout(850);
    }
  }

  await expect(page.getByTestId("state")).toHaveAttribute("data-won", "true");
  await page.waitForTimeout(1000);

  const recording = await page.evaluate(async () => {
    const capture = window.choirCapture;
    await new Promise((resolve) => {
      capture.recorder.onstop = resolve;
      capture.recorder.stop();
    });
    const encoded = await new Blob(capture.chunks).arrayBuffer();
    const audio = await capture.context.decodeAudioData(encoded);

    const channels = Array.from(
      { length: audio.numberOfChannels },
      (_, index) => audio.getChannelData(index),
    );

    const bytes = new Uint8Array(
        44 + audio.length * audio.numberOfChannels * 2,
      ),
      view = new DataView(bytes.buffer);

    const label = (offset, text) =>
      [...text].forEach((char, index) =>
        view.setUint8(offset + index, char.charCodeAt(0)),
      );

    label(0, "RIFF");
    view.setUint32(4, bytes.length - 8, true);
    label(8, "WAVE");
    label(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, audio.numberOfChannels, true);
    view.setUint32(24, audio.sampleRate, true);
    view.setUint32(28, audio.sampleRate * audio.numberOfChannels * 2, true);
    view.setUint16(32, audio.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    label(36, "data");
    view.setUint32(40, bytes.length - 44, true);

    let peak = 0,
      offset = 44,
      binary = "";

    for (let frame = 0; frame < audio.length; frame++)
      for (const channel of channels) {
        const value = Math.max(-1, Math.min(1, channel[frame]));
        peak = Math.max(peak, Math.abs(value));
        view.setInt16(offset, Math.round(value * 32767), true);
        offset += 2;
      }

    for (let offset = 0; offset < bytes.length; offset += 8192)
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));

    return {
      base64: btoa(binary),
      duration: audio.duration,
      sampleRate: audio.sampleRate,
      peak,
    };
  });

  if (recording.peak < 0.001 || recording.duration < 5)
    throw new Error("Audio recording is silent or incomplete");
  await mkdir("evidence", { recursive: true });
  await writeFile(
    "evidence/echo-choir.wav",
    Buffer.from(recording.base64, "base64"),
  );
  console.log(
    JSON.stringify({
      path: "evidence/echo-choir.wav",
      duration: recording.duration,
      sampleRate: recording.sampleRate,
      peak: recording.peak,
    }),
  );
} finally {
  await browser.close();
}
