// Closed Sessions toggle badge: working then attention counts, named and
// ordered; fit in view without clipping.

import { expect, type Page } from "@playwright/test";
import { attentionWords, workingWords } from "../src/sessionShown.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";

export async function expectClosedToggleCounts(
  page: Page,
  working: number,
  attention: number,
): Promise<void> {
  const { workingBadge, badge, countsBadge } = sessionsSidebarParts(page);
  if (working > 0) {
    await expect(workingBadge).toHaveText(String(working));
    await expect(workingBadge).toHaveAccessibleName(workingWords(working));
  } else {
    await expect(workingBadge).toHaveCount(0);
  }
  if (attention > 0) {
    await expect(badge).toHaveText(String(attention));
    await expect(badge).toHaveAccessibleName(attentionWords(attention));
  } else {
    await expect(badge).toHaveCount(0);
  }
  if (working > 0 || attention > 0) {
    await expect(countsBadge.getByRole("img")).toHaveText([
      ...(working > 0 ? [String(working)] : []),
      ...(attention > 0 ? [String(attention)] : []),
    ]);
  }
}

export async function expectClosedToggleCountsFit(page: Page): Promise<void> {
  const { countsBadge } = sessionsSidebarParts(page);
  await expect(countsBadge).toBeInViewport({ ratio: 1 });
  expect(
    await countsBadge.evaluate(
      (element) =>
        element.scrollWidth <= element.clientWidth + 1 &&
        element.scrollHeight <= element.clientHeight + 1,
    ),
  ).toBe(true);
}
