// How the page lies in the window, measured by asking the browser. The
// whole-page measurements look at every element on the page, so they name no
// part of the stylesheet; the others compare the boxes of parts a journey found.

import { expect, type Locator, type Page } from "@playwright/test";

// Text held in a box of one pixel is shown to no one by sight: it is kept for
// assistive technology, which is given it whole. Neither whole-page measurement
// counts it; were it to widen the page, the sideways-scroll check would say so.
const keptFromSight = `(element) => {
  for (let at = element; at; at = at.parentElement) {
    const box = at.getBoundingClientRect();
    if (box.width <= 1 && box.height <= 1 && at.textContent !== "") return true;
  }
  return false;
}`;

// Elements that reach past either side of the window.
const pastTheWindow = `(() => {
  const keptFromSight = ${keptFromSight};
  const limit = document.documentElement.clientWidth;
  return [...document.body.querySelectorAll("*")]
    .filter((element) => {
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        (box.left < -0.5 || box.right > limit + 0.5) &&
        !keptFromSight(element)
      );
    })
    .map((element) => element.tagName + ": " + (element.textContent ?? "").slice(0, 60));
})()`;

// Elements whose content is wider than they are, cut short, or ended with an
// ellipsis: text that a reader could not read whole. One-line text is readable
// when its content fits and no ancestor clips it.
const notReadWhole = `(() => {
  const keptFromSight = ${keptFromSight};
  return [...document.body.querySelectorAll("*")]
    .filter((element) => {
      if (!(element instanceof HTMLElement) || keptFromSight(element) || element.getBoundingClientRect().height === 0) return false;
      const tooNarrowForItsContent =
        element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1;
      // A native form control (the project selector) renders and clips its
      // own value by platform widget rules, not by authored overflow or
      // white-space; browsers give it "overflow: clip" and "white-space: pre"
      // by default regardless of authored CSS. Whether its content actually
      // fits is still checked; the authored-CSS heuristics below are not.
      if (element.matches("select, input, textarea")) return tooNarrowForItsContent;
      const style = getComputedStyle(element);
      return (
        tooNarrowForItsContent ||
        style.textOverflow === "ellipsis" ||
        (style.overflowX !== "visible" && style.overflowX !== "auto") ||
        (style.overflowY !== "visible" && style.overflowY !== "auto")
      );
    })
    .map((element) => element.tagName + ": " + (element.textContent ?? "").slice(0, 60));
})()`;

export async function expectNoSidewaysScrollAndWholeText(page: Page) {
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    ),
    "the page does not scroll sideways",
  ).toBe(true);
  expect(await page.evaluate(pastTheWindow), "past the window").toEqual([]);
  expect(await page.evaluate(notReadWhole), "not read whole").toEqual([]);
}

export async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) {
    throw new Error(`No visible box for ${locator.toString()}`);
  }
  return found;
}

// Each part ends before the next begins, across the page or down it.
async function expectEachEndsBeforeNext(
  partsInOrder: Locator[],
  start: "x" | "y",
  extent: "width" | "height",
) {
  const boxes = await Promise.all(partsInOrder.map(box));
  boxes.slice(1).forEach((next, index) => {
    const previous = boxes[index];
    expect(
      (previous?.[start] ?? 0) + (previous?.[extent] ?? 0),
      `part ${index + 1} ends before part ${index + 2} begins`,
    ).toBeLessThanOrEqual(next[start] + 0.5);
  });
}

export async function expectSideBySideInOrder(partsInOrder: Locator[]) {
  await expectEachEndsBeforeNext(partsInOrder, "x", "width");
}

export async function expectStackedInOrder(partsInOrder: Locator[]) {
  await expectEachEndsBeforeNext(partsInOrder, "y", "height");
}

export async function expectInside(inner: Locator, outer: Locator) {
  const [inside, around] = await Promise.all([box(inner), box(outer)]);
  expect(inside.x).toBeGreaterThanOrEqual(around.x - 0.5);
  expect(inside.x + inside.width).toBeLessThanOrEqual(
    around.x + around.width + 0.5,
  );
  expect(inside.y).toBeGreaterThanOrEqual(around.y - 0.5);
  expect(inside.y + inside.height).toBeLessThanOrEqual(
    around.y + around.height + 0.5,
  );
}
