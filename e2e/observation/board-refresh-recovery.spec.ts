// Refresh on a Board whose origin moved: while B is checked, and when its
// fetch or its confirmation record fails, the Board keeps A and A's
// confirmation time beside the read failure alert; a later Refresh publishes
// B with a later time.
import { mkdirSync, rmSync } from "node:fs";
import { expect } from "@playwright/test";
import path from "node:path";
import {
  boardConfirmedAt,
  expectBoardCheckPending,
  expectBoardConfirmedAfter,
  expectBoardRefreshFailed,
  expectNoBoardFailure,
  pressBoardRefresh,
} from "../../dashboard/test-support/boardRefreshPage.ts";
import {
  expectPublishedRevision,
  expectShownMembership,
} from "../../dashboard/test-support/dashboardPage.ts";
import { test as base } from "../../dashboard/test-support/dashboardTest.ts";
import {
  openSettledAtA,
  passTimeUntilAsked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import {
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import { homeReviewRepository } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";

type HeldTransfers = ReturnType<typeof holdLaterTrunkTransfers>;

// Holds the Board's later trunk checks once the case asks, and lets through
// whatever the case leaves held before the dashboard stops.
const test = base.extend<{
  holdTrunkChecks: () => HeldTransfers;
  confirmationRecords: { block: () => void; allow: () => void };
}>({
  holdTrunkChecks: async ({ dashboard }, use) => {
    let transfers: HeldTransfers | undefined;
    await use(() => {
      transfers = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
      return transfers;
    });
    transfers?.release();
  },
  // The Board's confirmation record cannot be replaced while a directory
  // stands where its replacement is written.
  confirmationRecords: async ({ dashboard }, use) => {
    const blocking = path.join(
      homeReviewRepository(dashboard.home, defaultRepository),
      "open-dough-board-confirmation.json.tmp",
    );
    await use({
      block: () => {
        mkdirSync(path.join(blocking, "held"), { recursive: true });
      },
      allow: () => {
        rmSync(blocking, { recursive: true, force: true });
      },
    });
  },
});

test("Refresh after origin moved keeps A and its time through failures, then publishes B", async ({
  page,
  afterGitHubStops,
  holdTrunkChecks,
  confirmationRecords,
}) => {
  const { origin, shownAt } =
    await test.step("Given the Board settled at A and origin moved to B", async () => {
      const origin = await openSettledAtA(page, afterGitHubStops);
      origin.advanceTo("B");
      return { origin, shownAt: await boardConfirmedAt(page) };
    });
  const transfers =
    await test.step("When Refresh is pressed while origin's answer is held", async () => {
      const transfers = holdTrunkChecks();
      await pressBoardRefresh(page);
      await transfers.untilHeld();
      return transfers;
    });
  await test.step("Then the Board keeps A and its time while checking", async () => {
    await expectBoardCheckPending(page, shownAt);
    await expectShownMembership(page, titlesOfA);
  });
  await test.step("When origin hangs up", () => {
    transfers.fail();
  });
  await test.step("Then A and its time stay beside the failure", async () => {
    await expectBoardRefreshFailed(
      page,
      shownAt,
      "The published trunk is unavailable",
    );
    await expectShownMembership(page, titlesOfA);
  });
  await test.step("When Refresh fetches B but cannot record its confirmation", async () => {
    confirmationRecords.block();
    transfers.release();
    await pressBoardRefresh(page);
  });
  await test.step("Then A and its time stay beside that failure", async () => {
    await expectBoardRefreshFailed(
      page,
      shownAt,
      "The check of main of terryyin/open-dough could not be saved.",
    );
    await expectShownMembership(page, titlesOfA);
  });
  await test.step("When Refresh is pressed once the record can be written", async () => {
    confirmationRecords.allow();
    await pressBoardRefresh(page);
  });
  await test.step("Then the Board shows B with a later confirmation time", async () => {
    await expectPublishedRevision(page, origin.revisions.B);
    await expectShownMembership(page, titlesOfB);
    await expectBoardConfirmedAfter(page, shownAt);
    await expectNoBoardFailure(page);
  });
});

test("an automatic check begun before Refresh and settled after it leaves the Refresh's confirmation shown", async ({
  page,
  afterGitHubStops,
}) => {
  const { origin, shownAt, releaseCheck } =
    await test.step("Given the Board at A and an automatic check held after origin moved to B", async () => {
      const origin = await openSettledAtA(page, afterGitHubStops);
      const shownAt = await boardConfirmedAt(page);
      origin.advanceTo("B");
      const releaseCheck = origin.hold("main");
      await passTimeUntilAsked(page);
      return { origin, shownAt, releaseCheck };
    });
  const refreshedAt =
    await test.step("When Refresh publishes B before that check settles", async () => {
      await pressBoardRefresh(page);
      await expectShownMembership(page, titlesOfB);
      await expectBoardConfirmedAfter(page, shownAt);
      return boardConfirmedAt(page);
    });
  await test.step("Then the settled check leaves B and the Refresh's time", async () => {
    releaseCheck();
    await expectPublishedRevision(page, origin.revisions.B);
    expect(await boardConfirmedAt(page)).toBe(refreshedAt);
  });
});
