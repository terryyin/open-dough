import { expect, onTestFinished } from "vitest";
import { chromium } from "./system-settings-browser.ts";

export function usageColourScheme() {
  const browser = chromium();
  const set = (features: readonly { name: string; value: string }[]) =>
    browser.send("Emulation.setEmulatedMedia", { features });
  onTestFinished(async () => {
    await set([]);
  });
  return (value: "light" | "dark") =>
    set([{ name: "prefers-color-scheme", value }]);
}

// The mounted viewport supplies the CSS dimensions. The device scale supplies
// the two device pixels per CSS pixel at 200% zoom.
export async function doubleUsageDeviceScale() {
  const browser = chromium();
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: 0,
    height: 0,
    deviceScaleFactor: 2,
    mobile: false,
  });
  onTestFinished(async () => {
    await browser.send("Emulation.clearDeviceMetricsOverride");
  });
  await expect.poll(() => window.devicePixelRatio).toBe(2);
}
