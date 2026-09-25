// A visible dashboard honors GitHub's rate limit: a rate-limited revision
// check that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
// once `X-RateLimit-Remaining` is `0`) keeps the last successful snapshot,
// says when checks resume, and asks nothing -- not even when the page is seen
// again -- before that time; a manual Retry still reads at once, and success
// restores the steady pace. Other failed automatic reads:
// ./auto-refresh-recovery.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and limits answers. The
// page's clock is paused and advanced by the test.

import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
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
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";

test("auto refresh rate limit: a rate-limited check waits as GitHub directs before checking again, and a manual Retry that succeeds reads B at once, clears the failure, and restores the steady pace", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, problem, retry, refresh } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
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
    await expect(problem).toContainText("Press Retry to read again sooner.");
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

  await test.step("a manual Retry refused without its own direction still reports, and keeps, GitHub's earlier wait", async () => {
    const quietFrom = githubFor(page).calls.length;
    await retry.click();
    await expect
      .poll(() => callsSince(page, quietFrom).map(({ argv }) => argv[1]))
      .toEqual(["repos/terryyin/open-dough/commits/main"]);
    await expect(problem).toContainText("(HTTP 403) while reading main");
    await expect(problem).toContainText(
      "As GitHub asked, automatic checks wait until",
    );
    await expect(problem).not.toContainText("Automatic checks continue every");
    const afterRetry = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, 30_000)).toBe(0);
    expect(callsSince(page, afterRetry)).toEqual([]);
    await expectMembership(page, titlesOfA);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
  });

  await test.step("restored access and a manual Retry, before the directed time, read B at once and clear the failure", async () => {
    restoreLimit();
    origin.push(revisionB, backlogB, recordsAt("B"));
    await retry.click();
    await expectMembership(page, titlesOfB);
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(problem).toHaveCount(0);
    await expect(refresh).toHaveAccessibleName("Refresh");
  });

  await test.step("success lifts GitHub's wait: checks resume at the steady pace", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(problem).toHaveCount(0);
  });
});
