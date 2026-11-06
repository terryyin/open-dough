// A streaming Board whose every stream open fails, or that waits out a
// rate-limited answer, shows lost freshness with its snapshot kept once the
// silence bound has passed from the last answer or observation start (or from
// reopen after the wait), reopens no more often than the pace, and catches up
// on the first answer after a reopen. Slots stay free; the server pace is
// lowered.

import { expect, githubFor, test } from "../dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  shortRevision,
} from "../dashboardPage.ts";
import {
  checksAskedWhilePassing,
  pageTimeStepMs,
  passPageMs,
  recordsAt,
} from "../autoRefreshJourney.ts";
import {
  expectLostFreshnessProblem,
  expectStreamOpenGapsAtLeastPace,
  isRevisionStream,
  openStreamingAtA,
  routeFailingRevisionStreams,
  streamPaceMs,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
} from "../revisionStreamJourney.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../refreshJourney.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { revisionStreamSilenceMs } from "../../src/revisionStreamSchedule.ts";
import { rateLimitedAnswer } from "../publishedOrigin.ts";
import { untilReported } from "../support/directedWait.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

test.setTimeout(120_000);

test("failed stream opens show lost freshness at 45s; pace holds; first answer clears and catches up", async ({
  page,
}) => {
  const stopFailing = await routeFailingRevisionStreams(page);
  const origin = await openStreamingAtA(page);
  const { problem, retrievedAt, readRevision } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  expect(retrievedA).not.toBe("");
  await expect(readRevision).toContainText(shortRevision(revisionA));

  await test.step("40s of page time: no lost-freshness problem", async () => {
    await passPageMs(page, revisionStreamSilenceMs - 5_000);
    await expect(problem).toHaveCount(0);
  });

  await test.step("45s plus one page-time step: problem with snapshot retrieval time", async () => {
    await passPageMs(page, 5_000 + pageTimeStepMs);
    await expectLostFreshnessProblem(page, retrievedA, titlesOfA);
  });

  await test.step("open gaps stay at least the pace across failed opens", async () => {
    await expectStreamOpenGapsAtLeastPace(page);
  });

  await test.step("unroute and push B: first answer clears the problem and catches up", async () => {
    await stopFailing();
    origin.push(revisionB, backlogB, recordsAt("B"));
    const caughtUp = untilStreamingAt(page, revisionB);
    await passPageMs(page, checkIntervalMs);
    await expectSettledPage(page, titlesOfB);
    await expect(readRevision).toContainText(shortRevision(revisionB));
    await expect(problem).toHaveCount(0);
    await caughtUp;
  });
});

test("a rate-limited stream answer shows today's notice, closes the stream, waits until T, then reopens", async ({
  page,
}) => {
  // Retry-After long enough that an observation-start arm would leave the
  // post-wait bound short of a full silence; E3.2 needs a full bound from
  // reopen. Wall wait for the server's directed hold matches this span.
  const retryAfterSeconds = 20;
  test.setTimeout(120_000);
  const origin = await openStreamingAtA(page);
  const { problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  const restoreMain = origin.answerWith(
    "main",
    rateLimitedAnswer(429, {
      "Retry-After": String(retryAfterSeconds),
    }),
  );
  const beforeLimit = githubFor(page).calls.length;
  // Next pace tick delivers the limited answer over the open stream (wall).
  await untilMatchingRefsSince(page, beforeLimit, 1);
  await expect(problem).toContainText(
    "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429)",
  );
  // Timed once the page shows the answer, which follows the server starting
  // its wait (untilReported); the fake's receipt of the call comes before it.
  const arrivedAt = Date.now();
  await expect(problem).toContainText(
    "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
  );
  await expect(problem).toContainText("Automatic checks resume then.");
  await expect(problem.locator("time").nth(1)).toHaveAttribute(
    "datetime",
    retrievedA,
  );
  await expectMembership(page, titlesOfA);

  const quietFrom = githubFor(page).calls.length;
  const streamOpens: string[] = [];
  page.on("request", (request) => {
    if (isRevisionStream(request.url())) {
      streamOpens.push(request.url());
    }
  });
  // Page time still before T: no check, no stream reopen, no further listing,
  // and no lost-freshness while the directed notice stands (G3 / E3.2).
  expect(await checksAskedWhilePassing(page, 1_000)).toBe(0);
  expect(streamOpens).toEqual([]);
  await page.waitForTimeout(streamPaceMs * 4);
  expect(
    githubFor(page)
      .calls.slice(quietFrom)
      .filter(({ request }) => request.kind === "matching-refs"),
  ).toEqual([]);
  await passPageMs(page, retryAfterSeconds * 1000 - 2_000);
  await expect(problem).toContainText(
    "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
  );
  await expect(problem).not.toContainText("freshness was lost");

  // Fail every reopen so the bound that starts when the wait ends is visible.
  const stopFailing = await routeFailingRevisionStreams(page);
  restoreMain();
  await untilReported(arrivedAt, retryAfterSeconds);
  // Cross T on the page clock; silence arms immediately before this open.
  await passPageMs(page, 2_000 + pageTimeStepMs);
  expect(streamOpens.length).toBeGreaterThan(0);

  await test.step("E3.2: after the wait a full silence bound starts from reopen", async () => {
    await passPageMs(page, revisionStreamSilenceMs - 5_000);
    await expect(problem).not.toContainText("freshness was lost");
    await passPageMs(page, 5_000 + pageTimeStepMs);
    await expect(problem).toContainText("freshness was lost");
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
  });

  await stopFailing();
  origin.push(revisionB, backlogB, recordsAt("B"));
  const resumed = untilStreamingAt(page, revisionB);
  await passPageMs(page, checkIntervalMs);
  await expectSettledPage(page, titlesOfB);
  await expect(problem).toHaveCount(0);
  await resumed;
});
