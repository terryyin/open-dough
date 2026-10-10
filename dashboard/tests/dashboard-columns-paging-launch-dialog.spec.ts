// A launch dialog opened from a card in a shown dashboard column leaves the
// view where the developer put it: the dialog lies within that card's column,
// wherever the window shows it, so opening it, leaving it, and reloading keep
// the same columns showing. How focus and Sessions sidebar choices show a
// hidden column is ./dashboard-columns-paging.spec.ts and
// ./dashboard-columns-paging-sessions-sidebar.spec.ts.

import { expect } from "./dashboardTest.ts";
import { expectView, showColumn } from "./dashboardColumnsPage.ts";
import { reachKeptStart, startAction, test } from "./keptStartJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { scrollsOnItsOwn } from "./sidePanelWidthPage.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ viewport: { width: 1100, height: 900 } });

test("opening and leaving Start execution on a shown Taken card keeps the view on Taken and Recently done", async ({
  page,
  dashboard,
  origin,
}) => {
  const { takenCard } = await reachKeptStart(page, dashboard, origin);
  await sidebarParts(page).button.click();
  await showColumn(page, "Recently done");
  // The sidebar's entries are cut by design, read whole by their tooltip.
  const expectTakenAndRecentlyDone = () =>
    expectView(
      page,
      ["Taken", "Recently done"],
      ["Backlog 0 entries"],
      [...scrollsOnItsOwn, ".sidebar-title"],
    );
  await expectTakenAndRecentlyDone();

  await test.step("while the dialog is open", async () => {
    await startAction(takenCard).click();
    const dialog = page.getByRole("dialog", {
      name: "Start execution in Claude Code",
    });
    await expect(dialog).toBeVisible();
    // Focus has entered the dialog, so the view has heard it.
    await expect(dialog.locator(":focus")).toHaveCount(1);
    await expectTakenAndRecentlyDone();
  });

  await test.step("after Escape", async () => {
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Start execution in Claude Code" }),
    ).toHaveCount(0);
    await expectTakenAndRecentlyDone();
  });

  await test.step("after a reload", async () => {
    await reloadUntilRead(page);
    await expect(takenCard).toBeVisible();
    await expectTakenAndRecentlyDone();
  });
});
