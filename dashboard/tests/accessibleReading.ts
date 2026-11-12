// Shared accessibility observations for Board and story-readiness journeys:
// visible focus and moving it by Tab, polite live regions, contrast from
// computed styles, and reduced-motion settling. Journeys supply their own
// fixtures and assertions.

/// <reference lib="dom" />

import { expect, type Locator, type Page } from "@playwright/test";
import {
  composeBackgrounds,
  contrastRatio,
  painted,
  parseCssColor,
  toCssRgb,
} from "./composedColours.ts";

export { contrastRatio } from "./composedColours.ts";

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

// Moves the keyboard forward by Tab alone until `target` holds it.
export async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 40; step += 1) {
    if (await target.evaluate((element) => element === document.activeElement))
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error("Tab never reached the target");
}

// Escape closes the dialog and returns the keyboard to the action that opened
// it at once; a Tab right after it moves on to `next`, and the dialog's
// closing does not take the keyboard back.
export async function expectEscapeReturnsThenTabMovesOn(
  page: Page,
  { opener, dialog, next }: { opener: Locator; dialog: Locator; next: Locator },
) {
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog).toHaveCount(0);
  await expectFocusedAndIndicated(page, next);
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

// The colour behind an element after composing translucent fills up the
// parent chain, starting at the element itself or, for what surrounds it, at
// its parent.
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
  return composeBackgrounds(backgrounds);
}

// Normal text needs 4.5:1 against the composed colour behind it.
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
// and the colour behind it, so it is recognised as a control. A translucent
// fill is composed over that behind colour before measuring.
export async function expectControlContrast(locator: Locator, minimum = 3) {
  const own = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      edges: parseFloat(style.borderTopWidth) > 0 ? [style.borderTopColor] : [],
      fill: style.backgroundColor,
    };
  });
  const behind = await colorBehind(locator, { includingItself: false });
  const candidates: string[] = [...own.edges.filter(painted)];
  if (painted(own.fill)) {
    const fill = parseCssColor(own.fill);
    candidates.push(
      fill.a >= 0.999 ? toCssRgb(fill) : composeBackgrounds([own.fill, behind]),
    );
  }
  const best = Math.max(
    0,
    ...candidates.map((color) => contrastRatio(color, behind)),
  );
  expect(
    best,
    `control contrast of ${(await locator.getAttribute("aria-label")) ?? (await locator.textContent())}`,
  ).toBeGreaterThanOrEqual(minimum);
}

// A chart mark needs 3:1 between its painted stroke or fill and the composed
// colour of the chart surface behind it.
export async function expectChartMarkContrast(
  mark: Locator,
  minimum = 3,
): Promise<void> {
  const paints = await mark.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.stroke, style.fill].filter(
      (color) => color !== "none" && color !== "transparent",
    );
  });
  const behind = await colorBehind(mark, { includingItself: false });
  const best = Math.max(
    0,
    ...paints.filter(painted).map((color) => contrastRatio(color, behind)),
  );
  expect(best, "chart mark contrast").toBeGreaterThanOrEqual(minimum);
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
