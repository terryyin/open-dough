// Browser observations for reachable controls; native scrolling and taps stay real.
import { expect, type Locator } from "@playwright/test";
import { box } from "./partArrangement.ts";

// Touch an already visible, comfortably sized control at its current location.
// No locator activation may scroll a clipped target into view for this check.
export async function tapWhereShown(control: Locator) {
  const { x, y, width, height } = await box(control);
  expect(width, "touch target width").toBeGreaterThanOrEqual(44);
  expect(height, "touch target height").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate(clippedEdges, false),
    "touch target is not clipped",
  ).toBe(0);
  expect(
    await control.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(
          rect.x + rect.width / 2,
          rect.y + rect.height / 2,
        ),
      );
    }),
    "touch reaches the intended control",
  ).toBe(true);
  await control.page().touchscreen.tap(x + width / 2, y + height / 2);
}

// Every control in an area, such as a dialog's scrolling body, can be scrolled
// whole into the window and out from under every part that clips it, and
// every part that clips it, but holds more than it shows, lets the reader
// scroll it, so none is out of reach. Fractions of a pixel left by scrolling
// do not count.
function clippedEdges(element: Element, requireScrollableOverflow = true) {
  const box = element.getBoundingClientRect();
  const clips = [{ left: 0, top: 0, right: innerWidth, bottom: innerHeight }];
  let unscrollable = 0;
  const scrolls = (overflow: string) =>
    overflow === "auto" || overflow === "scroll";
  // A modal dialog lies in the top layer, out of reach of what clips the
  // parts around it in the page, such as the Board's view.
  for (
    let at = element.parentElement;
    at;
    at = at.matches(":modal") ? null : at.parentElement
  ) {
    const style = getComputedStyle(at);
    if (style.overflowX === "visible" && style.overflowY === "visible")
      continue;
    const rect = at.getBoundingClientRect();
    clips.push({
      left: style.overflowX === "visible" ? -Infinity : rect.left,
      right: style.overflowX === "visible" ? Infinity : rect.right,
      top: style.overflowY === "visible" ? -Infinity : rect.top,
      bottom: style.overflowY === "visible" ? Infinity : rect.bottom,
    });
    if (
      (style.overflowY !== "visible" &&
        at.scrollHeight > at.clientHeight + 1 &&
        !scrolls(style.overflowY)) ||
      (style.overflowX !== "visible" &&
        at.scrollWidth > at.clientWidth + 1 &&
        !scrolls(style.overflowX))
    )
      unscrollable += 1;
  }
  return (
    (requireScrollableOverflow ? unscrollable : 0) +
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
    const clipped = await control.evaluate(clippedEdges);
    const message =
      clipped === 0
        ? "the control is not clipped"
        : `${(await control.textContent()) ?? ""} is cut by what clips it`;
    expect(clipped, message).toBe(0);
  }
}
