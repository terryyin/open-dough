// A streaming Board that waits out a rate-limited answer and whose every
// reopen then fails shows lost freshness with its snapshot kept once the
// silence bound has passed from reopen after the wait, and catches up on the
// first answer. Slots stay free; the server pace is lowered. GitHub's wait is
// kept by the request owner's clock alone, so the case asks through an owner
// of its own whose time it advances
// (../../dashboard/test-support/support/ownerClockTest.ts): its directed wait
// passes when the case moves owner and page time to it. The silence bound
// from observation start and pace reopens of unanswered attempts:
// ../../dashboard/frontend-tests/observation/revision-stream-delivery.spec.ts.

import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  checksAskedWhilePassing,
  pageTimeStepMs,
  passPageMs,
  recordsAt,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isRevisionStream,
  openStreamingAtA,
  routeFailingRevisionStreams,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
} from "../../dashboard/test-support/revisionStreamJourney.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { revisionStreamSilenceMs } from "../../dashboard/src/revisionStreamSchedule.ts";
import { rateLimitedAnswer } from "../../dashboard/test-support/publishedOrigin.ts";
import { test as ownerClockTest } from "../../dashboard/test-support/support/ownerClockTest.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/test-support/transientRecoveryPage.ts";

// Added to the environment the case's own `test` gives its dashboard server.
test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: async ({ extraEnv }, use) => {
    await use({ ...extraEnv, ...streamServerEnv });
  },
});

ownerClockTest(
  "a rate-limited stream answer shows today's notice, closes the stream, waits until T, then reopens",
  async ({ page, owner }) => {
    // Retry-After long enough that an observation-start arm would leave the
    // post-wait bound short of a full silence: such an arm reports lost
    // freshness 45 seconds of page time after the limited answer, before the
    // 40 seconds checked below from crossing T (about 7 seconds after it);
    // E3.2 needs a full bound from reopen. The owner holds reads for this span
    // of its own time.
    const retryAfterSeconds = 6;
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
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
    );
    await expect(problem).toContainText("Automatic checks resume then.");
    await expectEarlierSnapshotKept(page, retrievedA);
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
    await passPageMs(page, retryAfterSeconds * 1000 - 2_000);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
    );
    await expect(problem).not.toContainText("freshness was lost");

    // Fail every reopen so the bound that starts when the wait ends is visible.
    const stopFailing = await routeFailingRevisionStreams(page);
    restoreMain();
    // Page time passed up to two seconds before T with the stream still
    // closed and no further listing.
    expect(streamOpens).toEqual([]);
    expect(
      githubFor(page)
        .calls.slice(quietFrom)
        .filter(({ request }) => request.kind === "matching-refs"),
    ).toEqual([]);
    // Owner time reaches T, and the page clock crosses it; silence arms
    // immediately before this open. The open reaches the test after the
    // clock step that fires it returns, so the case waits for it; by then
    // any earlier open would have reached the test too, and there was none.
    owner.advanceOwnerClock(retryAfterSeconds * 1000);
    const reopened = untilStreamingAt(page, revisionA);
    await passPageMs(page, 2_000 + pageTimeStepMs);
    expect(streamOpens).toEqual([(await reopened).url()]);

    await test.step("E3.2: after the wait a full silence bound starts from reopen", async () => {
      await passPageMs(page, revisionStreamSilenceMs - 5_000);
      await expect(problem).not.toContainText("freshness was lost");
      await passPageMs(page, 5_000 + pageTimeStepMs);
      await expect(problem).toContainText("freshness was lost");
      await expectEarlierSnapshotKept(page, retrievedA);
    });

    await stopFailing();
    origin.push(revisionB, backlogB, recordsAt("B"));
    const resumed = untilStreamingAt(page, revisionB);
    await passPageMs(page, checkIntervalMs);
    await expectSettledPage(page, titlesOfB);
    await expect(problem).toHaveCount(0);
    await resumed;
    // The wait was kept by the owner this case started and advanced.
    expect(owner.standingOwnerPid()).toBe(owner.ownerPid);
  },
);
