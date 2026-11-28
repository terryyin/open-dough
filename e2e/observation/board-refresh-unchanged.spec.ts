// While Refresh is pending, the control is focusable and a second press
// sends no new request. The Board shows the later confirmation on settlement.
import { expect, type Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import {
  boardConfirmedAt,
  expectBoardCheckPending,
  expectBoardConfirmedAfter,
  pressBoardRefresh,
} from "../../dashboard/test-support/boardRefreshPage.ts";
import { test as base } from "../../dashboard/test-support/dashboardTest.ts";
import { openSettledAtA } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";

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

function noteRefreshRequests(page: Page): readonly string[] {
  const requests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("fresh") === "1"
    ) {
      requests.push(request.url());
    }
  });
  return requests;
}

test("Refresh of an unchanged Board is focusable while pending and cannot be submitted twice", async ({
  page,
  afterGitHubStops,
  holdTrunkChecks,
}) => {
  const { shownAt, refreshRequests, transfers } =
    await test.step("Given the Board settled at A with the next origin check held", async () => {
      await openSettledAtA(page, afterGitHubStops);
      return {
        shownAt: await boardConfirmedAt(page),
        refreshRequests: noteRefreshRequests(page),
        transfers: holdTrunkChecks(),
      };
    });
  await test.step("When Refresh is pressed", async () => {
    await pressBoardRefresh(page);
    await transfers.untilHeld();
  });
  await test.step("Then Refresh remains focusable and the shown time stays while checking", async () => {
    await expectBoardCheckPending(page, shownAt);
  });
  await test.step("When Refresh is pressed again and origin answers", async () => {
    await pressBoardRefresh(page);
    transfers.release();
  });
  await test.step("Then the single request updates the shown confirmation time", async () => {
    await expectBoardConfirmedAfter(page, shownAt);
    expect(refreshRequests).toHaveLength(1);
  });
});
