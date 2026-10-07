// A visible dashboard recovers from failed automatic reads without misstating
// what was published: a failed revision check keeps the last successful
// snapshot and continues checks at the steady pace; an eligible connection
// failure reading a newly found commit's backlog keeps A, schedules
// project-local recovery, and heals when GitHub answers without waiting for
// the next check. A shown revision's unread detail:
// ./auto-refresh-detail-recovery.spec.ts. A rate limit's directed wait:
// ./auto-refresh-rate-limit.spec.ts. The page, its local authenticated read
// boundary, the `gh` invocation, and the shared interpretation are the
// production ones; the fake GitHub behind the synthetic `gh`
// (./support/fakeGitHub.ts) only publishes commits and fails answers. The
// page's clock is paused and advanced by the test.

import { expect, githubFor, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  expectSnapshotButtons,
  expectWholeSnapshot,
  parts,
} from "./dashboardPage.ts";
import {
  callsSince,
  checksAskedWhilePassing,
  contentReads,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilChecked,
  recordsAt,
  headsChecks,
} from "./autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { noConnection, type OriginAnswer } from "./publishedOrigin.ts";
import {
  backlogB,
  dashboardStory,
  inspectDashboardStory,
  revisionA,
  revisionB,
  revisionC,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";
// `gh` fails in a way the boundary cannot put a category to.
const unexplainedFailure: OriginAnswer = {
  exitCode: 1,
  stderr: "gh: unexplained failure\n",
};

test("auto refresh recovery: a failed check keeps A at the steady pace; an eligible backlog failure of B recovers on its own without a check", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, stages, problem } = parts(page);
  const retrievedAt = source.locator("time");
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  await inspectDashboardStory(page);
  const restoreMain = origin.answerWith("main", unexplainedFailure);

  await test.step("a failed check is reported, and A is still named the last successful snapshot", async () => {
    expectSteadyPace(await passTimeUntilChecked(page, 502));
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText(
      "The local authenticated read failed while reading main of terryyin/open-dough.",
    );
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expect(problem).toContainText(
      "Automatic checks continue every 15 seconds while this page is visible.",
    );
    await expect(problem).not.toContainText("Retry");
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [revisionB],
    );
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
  });

  restoreMain();
  origin.push(revisionB, backlogB, recordsAt("B"));
  const restoreBacklogAtB = origin.answerWith(revisionB, noConnection);
  const beforeB = githubFor(page).calls.length;

  await test.step("B is found at the steady pace, but its backlog cannot be read: A stays, and recovery is scheduled", async () => {
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(problem).toContainText(
      `The local GitHub CLI could not reach GitHub while reading .planning/PRODUCT-BACKLOG.md at ${revisionB}.`,
    );
    await expect(problem).toContainText("this page reads it");
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expectMembership(page, titlesOfA);
    await expect(source).toContainText(revisionA);
    await expect(source).not.toContainText(revisionB);
    await expect(retrievedAt).toHaveAttribute("datetime", retrievedA);
    await expect(stages.locator(`a[href*="${revisionB}"]`)).toHaveCount(0);
    const calls = callsSince(page, beforeB);
    expect(headsChecks(calls)).toHaveLength(1);
    expect(contentReads(calls)).toEqual([
      `.planning/PRODUCT-BACKLOG.md?ref=${revisionB}`,
    ]);
  });

  await test.step("nothing is asked again before the recovery wait, including no revision check", async () => {
    const quietFrom = githubFor(page).calls.length;
    expect(await checksAskedWhilePassing(page, 14_000)).toBe(0);
    expect(callsSince(page, quietFrom)).toEqual([]);
  });

  await test.step("due recovery reads B whole and clears the failure without a check", async () => {
    restoreBacklogAtB();
    const beforeRecovery = githubFor(page).calls.length;
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA],
    );
    await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA);
    await expect(problem).toHaveCount(0);
    expect(headsChecks(callsSince(page, beforeRecovery))).toEqual([]);
  });
});
test("auto refresh recovery: a newly published backlog listing the same work twice keeps A whole, without taking focus or changing its controls, until a check finds the repaired B", async ({
  page,
}) => {
  const origin = await openSettledAtA(page);
  const { source, stages, problem } = parts(page);
  const retrievedA =
    (await source.locator("time").getAttribute("datetime")) ?? "";
  const dashboardCard = stages.getByRole("article", { name: dashboardStory });
  await dashboardCard.getByRole("button", { name: "Inspect story" }).click();
  const canonicalOfDashboardStory = dashboardCard.getByRole("link", {
    name: /^Canonical record/,
  });
  await canonicalOfDashboardStory.focus();
  origin.push(
    revisionC,
    backlogB.replace(/^(- .*)$/m, "$1\n$1"),
    recordsAt("C"),
  );

  await test.step("the failed read of C is told apart from snapshot A, without taking focus", async () => {
    await passTimeUntilChecked(page);
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText(
      "The backlog already lists the same work twice",
    );
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expect(canonicalOfDashboardStory).toBeFocused();
    await expectSnapshotButtons(page, { backlogCards: 3, cards: 4 });
    await expect(parts(page).reading).toHaveCount(0);
  });

  await test.step("A stays whole: membership, order, pinned link, revision, and its own retrieval time", async () => {
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [revisionB, revisionC],
    );
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    // The two stages; the inspected story's detail is a region of its card.
    await expect(
      stages.getByRole("region").and(page.locator(":not(.story-detail)")),
    ).toHaveCount(2);
    await expect(stages.getByRole("article")).toHaveCount(4);
    await expect(canonicalOfDashboardStory).toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revisionA}/.planning/seeds/SEED-021-progress.md#see-published-work`,
    );
  });

  await test.step("the next check finds the repaired B, publishes it whole, and withdraws the failure", async () => {
    origin.push(revisionB, backlogB, recordsAt("B"));
    await passTimeUntilChecked(page);
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: revisionB, titles: titlesOfB },
      [revisionA, revisionC],
    );
    await expect(
      stages
        .getByRole("article", { name: dashboardStory })
        .getByRole("link", { name: /^Slice plan/ }),
    ).toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revisionB}/.planning/slice-plans/061-published-story-dashboard/PLAN.md`,
    );
    await expect(problem).toHaveCount(0);
    await expectSnapshotButtons(page, { backlogCards: 2, cards: 4 });
  });
});
