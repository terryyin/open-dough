// A visible dashboard honors GitHub's rate limit: a refused detail request
// starts a wait (`Retry-After`, or `X-RateLimit-Reset`
// once `X-RateLimit-Remaining` is `0`) keeps the last successful snapshot,
// says when checks resume, and asks nothing -- not even when the page is seen
// again -- before that time; the check at that time reads what was published,
// and the steady pace returns once the wait has passed. Other failed
// automatic reads: ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (../../dashboard/test-support/support/fakeGitHub.ts) only publishes commits and limits answers. The
// page's clock is paused and advanced by the test. GitHub's wait is kept by
// the request owner's clock alone (github-request-admission.mjs), so this
// case's dashboard asks through an owner of its own, the released one started
// with a time the test advances (../../dashboard/test-support/support/ownerClockTest.ts):
// each directed wait passes when the test moves owner and page time to it,
// and a check the page's time reaches first is refused by the owner unasked.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import type { Page } from "@playwright/test";
import {
  expect,
  githubFor,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  checksAskedWhilePassing,
  expectSteadyPace,
  openSettledAtA,
  pageTimeStepMs,
  passTimeUntilAsked,
  passTimeUntilChecked,
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isCheck,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  rateLimitedAnswer,
  type OriginAnswer,
} from "../../dashboard/test-support/publishedOrigin.ts";
import {
  dashboardEntry,
  inspectDashboardStory,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import { test } from "../../dashboard/test-support/support/ownerClockTest.ts";
import { readUrl } from "../../dashboard/test-support/support/sharedReads.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/test-support/transientRecoveryPage.ts";
import {
  failedAt,
  limitSaid,
  noticedResumeTime,
} from "../../dashboard/test-support/limitNotice.ts";

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

test("auto refresh waits out a standing REST limit without offering Retry, then checks at the directed time and restores its pace", async ({
  page,
  dashboard,
  afterGitHubStops,
  owner,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB } = origin.revisions;
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl("terryyin/open-dough"),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(revisionA);
  const { problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  await inspectDashboardStory(page);
  origin.advanceTo("B");
  const endpoint = new URL(page.url()).origin;
  const seed = `.planning/${dashboardEntry.href.replace(/#.*/, "")}`;
  const detail = readUrl(
    endpoint,
    `&revision=${revisionB}&path=${encodeURIComponent(seed)}`,
  );
  const startWait = async (answer: OriginAnswer, retryAfterSeconds: number) => {
    const restore = origin.answerWith(seed, answer);
    try {
      const refused = await page.request.get(detail, {
        headers: { Origin: endpoint },
      });
      expect(refused.status()).toBe(502);
      expect(await refused.json()).toMatchObject({
        error: expect.stringContaining(
          `while reading ${seed} at ${revisionB}.`,
        ),
        retryAfterSeconds,
      });
    } finally {
      restore();
    }
  };
  const expectSnapshotA = async () => {
    await expectMembership(page, titlesOfA);
    await expectEarlierSnapshotKept(page, retrievedA);
  };

  await startWait(rateLimitedAnswer(429, { "Retry-After": "2" }), 2);
  await test.step("the held-back check reports when checks can resume", async () => {
    const limited = await passTimeUntilLimited(page);
    expectSteadyPace(limited.passed);
    expect(limited.retryAfterSeconds).toBe(2);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests, so main of terryyin/open-dough was not asked of GitHub. Reading resumes in 2 seconds.",
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
  await startWait(
    rateLimitedAnswer(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(
        Math.floor(owner.ownerNow() / 1000) + resetSeconds,
      ),
    }),
    resetSeconds,
  );

  await test.step("a longer owner wait still holds back the next check and delays another until the reset time", async () => {
    const from = githubFor(page).calls.length;
    const reset = await passTimeUntilLimited(page);
    expectAtDirectedTime(0, reset.passed, 2_000);
    expect(callsSince(page, from)).toEqual([]);
    expect(reset.retryAfterSeconds).toBe(resetSeconds);
    await expect(problem).toContainText(
      `GitHub limited the rate of the local GitHub CLI's requests, so main of terryyin/open-dough was not asked of GitHub. Reading resumes in ${String(resetSeconds)} seconds.`,
    );
    // Past the steady pace and up to just before the reset time.
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, resetMs - 250)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
    await expectSnapshotA();
  });

  await test.step("restored access, the check at the directed time reads B and clears the failure", async () => {
    expect(
      await remoteBranchHead(
        gitHubRepositoryUrl("terryyin/open-dough"),
        "refs/heads/main",
        {
          cwd: dashboard.home,
          env: { HOME: dashboard.home },
          maxBuffer: 4096,
        },
      ),
    ).toBe(revisionB);
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
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(problem).toHaveCount(0);
  });
  // Every wait was kept by the owner this case started and advanced.
  expect(owner.standingOwnerPid()).toBe(owner.ownerPid);
});
