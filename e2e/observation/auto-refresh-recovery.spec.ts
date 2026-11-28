// A visible Board keeps its confirmed snapshot beside failed origin checks.
// Its existing check schedule can recover once origin reaches it again.

import { boardConfirmedAt } from "../../dashboard/test-support/boardRefreshPage.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  expectSnapshotButtons,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  checksAskedWhilePassing,
  expectSteadyPace,
  openSettledAtA,
  passTimeUntilChecked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  focusCanonicalRecord,
  slicePlanLink,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/test-support/transientRecoveryPage.ts";
import {
  backlogB,
  dashboardStory,
  recordsAt,
  inspectDashboardStory,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
test("auto refresh recovery: a failed origin check keeps A and its confirmation until the next check finds B", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB } = origin.revisions;
  const { problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  const confirmationA = await boardConfirmedAt(page);
  await inspectDashboardStory(page);
  origin.advanceTo("B");
  const reconnect = origin.disconnectGit();
  try {
    expectSteadyPace(await passTimeUntilChecked(page, 502));
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText("The published trunk is unavailable");
    await expectEarlierSnapshotKept(page, retrievedA);
    expect(await boardConfirmedAt(page)).toBe(confirmationA);
    await expect(problem).toContainText(
      "Automatic checks continue every 15 seconds while this page is visible.",
    );
    await expect(page.getByRole("button", { name: "Retry" })).toHaveCount(0);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [revisionB],
    );
    expect(await checksAskedWhilePassing(page, 14_000)).toBe(0);
  } finally {
    reconnect();
  }
  await passTimeUntilChecked(page);
  await expectSettledPage(page, titlesOfB);
  await expectWholeSnapshot(page, { revision: revisionB, titles: titlesOfB }, [
    revisionA,
  ]);
  await expect(retrievedAt).not.toHaveAttribute("datetime", retrievedA);
  expect(Date.parse(await boardConfirmedAt(page))).toBeGreaterThan(
    Date.parse(confirmationA),
  );
  await expect(problem).toHaveCount(0);
});

test("auto refresh recovery: a newly published backlog listing the same work twice keeps A whole, without taking focus or changing its controls, until a check finds the repaired B", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops, {
    backlog: backlogB.replace(/^(- .*)$/m, "$1\n$1"),
    files: recordsAt("C"),
    atC: { backlog: backlogB, files: recordsAt("B") },
  });
  const {
    A: revisionA,
    B: malformedRevision,
    C: repairedRevision,
  } = origin.revisions;
  const routedTrunk = () =>
    remoteBranchHead(
      gitHubRepositoryUrl("terryyin/open-dough"),
      "refs/heads/main",
      { cwd: dashboard.home, env: { HOME: dashboard.home }, maxBuffer: 4096 },
    );
  expect(await routedTrunk()).toBe(revisionA);
  const { board, problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  const canonicalOfDashboardStory = await focusCanonicalRecord(
    storyCard(board, dashboardStory),
  );
  origin.advanceTo("B");
  expect(await routedTrunk()).toBe(malformedRevision);

  await test.step("the failed read of C is told apart from snapshot A, without taking focus", async () => {
    await passTimeUntilChecked(page);
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText(
      "The backlog already lists the same work twice",
    );
    await expectEarlierSnapshotKept(page, retrievedA);
    await expect(canonicalOfDashboardStory).toBeFocused();
    await expectSnapshotButtons(page, {
      backlogCards: 3,
      takenCards: 1,
      cards: 4,
    });
    await expect(parts(page).reading).toHaveCount(0);
  });

  await test.step("A stays whole: membership, order, pinned link, revision, and its own retrieval time", async () => {
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [repairedRevision, malformedRevision],
    );
    await expectEarlierSnapshotKept(page, retrievedA);
    // The Board has three Columns; the inspected story's detail is a region of its card.
    await expect(
      board.getByRole("region").and(page.locator(":not(.story-detail)")),
    ).toHaveCount(3);
    await expect(board.getByRole("article")).toHaveCount(4);
    await expect(canonicalOfDashboardStory).toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${revisionA}/.planning/seeds/SEED-021-progress.md#see-published-work`,
    );
  });

  await test.step("the next check finds the repaired B, publishes it whole, and withdraws the failure", async () => {
    origin.advanceTo("C");
    expect(await routedTrunk()).toBe(repairedRevision);
    await passTimeUntilChecked(page);
    await expectSettledPage(page, titlesOfB);
    await expectWholeSnapshot(
      page,
      { revision: repairedRevision, titles: titlesOfB },
      [revisionA, malformedRevision],
    );
    await expect(
      slicePlanLink(storyCard(board, dashboardStory)),
    ).toHaveAttribute(
      "href",
      `https://github.com/terryyin/open-dough/blob/${repairedRevision}/.planning/slice-plans/061-published-story-dashboard/PLAN.md`,
    );
    await expect(problem).toHaveCount(0);
    await expectSnapshotButtons(page, {
      backlogCards: 2,
      takenCards: 2,
      cards: 4,
    });
  });
});
