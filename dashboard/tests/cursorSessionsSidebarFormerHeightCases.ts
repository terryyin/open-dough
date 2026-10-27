// Preference migration observed through the real Sessions sidebar and resize control.
// Registered by ./cursor-sessions-sidebar-size-kept.spec.ts.
import {
  expectCollapsed,
  expectEdgeSays,
  expectSplit,
  heightKey,
  keepInBrowser,
  keptHeight,
  keyStep,
  roomOf,
} from "./cursorSessionsSidebarResizePage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { runningCursorParts, showPage } from "./runningCursorSessionsPage.ts";
import { expect, test } from "./support/cursorStart.ts";

const formerHeightKey = "open-dough.sessionSidebar.runningCursorHeight";

test("a height saved under the former Sessions sidebar key is recovered once and later choices use the adopted key", async ({
  page,
  origin,
}) => {
  await showPage(page, origin);
  const shown = runningCursorParts(page);
  await shown.button.click();
  await keepInBrowser(page, formerHeightKey, "280");
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, heightKey);
  await reloadUntilRead(page);
  await expect(shown.sidebar).toBeVisible();
  await expectCollapsed(shown);
  await shown.header.click();
  await expectEdgeSays(shown.edge, 280);
  await expectSplit(shown, await roomOf(shown), 280);
  expect(await keptHeight(page)).toBe("280");

  // A changed former value cannot override the adopted preference.
  await keepInBrowser(page, formerHeightKey, "340");
  await reloadUntilRead(page);
  await expectCollapsed(shown);
  await shown.header.click();
  await expectEdgeSays(shown.edge, 280);
  await shown.edge.focus();
  await page.keyboard.press("ArrowUp");
  const chosen = 280 + keyStep;
  await expectEdgeSays(shown.edge, chosen);
  expect(await keptHeight(page)).toBe(String(chosen));
  await reloadUntilRead(page);
  await expectCollapsed(shown);
  await shown.header.click();
  await expectEdgeSays(shown.edge, chosen);
  await expectSplit(shown, await roomOf(shown), chosen);
});
