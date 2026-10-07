// A visible dashboard honors GitHub's rate limit: a rate-limited revision
// check that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
// once `X-RateLimit-Remaining` is `0`) keeps the last successful snapshot,
// says when checks resume, and asks nothing -- not even when the page is seen
// again -- before that time; the check at that time reads what was published,
// and the steady pace returns once the wait has passed. Other failed
// automatic reads: ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and limits answers. The
// page's clock is paused and advanced by the test. The server keeps GitHub's
// wait by its own real clock (../server/readAdmission.ts), so GitHub directs
// waits the real clock can pass here -- two seconds, seen again before it
// ends, and a reset time just beyond the steady pace -- and the real time a
// wait names passes before the page's time reaches it.

import type { Page } from "@playwright/test";
import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  callsSince,
  checksAskedWhilePassing,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilAsked,
  passTimeUntilChecked,
  recordsAt,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { isCheck } from "./pageRequestNotes.ts";
import { rateLimitedAnswer } from "./publishedOrigin.ts";
import {
  backlogB,
  inspectDashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";
import { untilReported } from "./support/directedWait.ts";

// Lets page time pass until the page asks for the next revision check, which
// the boundary answers as rate-limited. Says how much page time passed, the
// wait the answer reported, and when, by the real clock, it arrived.
async function passTimeUntilLimited(page: Page) {
  const answer = page.waitForResponse((response) => isCheck(response.url()));
  const passed = await passTimeUntilAsked(page);
  const response = await answer;
  const arrivedAt = Date.now();
  expect(response.status()).toBe(502);
  const { retryAfterSeconds } = (await response.json()) as {
    readonly retryAfterSeconds: number;
  };
  return { passed, retryAfterSeconds, arrivedAt };
}

test("auto refresh rate limit: a rate-limited check waits as GitHub directs before checking again, offers no Retry, and the check at the directed time reads B, clears the failure, and restores the steady pace", async ({
  page,
}) => {
  // About twenty seconds of it are GitHub's waits passing by the real clock.
  test.setTimeout(90_000);
  const origin = await openSettledAtA(page);
  const { source, problem } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  await inspectDashboardStory(page);
  const restoreMain = origin.answerWith(
    "main",
    rateLimitedAnswer(429, { "Retry-After": "2" }),
  );
  let limitedAt = 0;

  await test.step("the rate-limited check is reported with the time GitHub asked checks to wait until", async () => {
    const limited = await passTimeUntilLimited(page);
    expectSteadyPace(limited.passed);
    expect(limited.retryAfterSeconds).toBe(2);
    limitedAt = limited.arrivedAt;
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub asked to wait 2 seconds before asking again.",
    );
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
    );
    await expect(problem).not.toContainText("Retry");
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    const failedAt = await problem
      .locator("time")
      .nth(0)
      .getAttribute("datetime");
    await expect(problem.locator("time").nth(2)).toHaveAttribute(
      "datetime",
      new Date(Date.parse(failedAt ?? "") + 2_000).toISOString(),
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expectMembership(page, titlesOfA);
    await expect(source).toContainText(revisionA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
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
  // The server holds back every read until GitHub's time has passed by its
  // own clock; only then may the page's time reach it.
  await untilReported(limitedAt, 2);
  // GitHub's primary limit, directed by its reset time instead: a little
  // longer than the steady pace, so the page's next check can only come at
  // the directed time, and short enough for the server's real clock to pass.
  const restoreLimit = origin.answerWith(
    "main",
    rateLimitedAnswer(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 18),
    }),
  );
  let reset = { passed: 0, retryAfterSeconds: 0, arrivedAt: 0 };

  await test.step("the next check is asked at the directed time, and a still-limited answer directs the next wait by its reset time", async () => {
    reset = await passTimeUntilLimited(page);
    expect(1_750 + reset.passed).toBeGreaterThanOrEqual(2_000);
    expect(1_750 + reset.passed).toBeLessThanOrEqual(2_250);
    // The reset time, in whole seconds, was at most 18 seconds away, and
    // still beyond the steady pace.
    expect(reset.retryAfterSeconds).toBeGreaterThan(15);
    expect(reset.retryAfterSeconds).toBeLessThanOrEqual(18);
    await expect(problem).toContainText(
      `GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. GitHub asked to wait ${String(reset.retryAfterSeconds)} seconds before asking again.`,
    );
    const quietFrom = githubFor(page).calls.length;
    expect(
      await checksAskedWhilePassing(
        page,
        reset.retryAfterSeconds * 1_000 - 250,
      ),
    ).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
    await expectMembership(page, titlesOfA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
  });

  await test.step("restored access, the check at the directed time reads B and clears the failure", async () => {
    restoreLimit();
    origin.push(revisionB, backlogB, recordsAt("B"));
    await untilReported(reset.arrivedAt, reset.retryAfterSeconds);
    const passed = await passTimeUntilChecked(page);
    const directedMs = reset.retryAfterSeconds * 1_000;
    expect(directedMs - 250 + passed).toBeGreaterThanOrEqual(directedMs);
    expect(directedMs - 250 + passed).toBeLessThanOrEqual(directedMs + 250);
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
});
