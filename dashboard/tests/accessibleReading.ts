// Shared accessibility observations for overview and story-readiness journeys:
// visible focus, polite live regions, contrast from computed styles, and
// reduced-motion settling. Journeys supply their own fixtures and assertions.

/// <reference lib="dom" />

import { expect, type Locator, type Page } from "@playwright/test";

// What the browser draws around the element that holds keyboard focus.
export async function focusIndication(page: Page) {
  return page.evaluate<{
    visible: boolean;
    style: string;
    width: number;
  }>(`(() => {
    const focused = document.activeElement;
    const style = getComputedStyle(focused);
    return {
      visible: focused.matches(":focus-visible"),
      style: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
    };
  })()`);
}

export async function expectFocusedAndIndicated(page: Page, stop: Locator) {
  await expect(stop).toBeFocused();
  const indication = await focusIndication(page);
  expect(indication.visible).toBe(true);
  expect(indication.style).not.toBe("none");
  expect(indication.width).toBeGreaterThanOrEqual(2);
}

// Whether assistive technology is offered each polite region at all, whatever
// it currently says: rendered, and not hidden by itself or anything around it.
// Each region is marked too, so that later text is known to arrive in the
// same element rather than in one inserted along with its text.
export const politeRegionsOfferedThenMarked = `(() =>
  ["[role='status']", "[aria-live='polite']"].map((selector) => {
    const region = document.querySelector(selector);
    region.dataset.known = selector;
    for (let at = region; at; at = at.parentElement) {
      const style = getComputedStyle(at);
      if (
        style.display === "none" ||
        style.visibility !== "visible" ||
        at.hidden ||
        at.getAttribute("aria-hidden") === "true"
      ) {
        return false;
      }
    }
    return true;
  })
)()`;

function relativeLuminance(channel: {
  r: number;
  g: number;
  b: number;
}): number {
  const toLinear = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(channel.r) +
    0.7152 * toLinear(channel.g) +
    0.0722 * toLinear(channel.b)
  );
}

function parseCssColor(color: string): { r: number; g: number; b: number } {
  const match = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/,
  );
  if (!match) {
    throw new Error(`Unsupported computed color: ${color}`);
  }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
  };
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(parseCssColor(foreground));
  const bg = relativeLuminance(parseCssColor(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

// Whether a computed colour paints anything: not `transparent` and not any
// colour with zero alpha.
function painted(color: string): boolean {
  return color !== "transparent" && !/^rgba\(.*,\s*0\)$/.test(color);
}

// The colour behind an element: the first painted background up its parent
// chain, starting at the element itself or, for what surrounds it, at its
// parent.
export async function colorBehind(
  locator: Locator,
  { includingItself }: { includingItself: boolean },
): Promise<string> {
  const backgrounds = await locator.evaluate((element, fromItself) => {
    const found: string[] = [];
    for (
      let at = fromItself ? element : element.parentElement;
      at;
      at = at.parentElement
    )
      found.push(getComputedStyle(at).backgroundColor);
    return found;
  }, includingItself);
  return backgrounds.find(painted) ?? "rgba(0, 0, 0, 0)";
}

// Normal text needs 4.5:1 against the color behind the badge.
export async function expectReadableContrast(locator: Locator, minimum = 4.5) {
  const color = await locator.evaluate(
    (element) => getComputedStyle(element).color,
  );
  const background = await colorBehind(locator, { includingItself: true });
  expect(
    contrastRatio(color, background),
    `contrast of ${await locator.textContent()}`,
  ).toBeGreaterThanOrEqual(minimum);
}

// A control needs 3:1 between what outlines it, its edge or else its fill,
// and the color behind it, so it is recognised as a control.
export async function expectControlContrast(locator: Locator, minimum = 3) {
  const own = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      edges: parseFloat(style.borderTopWidth) > 0 ? [style.borderTopColor] : [],
      fill: style.backgroundColor,
    };
  });
  const behind = await colorBehind(locator, { includingItself: false });
  const best = Math.max(
    0,
    ...[...own.edges, own.fill]
      .filter(painted)
      .map((color) => contrastRatio(color, behind)),
  );
  expect(
    best,
    `control contrast of ${(await locator.getAttribute("aria-label")) ?? (await locator.textContent())}`,
  ).toBeGreaterThanOrEqual(minimum);
}

// Every piece of text a reader reads in an area, and every control in it, as
// the caller names them: shown text is readable, and a shown control is
// readable and, while it can be used, recognisable (WCAG 1.4.11 exempts an
// inactive control). A password field shows no readable text of its own, so
// it is exempt from text contrast only. An area the caller says has controls
// fails when none is shown.
export async function expectReadableAndRecognisable(
  area: Locator,
  {
    texts,
    controls,
    hasControls,
  }: { texts: string; controls: string; hasControls: boolean },
) {
  for (const text of await area.locator(texts).all())
    if (await text.isVisible()) await expectReadableContrast(text);
  let checkedControls = 0;
  for (const control of await area.locator(controls).all()) {
    if (!(await control.isVisible())) continue;
    checkedControls += 1;
    if ((await control.getAttribute("type")) !== "password")
      await expectReadableContrast(control);
    if (await control.isEnabled()) await expectControlContrast(control);
  }
  if (hasControls)
    expect(checkedControls, "controls shown in the area").toBeGreaterThan(0);
}

// Detail and cards must settle immediately under reduced motion: no authored
// transition or animation that would delay placement or focus.
export async function expectImmediateMotion(locator: Locator) {
  const motion = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
      animationName: style.animationName,
    };
  });
  expect(
    motion.animationName === "none" || motion.animationDuration === "0s",
  ).toBe(true);
  const durations = motion.transitionDuration
    .split(",")
    .map((part) => part.trim());
  for (const duration of durations) {
    expect(duration === "0s" || duration === "0ms").toBe(true);
  }
}

// A 1280 by 1024 window under 400% browser zoom lays the page out in this many
// CSS pixels, so the narrow journey is also the zoomed one.
export const zoomedWindow = { width: 320, height: 256 };

// A narrow desktop window the dashboard frame's look is checked at.
export const narrowWindow = { width: 420, height: 900 };

// A 1280 by 900 window under 200% browser zoom halves its CSS viewport to this
// and doubles the device pixels per CSS pixel (`deviceScaleFactor: 2`), so it
// lays the page out as that zoomed window does.
export const twiceZoomedWindow = { width: 640, height: 450 };
