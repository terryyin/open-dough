import type { Locator } from "@playwright/test";
import { clippedSettingContent } from "../../frontend-tests/configuration/system-settings-reading.ts";
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
    await content.evaluate(clippedSettingContent, "text" as const),
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
