import { expect, onTestFinished } from "vitest";
import { cdp, type Locator } from "vitest/browser";

const chromium = () =>
  cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };

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

export async function touchUsageControl(control: Locator) {
  await expect.element(control).toBeVisible();
  const target = control.element();
  target.scrollIntoView({ block: "center" });
  const bounds = target.getBoundingClientRect();
  const frame = window.frameElement?.getBoundingClientRect();
  const x = (frame?.left ?? 0) + bounds.left + bounds.width / 2;
  const y = (frame?.top ?? 0) + bounds.top + bounds.height / 2;
  const browser = chromium();
  await browser.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  try {
    await browser.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  } catch (error) {
    await browser.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    throw error;
  }
}
