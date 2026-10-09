// When the selected project's `main` names a new commit, the dashboard reads
// that revision while what it already shows stays where it is: the read under
// way is said without moving the columns. The journey's commits and records
// are those of ./refreshJourney.ts and ./autoRefreshJourney.ts; the page's
// clock is paused and advanced by the test.

import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  openSettledAtA,
  passTimeUntilChecked,
  recordsAt,
} from "./autoRefreshJourney.ts";
import { backlogA, revisionB, titlesOfA } from "./refreshJourney.ts";
import { box } from "./partArrangement.ts";

for (const { width, at } of [
  { width: 1280, at: "" },
  { width: 320, at: " on a phone's width" },
]) {
  test(`the read of a new revision is said without moving the columns${at}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 720 });
    const origin = await openSettledAtA(page);
    const { backlog, reading, status } = parts(page);
    const settledTop = (await box(backlog)).y;

    // B's backlog read is held, so the read stays under way to be seen.
    const release = origin.hold(revisionB);
    origin.push(revisionB, backlogA, recordsAt("B"));
    await passTimeUntilChecked(page);

    await test.step("while the read is under way, the Backlog column stays where it was", async () => {
      await expect(reading).toBeVisible();
      // Said whole, though a narrow line shows it cut short.
      await expect(reading).toHaveText(
        "Reading published work… What is shown is still the snapshot retrieved earlier.",
      );
      expect((await box(backlog)).y).toBe(settledTop);
    });

    await test.step("once B is read, the Backlog column is still where it was", async () => {
      release();
      await expectSettledPage(page, titlesOfA);
      await expect(status).toHaveText(
        /^Published work read at revision b2b2b2b/,
      );
      expect((await box(backlog)).y).toBe(settledTop);
    });
  });
}
