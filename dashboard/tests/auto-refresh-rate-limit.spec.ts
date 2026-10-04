// A visible dashboard honors GitHub's rate limit: a rate-limited revision
// check that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
// once `X-RateLimit-Remaining` is `0`) keeps the last successful snapshot,
// says when checks resume, and asks nothing -- not even when the page is seen
// again -- before that time; the check at that time reads what was published,
// and success restores the steady pace. Other failed automatic reads:
// ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and limits answers. The
// page's clock is paused and advanced by the test.

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
  passTimeUntilChecked,
  recordsAt,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { rateLimitedAnswer } from "./publishedOrigin.ts";
import {
  backlogB,
  inspectDashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";

test("auto refresh rate limit: a rate-limited check waits as GitHub directs before checking again, offers no Retry, and the check at the directed time reads B, clears the failure, and restores the steady pace", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, problem } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  await inspectDashboardStory(page);
  const restoreMain = origin.answerWith(
    "main",
    rateLimitedAnswer(429, { "Retry-After": "120" }),
  );

  await test.step("the rate-limited check is reported with the time GitHub asked checks to wait until", async () => {
    expectSteadyPace(await passTimeUntilChecked(page, 502));
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading main of terryyin/open-dough. GitHub asked to wait 120 seconds before asking again.",
    );
    await expect(problem).toContainText(
      "As GitHub asked, automatic checks wait until",
    );
    await expect(problem).not.toContainText("Retry");
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    const failedAt = await problem
      .locator("time")
      .nth(0)
      .getAttribute("datetime");
    await expect(problem.locator("time").nth(2)).toHaveAttribute(
      "datetime",
      new Date(Date.parse(failedAt ?? "") + 120_000).toISOString(),
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
    expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(await checksAskedWhilePassing(page, 59_000)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
  });

  restoreMain();
  // GitHub's primary limit, directed by its reset time instead.
  const restoreLimit = origin.answerWith(
    "main",
    rateLimitedAnswer(403, {
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 120),
    }),
  );

  await test.step("the next check is asked at the directed time, and a still-limited answer directs the next wait by its reset time", async () => {
    const passed = await passTimeUntilChecked(page, 502);
    expect(119_000 + passed).toBeGreaterThanOrEqual(120_000);
    expect(119_000 + passed).toBeLessThanOrEqual(120_250);
    await expect(problem).toContainText(
      "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403) while reading main of terryyin/open-dough. GitHub asked to wait",
    );
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, 45_000)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
    await expectMembership(page, titlesOfA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
  });

  await test.step("restored access, the check at the directed time reads B and clears the failure", async () => {
    restoreLimit();
    origin.push(revisionB, backlogB, recordsAt("B"));
    // GitHub's reset time, in whole seconds, directed a wait of about two
    // minutes from the limited answer; 45 seconds of it have passed.
    expect(await checksAskedWhilePassing(page, 30_000)).toBe(0);
    const passed = await passTimeUntilChecked(page);
    expect(75_000 + passed).toBeGreaterThanOrEqual(100_000);
    expect(75_000 + passed).toBeLessThanOrEqual(120_250);
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(problem).toHaveCount(0);
  });

  await test.step("success lifts GitHub's wait: checks resume at the steady pace", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(problem).toHaveCount(0);
  });
});
