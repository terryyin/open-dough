// Refresh on a warm Board whose origin still names the confirmed revision:
// the check keeps the shown backlog and time while pending, a second press
// joins it, and it settles with a later confirmation after only origin's
// probe, so nothing is fetched.
import {
  boardConfirmedAt,
  expectBoardCheckPending,
  expectBoardConfirmedAfter,
  pressBoardRefresh,
} from "../../dashboard/test-support/boardRefreshPage.ts";
import {
  expectPublishedRevision,
  expectShownMembership,
} from "../../dashboard/test-support/dashboardPage.ts";
import { test as base } from "../../dashboard/test-support/dashboardTest.ts";
import { openSettledAtA } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { titlesOfA } from "../../dashboard/test-support/refreshJourney.ts";
import { expect } from "@playwright/test";

type HeldTransfers = ReturnType<typeof holdLaterTrunkTransfers>;

// Holds the Board's later trunk checks once the case asks, after the Board
// opened; whatever the case leaves held is let through before the dashboard
// stops.
const test = base.extend<{ holdTrunkChecks: () => HeldTransfers }>({
  holdTrunkChecks: async ({ dashboard }, use) => {
    let transfers: HeldTransfers | undefined;
    await use(() => {
      transfers = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
      return transfers;
    });
    transfers?.release();
  },
});

test("Refresh of an unchanged Board advances its confirmation time without fetching", async ({
  page,
  afterGitHubStops,
  holdTrunkChecks,
}) => {
  const { origin, shownAt } =
    await test.step("Given the Board settled at A with a confirmation time", async () => {
      const origin = await openSettledAtA(page, afterGitHubStops);
      return { origin, shownAt: await boardConfirmedAt(page) };
    });
  const transfers =
    await test.step("When Refresh is pressed while origin's answer is held", async () => {
      const transfers = holdTrunkChecks();
      await pressBoardRefresh(page);
      await transfers.untilHeld();
      return transfers;
    });
  await test.step("Then the Board keeps its backlog and time while checking", async () => {
    await expectBoardCheckPending(page, shownAt);
    await expectShownMembership(page, titlesOfA);
  });
  await test.step("When Refresh is pressed again and origin answers", async () => {
    await pressBoardRefresh(page);
    transfers.release();
  });
  await test.step("Then the Board shows A with a later confirmation time", async () => {
    await expectBoardConfirmedAfter(page, shownAt);
    await expectPublishedRevision(page, origin.revisions.A);
  });
  await test.step("And origin was probed once with nothing fetched", () => {
    expect(transfers.held()).toBe(1);
  });
});
