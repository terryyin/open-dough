import { expect, onTestFinished } from "vitest";
import { cdp, page, type Locator } from "vitest/browser";
import { clippedSettingContent } from "./system-settings-reading.ts";

export const chromium = () =>
  cdp() as {
    send(method: string, params?: Record<string, unknown>): Promise<unknown>;
  };

export type SettingsViewport = {
  readonly width: number;
  readonly height: number;
};

const phonePortrait = { width: 390, height: 844 } as const;

export const settingsPhoneViewports = {
  portrait: phonePortrait,
  landscape: { width: phonePortrait.height, height: phonePortrait.width },
  reduced: { width: phonePortrait.width, height: 320 },
} as const;

export async function resizeSettingsViewport(view: SettingsViewport) {
  await page.viewport(view.width, view.height);
  await expect
    .poll(() => ({ width: innerWidth, height: innerHeight }))
    .toEqual(view);
}

export function settingsColourScheme() {
  const browser = chromium();
  const set = (features: readonly { name: string; value: string }[]) =>
    browser.send("Emulation.setEmulatedMedia", { features });
  onTestFinished(async () => {
    await set([]);
  });
  return (value: "light" | "dark") =>
    set([{ name: "prefers-color-scheme", value }]);
}

export async function enableSettingsTouch() {
  const browser = chromium();
  await browser.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  onTestFinished(async () => {
    await browser.send("Emulation.setTouchEmulationEnabled", {
      enabled: false,
    });
  });
  await expect
    .poll(() => matchMedia("(any-pointer: coarse)").matches)
    .toBe(true);
}

async function touchAt(x: number, y: number) {
  const frame = window.frameElement?.getBoundingClientRect();
  const browser = chromium();
  await browser.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x + (frame?.left ?? 0), y: y + (frame?.top ?? 0) }],
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

export async function touchSettingsControl(control: Locator) {
  await expect.element(control).toBeVisible();
  const target = control.element();
  target.scrollIntoView({ block: "center" });
  const { left, top, width, height } = target.getBoundingClientRect();
  await touchAt(left + width / 2, top + height / 2);
}

// Touch the control in its current position, without helping it scroll into view.
export async function tapSettingWhereShown(control: Locator) {
  await expect.element(control).toBeVisible();
  const target = control.element();
  const rect = target.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  expect(rect.width, "touch target width").toBeGreaterThanOrEqual(44);
  expect(rect.height, "touch target height").toBeGreaterThanOrEqual(44);
  expect(
    clippedSettingContent(target, "control"),
    "touch target is not clipped",
  ).toEqual([]);
  expect(target.contains(document.elementFromPoint(x, y))).toBe(true);
  let landed = false;
  const observeTouch = (event: Event) => {
    landed = event.target instanceof Node && target.contains(event.target);
  };
  window.addEventListener("pointerdown", observeTouch, true);
  try {
    await touchAt(x, y);
  } finally {
    window.removeEventListener("pointerdown", observeTouch, true);
  }
  expect(landed, "native touch lands on the intended control").toBe(true);
}

export async function readSettingText(content: Locator) {
  await expect.element(content).toBeVisible();
  const element = content.element();
  element.scrollIntoView({ block: "nearest" });
  expect(
    clippedSettingContent(element, "text"),
    "all setting text is in view and unclipped",
  ).toEqual([]);
  expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth + 1);
}
