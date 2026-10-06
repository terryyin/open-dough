// How the page lies in the window, measured by asking the browser. The
// whole-page measurements look at every element on the page, so they name no
// part of the stylesheet but the one every page cuts by design, the dashboard
// columns' view; how parts a journey found lie against one another is
// compared in partArrangement.ts.

import { expect, type Locator, type Page } from "@playwright/test";
import { box } from "./partArrangement.ts";

export {
  box,
  expectInReadingOrder,
  expectInside,
  expectOnOneLine,
  expectOnOneLineWhenRoom,
  expectSideBySideInOrder,
  expectStackedInOrder,
} from "./partArrangement.ts";

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

// The dashboard columns cut off the columns the page has no room to show, by
// design: a developer moves the view to them by an edge control
// (dashboardColumnsPage.ts `showColumn`). Inside the view, what lies wholly past its
// sides is a hidden column's, as is what holds such a part; anything else
// there must lie within the view, as everything else must within the window.
// The view's own clipping cuts nothing shown short.
const pagedView = JSON.stringify(".dashboard-columns-view");

// Elements that reach past either side of the window. What a part cut by
// design holds, such as a code line in an area that scrolls on its own, is
// not counted; the part itself still is.
const pastTheWindow = (cutByDesign: readonly string[]) => `(() => {
  const keptFromSight = ${keptFromSight};
  const cutByDesign = ${JSON.stringify(cutByDesign.join(", "))};
  const limit = document.documentElement.clientWidth;
  const hiddenColumns = new Set();
  for (const view of document.querySelectorAll(${pagedView})) {
    const sides = view.getBoundingClientRect();
    for (const inner of view.querySelectorAll("*")) {
      const box = inner.getBoundingClientRect();
      if (box.width === 0 || (box.right > sides.left + 0.5 && box.left < sides.right - 0.5)) continue;
      for (let at = inner; at !== view; at = at.parentElement) hiddenColumns.add(at);
    }
  }
  const pastTheView = (element, box) => {
    const view = element.parentElement?.closest(${pagedView});
    if (!view) return undefined;
    if (hiddenColumns.has(element)) return false;
    const sides = view.getBoundingClientRect();
    return box.left < sides.left - 0.5 || box.right > sides.right + 0.5;
  };
  return [...document.body.querySelectorAll("*")]
    .filter((element) => {
      const box = element.getBoundingClientRect();
      return (
        box.width > 0 &&
        (pastTheView(element, box) ??
          (box.left < -0.5 || box.right > limit + 0.5)) &&
        !keptFromSight(element) &&
        !(cutByDesign !== "" && element.parentElement?.closest(cutByDesign))
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
      if (element.matches(${pagedView})) return false;
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
  expect(
    await page.evaluate(pastTheWindow(cutByDesign)),
    "past the window",
  ).toEqual([]);
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

// Presses the control with the mouse where it shows. Locator.click() would
// first scroll the window to bring a pinned control into view, which a
// developer's click never does, moving the page a journey compares.
export async function pressWhereShown(control: Locator) {
  const { x, y, width, height } = await box(control);
  await control.page().mouse.click(x + width / 2, y + height / 2);
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
  // A modal dialog lies in the top layer, out of reach of what clips the
  // parts around it in the page, such as the dashboard columns' view.
  for (
    let at = element.parentElement;
    at;
    at = at.matches(":modal") ? null : at.parentElement
  ) {
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
