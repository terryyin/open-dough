// When the selected project's `main` names a new commit, the dashboard reads
// that revision while what it already shows stays where it is: the read under
// way is said without moving the columns. The journey's commits and records
// are those of ../../dashboard/test-support/refreshJourney.ts and
// ../../dashboard/test-support/autoRefreshJourney.ts; the page's clock is paused and
// advanced by the test.

import { holdAuthenticatedReadsWhere } from "../../dashboard/test-support/holdAuthenticatedReads.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  openSettledAtA,
  passTimeUntilChecked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  backlogA,
  titlesOfA,
} from "../../dashboard/test-support/refreshJourney.ts";
import { box } from "../../dashboard/test-support/partArrangement.ts";

for (const { width, at } of [
  { width: 1280, at: "" },
  { width: 320, at: " on a phone's width" },
]) {
  test(`the read of a new revision is said without moving the columns${at}`, async ({
    page,
    afterGitHubStops,
    dashboard,
  }) => {
    await page.setViewportSize({ width, height: 720 });
    const origin = await openSettledAtA(page, afterGitHubStops, {
      backlog: backlogA,
    });
    const { B: revisionB } = origin.revisions;
    expect(
      await remoteBranchHead(
        gitHubRepositoryUrl(defaultRepository),
        "refs/heads/main",
        {
          cwd: dashboard.home,
          env: { HOME: dashboard.home },
          maxBuffer: 4096,
        },
      ),
    ).toBe(origin.revisions.A);
    const { backlog, reading, status } = parts(page);
    const settledTop = (await box(backlog)).y;

    // The browser's pinned B snapshot request remains in flight.
    const snapshot = await holdAuthenticatedReadsWhere(
      page,
      (params) => params.get("revision") === revisionB && params.size === 2,
      [],
    );
    origin.advanceTo("B");
    expect(
      await remoteBranchHead(
        gitHubRepositoryUrl(defaultRepository),
        "refs/heads/main",
        {
          cwd: dashboard.home,
          env: { HOME: dashboard.home },
          maxBuffer: 4096,
        },
      ),
    ).toBe(revisionB);
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
      snapshot.release();
      await expectSettledPage(page, titlesOfA);
      await expect(status).toHaveText(
        new RegExp(
          `^Published work read at revision ${shortRevision(revisionB)}`,
        ),
      );
      expect((await box(backlog)).y).toBe(settledTop);
    });
  });
}
