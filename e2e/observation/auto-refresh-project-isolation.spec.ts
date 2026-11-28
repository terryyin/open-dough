// Selecting a project also abandons the previous project's automatic work:
// its outstanding revision check and its snapshot's detail reads. This is
// the automatic-check counterpart of ./project-read-isolation.spec.ts, which
// proves the same one-selected-source rule for membership reads. The page's
// clock is paused and advanced by the test (../../dashboard/test-support/autoRefreshJourney.ts), so no
// deselected project's work can time out on its own, and every later check
// is observed at the Board's HTTP boundary. Each held answer is released
// only after the newly selected project is shown, and
// "nothing changed" is asserted immediately after the release.

import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import type { Locator, Page } from "@playwright/test";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  shortRevision,
  expectMembership,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilAsked,
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  doughnutSharedGoal,
  doughnutSharedTitle,
} from "../../dashboard/test-support/doughnutProject.ts";
import { selectSettledDoughnut } from "../../dashboard/test-support/doughnutJourney.ts";
import {
  isCheck,
  whileNotingChecks,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import {
  dashboardStory,
  refreshHistory,
  titlesOfA,
} from "../../dashboard/test-support/refreshJourney.ts";
import type { GhCall } from "../../dashboard/test-support/support/fakeGitHub.ts";
import {
  agentProfileDirectory,
  agentSettingsPath,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

test.describe("project read isolation of automatic checks", () => {
  // Doughnut still shows its own snapshot, evidence, and focus, and nothing
  // of Open Dough's.
  async function expectOnlyDoughnut(
    page: Page,
    shown: { link: Locator; retrievedAt: string | null; revision: string },
  ) {
    const { readRevision } = parts(page);
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
    await expect(readRevision).toContainText(shortRevision(shown.revision));
    await expect(parts(page).retrievedAt).toHaveAttribute(
      "datetime",
      shown.retrievedAt ?? "",
    );
    await expect(projectTab(page, "Doughnut")).toBeChecked();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("as published at");
    await expect(page.locator("body")).not.toContainText(dashboardStory);
    await expect(shown.link).toBeFocused();
    await expect(parts(page).notice).toBeEmpty();
  }

  const openDoughCalls = (calls: readonly GhCall[]) =>
    calls.filter(
      ({ request }) =>
        request.kind !== "unknown" &&
        request.repository === "terryyin/open-dough",
    );
  // A late Open Dough answer can start no further REST detail.
  function expectOnlyDoughnutAsked(calls: readonly GhCall[], revision: string) {
    expect(openDoughCalls(calls)).toEqual([]);
    const reads = contentReads(calls);
    expect(reads.length).toBeGreaterThan(1);
    expect(reads.every((read) => read.endsWith(`?ref=${revision}`))).toBe(true);
  }
  async function expectOneDoughnutCheck(page: Page, shown: string) {
    await whileNotingChecks(page, async (askedAfter) => {
      const checking = page.waitForRequest((request) => isCheck(request.url()));
      expectSteadyPace(await passTimeUntilChecked(page));
      const params = new URL((await checking).url()).searchParams;
      expect(params.get("source")).toBe("doughnut");
      expect(params.get("since")).toBe(shown);
      expect(await askedAfter()).toHaveLength(1);
    });
  }

  test("a deselected project's outstanding revision check is abandoned, its late answer changes nothing, and only the selected project is checked from then on", async ({
    page,
    afterGitHubStops,
    dashboard,
  }) => {
    const openDough = await openSettledAtA(page, afterGitHubStops);
    const transfer = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
    try {
      // What the held check would find: Open Dough's main moved on to B.
      openDough.advanceTo("B");
      const checking = page.waitForRequest((request) => isCheck(request.url()));
      await passTimeUntilAsked(page);
      const check = await checking;
      expect(new URL(check.url()).searchParams.get("source")).toBe(
        "open-dough",
      );
      await transfer.untilHeld();
      const cancelled = page.waitForEvent(
        "requestfailed",
        (request) => request === check,
      );
      const atSwitch = githubFor(page).calls.length;
      const shown = await selectSettledDoughnut(page);
      await cancelled;

      await test.step("Open Dough's held check answers late, after Doughnut is shown", async () => {
        transfer.release();
        await expectOnlyDoughnut(page, shown);
      });

      await test.step("the next check is Doughnut's own, at its steady pace, and Open Dough is never asked again", async () => {
        await expectOneDoughnutCheck(page, shown.revision);
        expectOnlyDoughnutAsked(callsSince(page, atSwitch), shown.revision);
        await expectOnlyDoughnut(page, shown);
      });
    } finally {
      transfer.release();
    }
  });

  test("a deselected project's late detail read never lands in the newly selected project's view or schedule", async ({
    page,
    afterGitHubStops,
  }) => {
    await pausePageClock(page);
    const openDough = await publishMovingHistory(
      page,
      refreshHistory(),
      "A",
      afterGitHubStops,
    );
    const { A: revisionA } = openDough.revisions;
    const releaseDetail = openDough.hold(
      ".planning/seeds/SEED-021-progress.md",
    );
    await page.goto("/");
    await expectMembership(page, titlesOfA);
    // Every detail read of A, the held one included, and the agent-profile
    // listing and project setting file reads beside them have reached GitHub
    // before the switch, so no read sent before it counts as asked after it.
    // The setting file is read right after the listing, in the same
    // request, so the listing alone does not prove it was recorded.
    await expect
      .poll(() => readsBesideChecks(openDoughCalls(githubFor(page).calls)))
      .toEqual(
        expect.arrayContaining(
          [
            "content .planning/seeds/SEED-021-progress.md",
            "content .planning/seeds/SEED-008-sync.md",
            "content .planning/slice-plans/059-installer-update-report/PLAN.md",
            `listing .planning/${agentProfileDirectory}`,
            `content ${agentSettingsPath}`,
          ].map((read) => `${read}@${revisionA}`),
        ),
      );
    await expect(page.getByText("Reading preparation…")).not.toHaveCount(0);

    const atSwitch = githubFor(page).calls.length;
    const shown = await selectSettledDoughnut(page);

    await test.step("Open Dough's held detail answers late, after Doughnut is shown", async () => {
      releaseDetail();
      await expectOnlyDoughnut(page, shown);
      const card = parts(page).backlog.getByRole("article", {
        name: doughnutSharedTitle,
      });
      // Its detail, opened while Doughnut was selected, stays open.
      await expect(
        card.getByRole("button", { name: "Hide detail" }),
      ).toBeVisible();
      await expect(card).toContainText(doughnutSharedGoal);
      await expect(page.locator("body")).not.toContainText("as published at");
    });

    await test.step("the next check is Doughnut's own, at its steady pace, and Open Dough is never asked again", async () => {
      await expectOneDoughnutCheck(page, shown.revision);
      expectOnlyDoughnutAsked(callsSince(page, atSwitch), shown.revision);
    });
  });
});
