import { expect, onTestFinished } from "vitest";
import { cdp, commands, page, type Locator } from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    tapMountedControl(selector: string): Promise<void>;
  }
}

export const narrowDialog = { width: 320, height: 640 };
export const twiceZoomedDialog = { width: 640, height: 450 };
export const phone = {
  portrait: { width: 390, height: 844 },
  landscape: { width: 844, height: 390 },
  short: { width: 390, height: 300 },
};

export async function resizeLaunchViewport({
  width,
  height,
}: typeof narrowDialog) {
  await page.viewport(width, height);
  await expect.poll(() => [innerWidth, innerHeight]).toEqual([width, height]);
}

const chromium = () =>
  cdp() as {
    send(method: string, params: Record<string, unknown>): Promise<unknown>;
  };

export async function useTwiceZoomedDevice() {
  const session = chromium();
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: 0,
    height: 0,
    deviceScaleFactor: 2,
    mobile: false,
  });
  onTestFinished(async () => {
    await session.send("Emulation.clearDeviceMetricsOverride", {});
  });
}

export async function zoomToTwoHundredPercent() {
  await resizeLaunchViewport(twiceZoomedDialog);
  await useTwiceZoomedDevice();
  await expect.poll(() => devicePixelRatio).toBe(2);
  expect([innerWidth, innerHeight]).toEqual([
    twiceZoomedDialog.width,
    twiceZoomedDialog.height,
  ]);
}

export function box(control: Locator) {
  return control.element().getBoundingClientRect().toJSON() as DOMRectReadOnly;
}

export async function tap(control: Locator) {
  let reachedControl = false;
  const observeTouch = (event: PointerEvent) => {
    if (
      event.pointerType === "touch" &&
      event.isTrusted &&
      event.target instanceof Node &&
      control.query()?.contains(event.target)
    ) {
      reachedControl = true;
    }
  };
  window.addEventListener("pointerdown", observeTouch, true);
  try {
    await commands.tapMountedControl(control.serialize().selector);
  } finally {
    window.removeEventListener("pointerdown", observeTouch, true);
  }
  expect(reachedControl, "native touch reaches the intended control").toBe(
    true,
  );
}

export function noSidewaysScroll(container: Locator) {
  const element = container.element();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    innerWidth + 1,
  );
  for (const part of [
    element,
    ...element.querySelectorAll(
      "form, fieldset, details, [role=group], .launch-dialog-body",
    ),
  ])
    expect(
      part.scrollWidth,
      part.getAttribute("class") ?? undefined,
    ).toBeLessThanOrEqual(part.clientWidth + 1);
}

export function controlsAreReachable(container: Locator) {
  for (const control of container
    .element()
    .querySelectorAll<HTMLElement>(
      "button, input:not([type=file]), select, summary, textarea, [role=button]",
    )) {
    if (control.getClientRects().length === 0) continue;
    const target =
      control instanceof HTMLInputElement && control.type === "radio"
        ? (control.labels?.[0] ?? control)
        : control;
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
    const { left, right, top, bottom, width, height } =
      target.getBoundingClientRect();
    const center = document.elementFromPoint(
      left + width / 2,
      top + height / 2,
    );
    expect(left, target.textContent).toBeGreaterThanOrEqual(-1);
    expect(right, target.textContent).toBeLessThanOrEqual(innerWidth + 1);
    expect(bottom, target.textContent).toBeGreaterThan(0);
    expect(top, target.textContent).toBeLessThan(innerHeight);
    expect(target.contains(center), target.textContent).toBe(true);
  }
}

export function textFitsViewport(control: Locator) {
  const range = document.createRange();
  range.selectNodeContents(control.element());
  for (const { left, right, top, bottom } of range.getClientRects()) {
    expect(left).toBeGreaterThanOrEqual(-1);
    expect(right).toBeLessThanOrEqual(innerWidth + 1);
    expect(top).toBeGreaterThanOrEqual(-1);
    expect(bottom).toBeLessThanOrEqual(innerHeight + 1);
  }
}

export function splitWords(control: Locator) {
  const walker = document.createTreeWalker(
    control.element(),
    NodeFilter.SHOW_TEXT,
  );
  const split: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const match of (node.textContent ?? "").matchAll(/\p{L}+/gu)) {
      const word = document.createRange();
      word.setStart(node, match.index);
      word.setEnd(node, match.index + match[0].length);
      if (
        new Set(
          Array.from(word.getClientRects(), (rect) => Math.round(rect.top)),
        ).size > 1
      )
        split.push(match[0]);
    }
  }
  return split;
}
