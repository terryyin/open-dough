// Streaming Board journeys: free slots, lowered server pace, EventSource
// instead of recurring `since` checks. Check-delivery keeps ../dashboardTest.ts
// pre-hold.

import type { Page, Request } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "../dashboardTest.ts";
import { shortRevision, expectSettledPage, parts } from "../dashboardPage.ts";
import {
  checksAskedWhilePassing,
  passTimeUntilAsked,
} from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  callsSince,
  isRevisionStream,
  matchingRefsSince,
  openSecondStreamingAtA,
  openStreamingAtA,
  recordsAt,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
  setPageVisibility,
} from "../revisionStreamJourney.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { revisionStreamSlotLockNames } from "../../src/revisionStreamSlot.ts";
import {
  backlogB,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../refreshJourney.ts";
import { readsBesideChecks } from "../originObservation.ts";
import {
  onBranch,
  opened,
  planPath,
  revision,
} from "../branchProgressRecords.ts";
import {
  branchPlanPublication,
  openedSettled,
  sevenDoneOnBranch,
} from "../branchRefreshJourney.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

// Slot requests the browser has queued, across this origin's pages.
function queuedSlotRequests(page: Page): Promise<number> {
  return page.evaluate(async (names) => {
    const { pending = [] } = await navigator.locks.query();
    return pending.filter(
      ({ name }) => name !== undefined && names.includes(name),
    ).length;
  }, revisionStreamSlotLockNames());
}

test("a streaming page sends no since request over a quiet minute", async ({
  page,
}) => {
  await openStreamingAtA(page);
  const { problem } = parts(page);
  const before = githubFor(page).calls.length;
  await untilMatchingRefsSince(page, before, 2);
  const checksBefore = await page.evaluate(() => {
    const noted = window as { revisionChecksAskedAt?: number[] };
    return noted.revisionChecksAskedAt?.length ?? 0;
  });
  expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
  expect(checksBefore).toBe(0);
  await expect(problem).toHaveCount(0);
  expect(
    matchingRefsSince(page, before),
    "the stream kept observing origin over the quiet minute",
  ).toBeGreaterThanOrEqual(2);
});

// A slow CI backlog read can otherwise interleave the next 80 ms pace listing
// before the one-listing assertion; this journey keeps the shared-listing
// claim with a pace longer than that read.
test.describe("shared publication listing", () => {
  test.use({
    preholdRevisionStreamSlots: false,
    extraEnv: { DOUGH_REVISION_STREAM_MS: "3000" },
  });

  test("two streaming pages show a publication from one listing with one backlog read", async ({
    page,
  }) => {
    const origin = await openStreamingAtA(page);
    const other = await openSecondStreamingAtA(page);
    // Finish one paced listing so `before` is not mid-flight when we publish.
    const drained = githubFor(page).calls.length;
    await untilMatchingRefsSince(page, drained, 1);
    const before = githubFor(page).calls.length;
    const pageAtB = untilStreamingAt(page, revisionB);
    const otherAtB = untilStreamingAt(other, revisionB);
    origin.push(revisionB, backlogB, recordsAt("B"));
    // Transport drop reopens at the pace: advance both page clocks to it.
    await page.clock.runFor(checkIntervalMs);
    await other.clock.runFor(checkIntervalMs);
    await expectSettledPage(page, titlesOfB);
    await expectSettledPage(other, titlesOfB);
    const { readRevision } = parts(page);
    await expect(readRevision).toContainText(shortRevision(revisionB));
    const calls = [...callsSince(page, before)];
    const backlogIndex = calls.findIndex(
      ({ request }) =>
        request.kind === "content" &&
        request.path === ".planning/PRODUCT-BACKLOG.md" &&
        request.revision === revisionB,
    );
    expect(backlogIndex).toBeGreaterThanOrEqual(0);
    expect(
      calls
        .slice(0, backlogIndex + 1)
        .filter(({ request }) => request.kind === "matching-refs"),
    ).toHaveLength(1);
    expect(
      calls.filter(
        ({ request }) =>
          request.kind === "content" &&
          request.path === ".planning/PRODUCT-BACKLOG.md" &&
          request.revision === revisionB,
      ),
    ).toHaveLength(1);
    await pageAtB;
    await otherAtB;
    await other.close();
  });
});

test("a watched branch move reads only that entry's plan and commit time; the other page reads nothing further", async ({
  page,
}) => {
  const streaming = untilStreamingAt(page, revision);
  const { origin, progress } = await openedSettled(page);
  await streaming;
  const other = await page.context().newPage();
  await pausePageClockAt(other, opened);
  const otherStreaming = untilStreamingAt(other, revision);
  await other.goto("/");
  await expect(other.getByText("Reading plan slices…")).toHaveCount(0);
  await otherStreaming;
  const movedHead = "e6".repeat(20);
  const before = githubFor(page).calls.length;
  const commitAt = new Date(opened.getTime() - 2 * 60_000);
  const moved = branchPlanPublication(movedHead, commitAt, sevenDoneOnBranch);
  origin.moveBranch("story/example", moved);
  await page.clock.runFor(checkIntervalMs);
  await other.clock.runFor(checkIntervalMs);
  await expect(
    progress.getByRole("img", { name: "7 of 8 slices recorded complete" }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(progress).toContainText("Current slice started 2 min ago");
  expect(readsBesideChecks(callsSince(page, before)).sort()).toEqual(
    [
      `content ${planPath("on-branch")}@${movedHead}`,
      `commit-list ${planPath("on-branch")}@${movedHead}`,
    ].sort(),
  );
  await expect(
    other
      .getByRole("article", { name: onBranch })
      .locator(".story-card-progress")
      .getByRole("img", { name: "7 of 8 slices recorded complete" }),
  ).toBeVisible();
  await other.close();
});

test("after reading a publication the page reopens its stream at the new revision", async ({
  page,
}) => {
  const origin = await openStreamingAtA(page);
  const reopened = untilStreamingAt(page, revisionB);
  origin.push(revisionB, backlogB, recordsAt("B"));
  await expectSettledPage(page, titlesOfB);
  await reopened;
  const { readRevision } = parts(page);
  await expect(readRevision).toContainText(shortRevision(revisionB));
});

test("seven pages of one context: two stream and five check; hiding a holder lets a checker stream", async ({
  page,
}) => {
  await openStreamingAtA(page);
  const pages: Page[] = [page];
  const holders: Page[] = [page];
  const checkers: Page[] = [];
  for (let i = 0; i < 6; i += 1) {
    const next = await page.context().newPage();
    await pausePageClockAt(next, new Date("2026-09-23T09:00:00.000Z"));
    const seen = { stream: false };
    const streamOpened = (request: Request) => {
      if (isRevisionStream(request.url())) seen.stream = true;
    };
    next.on("request", streamOpened);
    const queuedBefore = await queuedSlotRequests(page);
    await next.goto("/");
    await expectSettledPage(next, titlesOfA);
    // A page that found no free slot queues for every slot, and checks.
    await expect
      .poll(
        async () =>
          seen.stream || (await queuedSlotRequests(page)) > queuedBefore,
      )
      .toBe(true);
    next.off("request", streamOpened);
    pages.push(next);
    if (seen.stream) {
      holders.push(next);
    } else {
      checkers.push(next);
    }
  }
  expect(holders).toHaveLength(2);
  expect(checkers).toHaveLength(5);

  // Checking pages ask `since` at the check pace (page time); under seven
  // pages the first ask can land a step or two late, so observe that they
  // check rather than the exact step bound.
  for (const checker of checkers.slice(0, 2)) {
    await untilPageReadsAnswered(checker);
    const passed = await passTimeUntilAsked(checker);
    expect(passed).toBeGreaterThanOrEqual(15_000);
    expect(passed).toBeLessThanOrEqual(20_000);
  }

  // The first checking page queued for a slot takes over when a holder hides.
  const nextStreamer = checkers[0];
  const hidingHolder = holders[0];
  expect(nextStreamer).toBeDefined();
  expect(hidingHolder).toBeDefined();
  if (nextStreamer === undefined || hidingHolder === undefined) {
    return;
  }
  const willStream = nextStreamer.waitForRequest(
    (request) => isRevisionStream(request.url()),
    { timeout: 15_000 },
  );
  await setPageVisibility(hidingHolder, "hidden");
  await willStream;

  for (const p of pages.slice(1)) {
    await p.close();
  }
});
