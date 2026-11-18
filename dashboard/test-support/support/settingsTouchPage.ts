import type { Locator } from "@playwright/test";
import { expect } from "./pageTest.ts";
import { scrollByTouch } from "../touchGestures.ts";

// Settings is ordinary page content: deliberately scroll a fact or editable
// field into view before reading it. Action checks never use this helper.
export async function readSetting(content: Locator) {
  await content.scrollIntoViewIfNeeded();
  const obscuredByHeader = () =>
    content.evaluate((element) => {
      // Modal content is above the page header in the browser's top layer.
      if (element.closest(":modal")) return 0;
      const shown = element.getBoundingClientRect();
      const bar = document
        .querySelector(".settings-bar")
        ?.getBoundingClientRect();
      return bar === undefined || bar.bottom <= 0
        ? 0
        : Math.max(0, bar.bottom - shown.top);
    });
  for (let stroke = 0; stroke < 8; stroke += 1) {
    const covered = await obscuredByHeader();
    if (covered === 0) break;
    await scrollByTouch(
      content.page(),
      content.page().locator(".settings-bar"),
      covered + 32,
    );
    await content.page().evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => {
            resolve();
          }),
        ),
    );
  }
  // Read rendered text, rather than a paragraph's fractional line-box edge.
  // Every text rectangle must fit the viewport and its scrolling ancestors.
  expect(
    await content.evaluate((element) => {
      let left = 0,
        top = 0,
        right = innerWidth,
        bottom = innerHeight;
      for (
        let at: Element | null = element;
        at;
        at = at.matches(":modal") ? null : at.parentElement
      ) {
        const style = getComputedStyle(at);
        const bounds = at.getBoundingClientRect();
        if (style.overflowX !== "visible") {
          left = Math.max(left, bounds.left + at.clientLeft);
          right = Math.min(right, bounds.left + at.clientLeft + at.clientWidth);
        }
        if (style.overflowY !== "visible") {
          top = Math.max(top, bounds.top + at.clientTop);
          bottom = Math.min(
            bottom,
            bounds.top + at.clientTop + at.clientHeight,
          );
        }
      }
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const clipped: string[] = [];
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        if (!text.textContent?.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(text);
        for (const rectangle of range.getClientRects()) {
          if (
            rectangle.left < left ||
            rectangle.right > right ||
            rectangle.top < top ||
            rectangle.bottom > bottom
          )
            clipped.push(text.textContent);
        }
      }
      return clipped;
    }),
    "all rendered setting text is in view and unclipped",
  ).toEqual([]);
  expect(
    await obscuredByHeader(),
    "the setting is below the settings header",
  ).toBe(0);
  expect(
    await content.evaluate(
      (element) => element.scrollWidth <= element.clientWidth + 1,
    ),
    "the setting is readable without sideways scrolling",
  ).toBe(true);
}
