// Board streams use free slots/lowered pace; dashboardTest.ts pre-holds slots for check delivery.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import type { Page, Request } from "@playwright/test";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  checksAskedWhilePassing,
  passTimeUntilAsked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  callsSince,
  isRevisionStream,
  matchingRefsSince,
  openSecondStreamingAtA,
  openStreamingAtA,
  queuedSlotRequests,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
  setPageVisibility,
} from "../../dashboard/test-support/revisionStreamJourney.ts";
import {
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

test("a streaming page sends no since request over a quiet minute", async ({
  page,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
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
    afterGitHubStops,
    dashboard,
  }) => {
    const origin = await openStreamingAtA(page, afterGitHubStops);
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
    const other = await openSecondStreamingAtA(page, origin.revisions.A);
    const { problem, readRevision } = parts(page);
    await expect(problem, "the first tab's stream stayed fresh").toHaveCount(0);
    // Finish one paced listing so `before` is not mid-flight when we publish.
    const drained = githubFor(page).calls.length;
    await untilMatchingRefsSince(page, drained, 1);
    const before = githubFor(page).calls.length;
    const pageAtB = untilStreamingAt(page, revisionB);
    const otherAtB = untilStreamingAt(other, revisionB);
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
    await expectSettledPage(page, titlesOfB);
    await expectSettledPage(other, titlesOfB);
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

test("seven pages of one context: two stream and five check; hiding a holder lets a checker stream", async ({
  page,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
  const pages: Page[] = [page];
  const holders: Page[] = [page];
  const checkers: Page[] = [];
  for (let i = 0; i < 6; i += 1) {
    const next = await page.context().newPage();
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
