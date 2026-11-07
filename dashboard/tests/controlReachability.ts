// Browser observations for reachable controls; native scrolling and taps stay real.
import { expect, type Locator } from "@playwright/test";

// How the page names what a touch point holds when it is the control itself,
// and where the page keeps what the last native touch landed on until read.
const touch = {
  intended: "the intended control",
  landingKey: "tapWhereShownLanding",
};

// What counts as a control an area must keep within reach.
const controls = "button, input, select, textarea, summary";

// Touch an already visible, comfortably sized control at its current location.
// No locator activation may scroll a clipped target into view for this check.
// The size and what lies at the touch point are measured in one browser turn,
// and that same point is touched; where the touch then lands is observed, so
// a control that moves or is covered in between fails rather than being
// silently missed.
export async function tapWhereShown(control: Locator) {
  expect(
    await control.evaluate(clipped, { within: "touch" } as const),
    "touch target is not clipped",
  ).toEqual([]);
  const shown = await control.evaluate((element, { intended, landingKey }) => {
    const describe = (found: EventTarget | null) =>
      !(found instanceof Element)
        ? "nothing"
        : element.contains(found)
          ? intended
          : [
              found.tagName,
              found.id ? `#${found.id}` : "",
              ...[...found.classList].map((name) => `.${name}`),
            ].join("");
    const { x, y, width, height } = element.getBoundingClientRect();
    const point = { x: x + width / 2, y: y + height / 2 };
    const atPoint = describe(document.elementFromPoint(point.x, point.y));
    if (atPoint === intended) {
      const landing = {
        on: "nothing",
        heard: (event: Event) => {
          landing.on = describe(event.target);
          removeEventListener("pointerdown", landing.heard, true);
        },
      };
      addEventListener("pointerdown", landing.heard, true);
      Reflect.set(window, landingKey, landing);
    }
    return { ...point, width, height, atPoint };
  }, touch);
  expect(shown.width, "touch target width").toBeGreaterThanOrEqual(44);
  expect(shown.height, "touch target height").toBeGreaterThanOrEqual(44);
  expect(shown.atPoint, "touch reaches the intended control").toBe(
    touch.intended,
  );
  await control.page().touchscreen.tap(shown.x, shown.y);
  expect(
    await control.page().evaluate((key) => {
      const landing = Reflect.get(window, key) as
        { on: string; heard: EventListener } | undefined;
      Reflect.deleteProperty(window, key);
      if (landing) removeEventListener("pointerdown", landing.heard, true);
      return landing?.on ?? "nothing";
    }, touch.landingKey),
    "native touch lands on the intended control",
  ).toBe(touch.intended);
}

// What is clipped, measured in the browser. For a touch, the control itself
// as it lies now: no part that clips it may cut it. In an area, such as a
// dialog's scrolling body, every visible control is scrolled into the window
// as Playwright's scrollIntoViewIfNeeded scrolls it (natively, centred where
// needed) and must then lie whole out from under every part that clips it,
// and every part that clips it, but holds more than it shows, lets the reader
// scroll it, so none is out of reach. Fractions of a pixel left by scrolling
// do not count. Each clipped control is named by its label or text.
async function clipped(
  subject: Element,
  scope: { within: "touch" } | { within: "area"; controls: string },
): Promise<string[]> {
  const clippedEdges = (
    element: Element,
    requireScrollableOverflow: boolean,
  ) => {
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
  };
  const named = (element: Element) =>
    `${element.getAttribute("aria-label") ?? element.textContent} is cut by what clips it`;
  if (scope.within === "touch")
    return clippedEdges(subject, false) === 0 ? [] : [named(subject)];
  // Only controls the reader can see are held to reach, judged as Playwright's
  // isVisible judges them: displayed, not hidden, and holding a box.
  const visible = (element: Element) => {
    const { width, height } = element.getBoundingClientRect();
    return (
      element.checkVisibility() &&
      getComputedStyle(element).visibility === "visible" &&
      width > 0 &&
      height > 0
    );
  };
  const checked = new Set<Element>();
  const found: string[] = [];
  for (;;) {
    const shown = [...subject.querySelectorAll(scope.controls)].filter(
      (control) => !checked.has(control) && visible(control),
    );
    if (shown.length === 0) return found;
    for (const control of shown) {
      checked.add(control);
      // Chromium's own scroll-if-needed, the one Playwright asks for.
      (
        control as Element & {
          scrollIntoViewIfNeeded(centerIfNeeded: boolean): void;
        }
      ).scrollIntoViewIfNeeded(true);
      if (clippedEdges(control, true) !== 0) found.push(named(control));
    }
    // The page hears that it scrolled at the next rendering update, before
    // that frame's callbacks; controls it reveals as it scrolls are shown by
    // then and checked in turn.
    await new Promise((settled) => requestAnimationFrame(settled));
  }
}

export async function expectEveryControlReachable(area: Locator) {
  expect(await area.locator(controls).count()).toBeGreaterThan(0);
  expect(
    await area.evaluate(clipped, { within: "area", controls } as const),
  ).toEqual([]);
}
