// A visible dashboard honors GitHub's rate limit: a rate-limited revision
// check that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
// once `X-RateLimit-Remaining` is `0`) keeps the last successful snapshot,
// says when checks resume, and asks nothing -- not even when the page is seen
// again -- before that time; the check at that time reads what was published,
// and the steady pace returns once the wait has passed. Other failed
// automatic reads: ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (../support/fakeGitHub.ts) only publishes commits and limits answers. The
// page's clock is paused and advanced by the test. GitHub's wait is kept by
// the request owner's clock alone (github-request-admission.mjs), so this
// case's dashboard asks through an owner of its own, the released one started
// with a time the test advances (../support/ownerClockTest.ts):
// each directed wait passes when the test moves owner and page time to it,
// and a check the page's time reaches first is refused by the owner unasked.

import type { Page } from "@playwright/test";
import { expect, githubFor } from "../dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "../dashboardPage.ts";
import {
  callsSince,
  checksAskedWhilePassing,
  expectSteadyPace,
  headsChecks,
  openSettledAtA,
  pageTimeStepMs,
  passTimeUntilAsked,
  passTimeUntilChecked,
  recordsAt,
  setPageVisibility,
} from "../autoRefreshJourney.ts";
import { isCheck, untilPageRequestsAnswered } from "../pageRequestNotes.ts";
import { rateLimitedAnswer } from "../publishedOrigin.ts";
import {
  backlogB,
  inspectDashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../refreshJourney.ts";
import { test } from "../support/ownerClockTest.ts";
import { expectEarlierSnapshotKept } from "../transientRecoveryPage.ts";
import { failedAt, limitSaid, noticedResumeTime } from "../limitNotice.ts";

// A check asked after `passed` more page time, `quiet` of it having passed
// already, came at the directed time, within one step of it.
function expectAtDirectedTime(
  quiet: number,
  passed: number,
  directedMs: number,
): void {
  expect(quiet + passed).toBeGreaterThanOrEqual(directedMs);
  expect(quiet + passed).toBeLessThanOrEqual(directedMs + pageTimeStepMs);
}

// Lets page time pass until the page asks for the next revision check, which
// the boundary answers as limited or held back. Says how much page time
// passed and the wait the answer reported.
async function passTimeUntilLimited(page: Page) {
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  const passed = await passTimeUntilAsked(page);
  const response = await answer;
  expect(response.status()).toBe(502);
  const { retryAfterSeconds } = (await response.json()) as {
    readonly retryAfterSeconds: number;
  };
  return { passed, retryAfterSeconds };
}

test("auto refresh rate limit: a rate-limited check waits as GitHub directs before checking again, offers no Retry, and the check at the directed time reads B, clears the failure, and restores the steady pace", async ({
  page,
  owner,
}) => {
  const origin = await openSettledAtA(page);
  const { problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  await inspectDashboardStory(page);
  const restoreMain = origin.answerWith(
    "main",
    rateLimitedAnswer(429, { "Retry-After": "2" }),
  );
  const expectSnapshotA = async () => {
    await expectMembership(page, titlesOfA);
    await expectEarlierSnapshotKept(page, retrievedA);
  };

  await test.step("the rate-limited check is reported with the time GitHub asked checks to wait until", async () => {
    const limited = await passTimeUntilLimited(page);
    expectSteadyPace(limited.passed);
    expect(limited.retryAfterSeconds).toBe(2);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub asked to wait 2 seconds before asking again.",
    );
    await expect(problem).toContainText(limitSaid);
    await expect(problem).not.toContainText("Retry");
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    expect(await noticedResumeTime(page)).toBe((await failedAt(page)) + 2_000);
    // Failed rate-limited check: status names no revision; the problem keeps
    // the earlier retrieval time and Board membership proves A.
    await expectSnapshotA();
  });

  await test.step("no check, and no gh call, before the directed time -- not even when the page is seen again", async () => {
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, 1_000)).toBe(0);
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(await checksAskedWhilePassing(page, 750)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
  });

  restoreMain();

  await test.step("owner time held before the directed time, the check page time reaches is refused by the owner and asks GitHub nothing", async () => {
    const quietFrom = githubFor(page).calls.length;
    const held = await passTimeUntilLimited(page);
    expectAtDirectedTime(1_750, held.passed, 2_000);
    // The whole wait is left by the owner's time, which has not moved.
    expect(held.retryAfterSeconds).toBe(2);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests, so main of terryyin/open-dough was not asked of GitHub. Reading resumes in 2 seconds.",
    );
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    // Seen again, the page still waits out the two seconds the owner named.
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    await untilPageRequestsAnswered(page);
    expect(callsSince(page, quietFrom)).toEqual([]);
    await expectSnapshotA();
  });

  // GitHub's primary limit, directed by its reset time instead: longer than
  // the steady pace, so the page's next check can only come at the directed
  // time. Counted from the owner's time once it stands at the first wait's end.
  owner.advanceOwnerClock(2_000);
  const resetSeconds = 18;
  const resetMs = resetSeconds * 1_000;
  const restoreLimit = origin.answerWith(
    "main",
    rateLimitedAnswer(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(
        Math.floor(owner.ownerNow() / 1000) + resetSeconds,
      ),
    }),
  );

  await test.step("owner and page time at the directed time, the check is asked of GitHub, and a still-limited answer directs the next wait by its reset time", async () => {
    const from = githubFor(page).calls.length;
    const reset = await passTimeUntilLimited(page);
    expectAtDirectedTime(0, reset.passed, 2_000);
    expect(headsChecks(callsSince(page, from))).toHaveLength(1);
    expect(reset.retryAfterSeconds).toBe(resetSeconds);
    await expect(problem).toContainText(
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. GitHub asked to wait ${String(resetSeconds)} seconds before asking again.`,
    );
    // Past the steady pace and up to just before the reset time.
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, resetMs - 250)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
    await expectSnapshotA();
  });

  await test.step("restored access, the check at the directed time reads B and clears the failure", async () => {
    restoreLimit();
    origin.push(revisionB, backlogB, recordsAt("B"));
    owner.advanceOwnerClock(resetMs);
    expectAtDirectedTime(
      resetMs - 250,
      await passTimeUntilChecked(page),
      resetMs,
    );
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(problem).toHaveCount(0);
  });

  await test.step("with GitHub's wait passed, checks resume at the steady pace", async () => {
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    expect(headsChecks(callsSince(page, from))).toHaveLength(1);
    await expect(problem).toHaveCount(0);
  });
  // Every wait was kept by the owner this case started and advanced.
  expect(owner.standingOwnerPid()).toBe(owner.ownerPid);
});
