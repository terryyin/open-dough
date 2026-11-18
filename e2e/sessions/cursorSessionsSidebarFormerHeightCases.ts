// Preference migration observed through the real Sessions sidebar and resize control.
// Registered by ./cursor-sessions-sidebar-size-kept.spec.ts.
import {
  keyStep,
  runningCursorSplit,
} from "../../dashboard/tests/cursorSessionsSidebarResizePage.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import { runningCursorParts } from "../../dashboard/tests/runningCursorList.ts";
import { showPage } from "../../dashboard/tests/runningCursorSessionsPage.ts";
import { expect, test } from "../../dashboard/tests/support/cursorStart.ts";

const formerHeightKey = "open-dough.sessionSidebar.runningCursorHeight";

test("a height saved under the former Sessions sidebar key is recovered once and later choices use the adopted key", async ({
  page,
  origin,
}) => {
  await showPage(page, origin);
  const shown = runningCursorParts(page);
  const split = runningCursorSplit(page, shown);
  await shown.button.click();
  await split.keepInBrowser(formerHeightKey, "280");
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, split.heightKey);
  await reloadUntilRead(page);
  await expect(shown.sidebar).toBeVisible();
  await split.expectCollapsed();
  await shown.header.click();
  await split.expectCursorHeight(await split.roomOf(), 280);
  expect(await split.keptHeight()).toBe("280");

  // A changed former value cannot override the adopted preference.
  await split.keepInBrowser(formerHeightKey, "340");
  await reloadUntilRead(page);
  await split.expectCollapsed();
  await shown.header.click();
  await split.expectDividerSays(280);
  await split.keyDivider("ArrowUp");
  const chosen = 280 + keyStep;
  await split.expectDividerSays(chosen);
  expect(await split.keptHeight()).toBe(String(chosen));
  await reloadUntilRead(page);
  await split.expectCollapsed();
  await shown.header.click();
  await split.expectCursorHeight(await split.roomOf(), chosen);
});
