// Read and touch the report where the browser currently shows it. Only real
// finger strokes supply scrolling; geometry observes, never repairs, access.
import type { Locator } from "@playwright/test";
import { expect } from "../dashboardTest.ts";
import { box } from "../pageLayout.ts";
import { scrollByTouch } from "../touchGestures.ts";

export function reportGeometry(target: Locator, words?: string) {
  return target.evaluate(
    (element, { words }) => {
      let bounds = [element.getBoundingClientRect()];
      if (words !== undefined) {
        const text = element.firstChild;
        const start = text?.textContent?.indexOf(words) ?? -1;
        if (text === null || start < 0) throw new Error("Missing report words");
        const range = document.createRange();
        range.setStart(text, start);
        range.setEnd(text, start + words.length);
        bounds = [...range.getClientRects()];
      }
      const panel = element.closest(".final-report");
      if (panel === null) throw new Error("Missing final report");
      const report = panel.getBoundingClientRect();
      const clips = [
        { left: 0, top: 0, right: innerWidth, bottom: innerHeight },
        report,
      ];
      for (let at = element.parentElement; at; at = at.parentElement) {
        const style = getComputedStyle(at);
        const rect = at.getBoundingClientRect();
        clips.push({
          left: style.overflowX === "visible" ? -Infinity : rect.left,
          right: style.overflowX === "visible" ? Infinity : rect.right,
          top: style.overflowY === "visible" ? -Infinity : rect.top,
          bottom: style.overflowY === "visible" ? Infinity : rect.bottom,
        });
      }
      const top = Math.min(...bounds.map((bound) => bound.top));
      const bottom = Math.max(...bounds.map((bound) => bound.bottom));
      return {
        top,
        bottom,
        reportTop: report.top,
        reportBottom: report.bottom,
        verticalOverflow:
          Math.max(0, Math.max(...clips.map((clip) => clip.top)) - top) +
          Math.max(0, bottom - Math.min(...clips.map((clip) => clip.bottom))),
        hit:
          bounds.length > 0 &&
          bounds.every((bound) =>
            element.contains(
              document.elementFromPoint(
                bound.x + bound.width / 2,
                bound.y + bound.height / 2,
              ),
            ),
          ),
        visible:
          bounds.length > 0 &&
          bounds.every(
            (bound) =>
              bound.height > 0 &&
              clips.every(
                (clip) =>
                  bound.top >= clip.top - 1 &&
                  bound.bottom <= clip.bottom + 1 &&
                  bound.left >= clip.left - 1 &&
                  bound.right <= clip.right + 1,
              ),
          ),
      };
    },
    { words },
  );
}

export async function readReportByTouch(
  panel: Locator,
  target: Locator,
  words?: string,
) {
  let shown = await reportGeometry(target, words);
  while (!shown.visible) {
    const room = await box(panel);
    // An overflow that moves the entire panel out of reach is the regression,
    // not an invitation for a locator to scroll the page back for the test.
    if (room.y < -1 || room.y + room.height < 44) break;
    const direction = shown.top < Math.max(shown.reportTop, 0) ? 1 : -1;
    const before = shown.verticalOverflow;
    await scrollByTouch(
      panel.page(),
      panel,
      direction * Math.min(60, room.height / 3),
    );
    await panel.page().evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            resolve();
          });
        }),
    );
    shown = await reportGeometry(target, words);
    // Movement must bring the whole target closer to fitting, including when
    // an oversized target could otherwise oscillate between clipped ends.
    if (shown.verticalOverflow >= before) break;
  }
  expect(
    shown,
    `whole report content fits the report, viewport, and clipping ancestors, with its own hit target after ordinary touch: ${JSON.stringify(shown)}`,
  ).toMatchObject({ visible: true, hit: true });
}
