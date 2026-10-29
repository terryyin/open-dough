import type { JSHandle, Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { box } from "./pageLayout.ts";

// A browser-side reading keeps its DOM predicate beside the frame it observes.
export type TouchReading = JSHandle<() => boolean>;

export function readAfterTouchFrame(reading: TouchReading) {
  return reading.evaluate(async (sample) => {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
    return sample();
  });
}

// Send native finger movement explicitly: Linux Chromium's synthesized scroll
// can deliver only touchstart/end. Split long drags into feasible in-view
// strokes. No DOM scroll position is assigned to supply the result.
export async function scrollByTouch(
  page: Page,
  area: Locator,
  distance: number,
  axis: "vertical" | "horizontal" = "vertical",
  untilShown?: TouchReading,
) {
  const bounds = await box(area);
  const browser = await page.context().newCDPSession(page);
  try {
    const vertical = axis === "vertical";
    const start = vertical ? bounds.y : bounds.x;
    const length = vertical ? bounds.height : bounds.width;
    const edge = Math.min(8, length / 2);
    const at = distance > 0 ? start + edge : start + length - edge;
    const view = await page.evaluate(
      (down) => (down ? innerHeight : innerWidth),
      vertical,
    );
    const room = distance > 0 ? view - edge - at : at - edge;
    const point = (movement: number) =>
      vertical
        ? { x: bounds.x + bounds.width / 2, y: at + movement }
        : { x: at + movement, y: bounds.y + bounds.height / 2 };
    expect(room, "room for an in-view finger stroke").toBeGreaterThan(0);
    const strokes = Math.ceil(Math.abs(distance) / room);
    const duration = Math.abs(distance) / strokes / 400;
    // A short reading window can lie between complete strokes. Once native
    // scrolling recognizes this finger, observe at most one pixel of movement
    // at a time and lift as soon as the requested content is wholly shown.
    const steps = untilShown ? Math.ceil(Math.abs(distance) / strokes) : 10;
    // Model a stationary finger before lifting, preserving the synthesized
    // gesture's preventFling behavior. These are input timestamps, not waits
    // for the page result; keep the whole gesture in the past.
    let timestamp = Date.now() / 1000 - strokes * (duration + 0.1);
    for (let stroke = 0; stroke < strokes; stroke += 1) {
      let shown = false;
      await browser.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [point(0)],
        timestamp,
      });
      for (let step = 1; step <= steps; step += 1) {
        await browser.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [point((distance * step) / (strokes * steps))],
          timestamp: timestamp + (duration * step) / steps,
        });
        if (untilShown) {
          shown = await readAfterTouchFrame(untilShown);
          if (shown) break;
        }
      }
      timestamp += duration + 0.1;
      await browser.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
        timestamp,
      });
      if (shown) return;
    }
  } finally {
    await browser.detach();
  }
}
