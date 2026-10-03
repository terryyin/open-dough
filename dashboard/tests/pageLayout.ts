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
// when its content fits and no ancestor clips it. Parts cut by design, inside
// any of the `cutByDesign` selectors, are not counted.
const notReadWhole = (cutByDesign: readonly string[]) => `(() => {
  const keptFromSight = ${keptFromSight};
  const cutByDesign = ${JSON.stringify(cutByDesign.join(", "))};
  return [...document.body.querySelectorAll("*")]
    .filter((element) => {
      if (!(element instanceof HTMLElement) || keptFromSight(element) || element.getBoundingClientRect().height === 0) return false;
      if (cutByDesign !== "" && element.closest(cutByDesign)) return false;
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

// The page fits the window and its text is read whole, apart from parts that
// are cut by design and read whole elsewhere, such as a Sessions sidebar
// entry's title, or a terminal's own scrolling screen.
export async function expectNoSidewaysScrollAndWholeText(
  page: Page,
  cutByDesign: readonly string[] = [],
) {
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    ),
    "the page does not scroll sideways",
  ).toBe(true);
  expect(await page.evaluate(pastTheWindow), "past the window").toEqual([]);
  expect(
    await page.evaluate(notReadWhole(cutByDesign)),
    "not read whole",
  ).toEqual([]);
}

// Neither the page nor anything inside an area, such as a dialog, scrolls
// sideways.
export async function expectNoSidewaysScrollIn(page: Page, area: Locator) {
  expect(
    await page.evaluate(
      "document.documentElement.scrollWidth <= document.documentElement.clientWidth",
    ),
    "the page does not scroll sideways",
  ).toBe(true);
  expect(
    await area.evaluate((element) =>
      [element, ...element.querySelectorAll("*")]
        .filter((inner) => inner.scrollWidth > inner.clientWidth + 1)
        .map((inner) => inner.tagName),
    ),
    "scrolls sideways inside",
  ).toEqual([]);
}

export async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) {
    throw new Error(`No visible box for ${locator.toString()}`);
  }
  return found;
}

// Presses the control with the mouse where it shows. Locator.click() would
// first scroll the window to bring a pinned control into view, which a
// developer's click never does, moving the page a journey compares.
export async function pressWhereShown(control: Locator) {
  const { x, y, width, height } = await box(control);
  await control.page().mouse.click(x + width / 2, y + height / 2);
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

// Every control in an area, such as a dialog's scrolling body, can be scrolled
// whole into the window and out from under every part that clips it, and
// every part that clips it, but holds more than it shows, lets the reader
// scroll it, so none is out of reach. Fractions of a pixel left by scrolling
// do not count.
function clippedEdges(element: Element) {
  const box = element.getBoundingClientRect();
  const clips = [{ left: 0, top: 0, right: innerWidth, bottom: innerHeight }];
  let unscrollable = 0;
  const scrolls = (overflow: string) =>
    overflow === "auto" || overflow === "scroll";
  for (let at = element.parentElement; at; at = at.parentElement) {
    const style = getComputedStyle(at);
    if (style.overflowX === "visible" && style.overflowY === "visible")
      continue;
    clips.push(at.getBoundingClientRect());
    if (
      (at.scrollHeight > at.clientHeight + 1 && !scrolls(style.overflowY)) ||
      (at.scrollWidth > at.clientWidth + 1 && !scrolls(style.overflowX))
    )
      unscrollable += 1;
  }
  return (
    unscrollable +
    clips.filter(
      (clip) =>
        box.left < clip.left - 1 ||
        box.top < clip.top - 1 ||
        box.right > clip.right + 1 ||
        box.bottom > clip.bottom + 1,
    ).length
  );
}

export async function expectEveryControlReachable(area: Locator) {
  const controls = area.locator("button, input, select, textarea, summary");
  expect(await controls.count()).toBeGreaterThan(0);
  for (const control of await controls.all()) {
    if (!(await control.isVisible())) continue;
    await control.scrollIntoViewIfNeeded();
    expect(
      await control.evaluate(clippedEdges),
      `${(await control.textContent()) ?? ""} is cut by what clips it`,
    ).toBe(0);
  }
}
