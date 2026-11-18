// Observations of the paused terminal text (./terminalSelectPage.ts) as text
// that scrolls through everything the terminal holds: what it hides beyond
// its box, finger strokes to its first and last line, and where the page's
// selection lies in it.
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { box } from "./pageLayout.ts";
import { pausedText } from "./terminalSelectPage.ts";
import { scrollByTouch } from "./touchGestures.ts";

// How much of the paused text lies beyond its box, above and below: what is
// left to scroll to its first and to its last line.
export function pausedHidden(panel: Locator) {
  return pausedText(panel).evaluate((text) => ({
    above: text.scrollTop,
    below: text.scrollHeight - text.clientHeight - text.scrollTop,
  }));
}

// Finger strokes on the paused text, each within its box and no longer than
// what is left to scroll, until the browser's own scrolling rests it at its
// first or its last line. No scroll position is assigned.
export async function scrollPausedByTouchTo(
  page: Page,
  panel: Locator,
  line: "first" | "last",
) {
  const text = pausedText(panel);
  const left = async () =>
    (await pausedHidden(panel))[line === "first" ? "above" : "below"];
  const reach = (await box(text)).height;
  // Whole pixels of a box and its content can differ from the resting place
  // by a pixel.
  for (let stroke = 0; stroke < 16 && (await left()) >= 2; stroke += 1) {
    // More than what is left, for the travel the browser spends recognizing
    // the stroke.
    const travel = Math.min((await left()) + 60, reach);
    await scrollByTouch(
      page,
      text,
      line === "first" ? travel : -travel,
      "vertical",
      undefined,
      text,
    );
  }
  expect(
    await left(),
    `the paused text rests at its ${line} line`,
  ).toBeLessThan(2);
}

// Where the page's selection lies in the paused text: how many rows of text
// it runs over, and whether all of it is within the paused text's box, where
// the developer sees it.
export function selectedPlace(panel: Locator) {
  return pausedText(panel).evaluate((text) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) throw new Error("Nothing is selected.");
    const drawn = [...selection.getRangeAt(0).getClientRects()].filter(
      ({ width }) => width > 0,
    );
    const within = text.getBoundingClientRect();
    return {
      rows: new Set(drawn.map(({ top }) => Math.round(top))).size,
      shown: drawn.every(
        ({ top, bottom }) =>
          top >= within.top - 1 && bottom <= within.bottom + 1,
      ),
    };
  });
}
