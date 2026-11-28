// A Taken story whose agent profile on trunk records Story Branch Mode shows
// its slice progress from the plan at that branch's head, named as branch
// progress that is not in trunk; trunk's copy of the plan is never shown as
// its progress. Trunk Mode stories keep trunk's progress unlabelled; a story
// without a profile shows trunk's copy, labelled as such, and nothing is read
// from a branch named like it. Two profiles naming a story, a branch no longer
// published, and a plan missing or uninterpretable on the branch are each
// shown as that gap. The fake GitHub only publishes trunk and the branch heads
// (../../dashboard/test-support/branchProgressRecords.ts); the local read boundary, the shared readers,
// and the page decide everything shown.

import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { openedSettled } from "../../dashboard/test-support/branchRefreshJourney.ts";
import { boardConfirmation } from "../../dashboard/server/boardConfirmation.ts";
import { homeReviewRepository } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import {
  expectNoSliceCount,
  progressSource,
  sliceBar,
  sliceProgress,
} from "../../dashboard/test-support/storyCardFacts.ts";
import {
  beforeProfiles,
  branchDeleted,
  onBranch,
  onTrunk,
  planMissing,
  planPath,
  planUninterpretable,
  profilePath,
  twoOwners,
} from "../../dashboard/test-support/branchProgressRecords.ts";
import { credit } from "../../dashboard/test-support/agentCredit.ts";

test("Taken cards show progress from where each story is published, or the gap that stops it", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const { origin } = await openedSettled(page, afterGitHubStops);
  const { taken } = parts(page);
  const { requests } = origin;
  const revision = origin.at("trunk").revision;
  const branchHead = origin.at("story/example").revision;
  const missingHead = origin.at("story/plan-missing").revision;
  const unreadableHead = origin.at("story/uninterpretable").revision;
  const progress = (title: string) => sliceProgress(storyCard(taken, title));

  await test.step("a Story Branch Mode story shows 6 of 8 from its branch head, named as not in trunk", async () => {
    // The scan view qualifies the count briefly; the exact branch and
    // revision are in the story's detail (the last step).
    await expect(progress(onBranch)).toContainText(
      "From story branch; not in trunk.",
    );
    await expect(storyCard(taken, onBranch)).not.toContainText("story/example");
    await expect(
      sliceBar(progress(onBranch), "6 of 8 slices recorded complete"),
    ).toBeVisible();
    await expect(progress(onBranch)).not.toContainText("0 of 8");
  });

  await test.step("its clock measures from the branch plan's last commit", async () => {
    await expect(progress(onBranch)).toContainText(
      "Current slice started 7 min ago",
    );
  });

  await test.step("a Trunk Mode story shows trunk's progress with no source label", async () => {
    await expect(progress(onTrunk)).toContainText(
      "1 of 2 slices recorded complete",
    );
    await expect(progress(onTrunk)).toContainText(
      "Current slice started 12 min ago",
    );
    await expect(progressSource(progress(onTrunk))).toHaveCount(0);
  });

  await test.step("a story without a profile shows trunk's copy, labelled, and not the similarly named branch", async () => {
    await expect(progress(beforeProfiles)).toContainText(
      "Trunk copy; execution branch not recorded.",
    );
    await expect(progress(beforeProfiles)).toContainText(
      "1 of 2 slices recorded complete",
    );
  });

  await test.step("two profiles naming a story leave no single progress source", async () => {
    await expectNoSliceCount(
      progress(twoOwners),
      "More than one agent profile names this story, so it has no single progress source.",
    );
    await expect(progress(twoOwners)).not.toContainText(
      "Current slice started",
    );
  });

  await test.step("a recorded branch no longer published is a gap, not trunk's count", async () => {
    await expectNoSliceCount(
      progress(branchDeleted),
      "The recorded branch story/deleted is no longer published",
    );
  });

  await test.step("a plan missing on the branch is that gap", async () => {
    await expectNoSliceCount(
      progress(planMissing),
      `The associated plan ${planPath("plan-missing")} is missing on this branch.`,
    );
    await expect(progress(planMissing)).toContainText(
      "From story branch; not in trunk.",
    );
  });

  await test.step("a plan uninterpretable on the branch is that gap", async () => {
    await expectNoSliceCount(
      progress(planUninterpretable),
      "Plan slices uninterpretable:",
    );
  });

  await test.step("only recorded, unambiguous branches are confirmed, and on them only the plan is read", async () => {
    const calls = githubFor(page).calls;
    expect(calls.filter(({ request }) => request.kind === "branch")).toEqual(
      [],
    );
    const record = await boardConfirmation(
      homeReviewRepository(dashboard.home),
      "main",
    );
    expect(record?.branches?.map(({ branch }) => branch).sort()).toEqual([
      "story/deleted",
      "story/example",
      "story/plan-missing",
      "story/uninterpretable",
    ]);
    const trunkRevisions = new Set([revision]);
    const onBranches = requests.flatMap(({ request }) =>
      request.kind === "content" || request.kind === "commit-list"
        ? trunkRevisions.has(request.revision)
          ? []
          : [`${request.kind} ${request.path}@${request.revision}`]
        : [],
    );
    expect(onBranches.sort()).toEqual(
      [
        `content ${planPath("on-branch")}@${branchHead}`,
        `commit-list ${planPath("on-branch")}@${branchHead}`,
        `content ${planPath("plan-missing")}@${missingHead}`,
        `content ${planPath("plan-uninterpretable")}@${unreadableHead}`,
      ].sort(),
    );
    // The Take is read on trunk, where the profile was read.
    expect(
      requests.some(
        ({ request }) =>
          request.kind === "commit-list" &&
          request.path === profilePath("Akiho") &&
          request.revision === revision,
      ),
    ).toBe(true);
  });

  await test.step("the detail shows the same branch source and its slices", async () => {
    const detail = await inspectedDetail(storyCard(taken, onBranch));
    await expect(detail).toContainText("6 of 8 slices recorded complete");
    await expect(detail).toContainText(
      `From branch story/example at ${branchHead.slice(0, 7)}; not in trunk.`,
    );
    // The exact branch of the assignment is detail too, still never trunk.
    await expect(credit(detail).branch).toHaveText(
      "Branch context: story/example (story branch work; not on trunk)",
    );
  });

  await test.step("a plan missing on its branch names that branch and revision in detail", async () => {
    await expect(
      await inspectedDetail(storyCard(taken, planMissing)),
    ).toContainText(
      `From branch story/plan-missing at ${missingHead.slice(0, 7)}; not in trunk.`,
    );
  });
});
