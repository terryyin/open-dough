// An empty review explains the matching baseline or missing evidence below
// its status, with the context line fixed on scroll. A removed worktree with
// no captured landing offers Refresh and Close without invoking Git.
// Refresh can discover the removed worktree and a later opening shows the
// same gap. An unreachable trunk names the remote and target, with file
// discovery returning after Refresh when trunk is reachable. A kept launch
// with no workspace is refused at the launch boundary.

import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { storyReviewEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openReviewChanges,
  reviewChangesAfter,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  branch,
  git,
  storyWorktree,
  unchangedRepository,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  keepLaunchRecord,
  storyALaunch,
} from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { storyARepository } from "../../dashboard/test-support/support/storyAReviewRepository.ts";

const shownWorkspace = "~/git/open-dough/.worktrees/story-a";
const gapExplanation =
  "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.";
test.use({ originRepository: unchangedRepository });

test("a worktree straight off trunk has no changes against the named baseline", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, base: trunk } = storyWorktree(origin);
  keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  const review = await openReviewChanges(page, card);
  await review.expectRead();
  await review.context.expectWords(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  await review.files.expectNothingShown();
  await review.expectComparisonNamed("All changes");
  await review.expectNoFilesToggle();
  await review.status.expectBodyFixedContext(
    `No changes: the worktree matches baseline ${trunk.slice(0, 7)}.`,
  );
});

test.describe("from Story A's declared history", () => {
  test.use({ originRepository: storyARepository });
  test("a removed worktree with no captured landing explains the gap, and no Git runs", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace, merged } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    rmSync(workspace, { recursive: true, force: true });
    // Trunk's later commit, which a fetch would bring, is still unknown here.
    const fetchedTrunk = () => git(origin.project, "rev-parse", "origin/main");
    expect(fetchedTrunk()).toBe(merged);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.status.expectFeedback(gapExplanation);
    await review.comparison.expectOnly("Landed runs");
    // The explanation is the status above the work area; the body beneath it
    // shows nothing, and there is no context line.
    await review.status.expectBodyEmptyBelowFeedback();
    await review.status.expectNoContextLine();
    await review.files.expectNothingShown();
    await review.status.expectRefreshAndCloseOffered();
    expect(fetchedTrunk()).toBe(merged);
  });

  test("a launch with its worktree is no landed run, and once Refresh finds the worktree gone the review lists that run's gap and no files, as a later opening does", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const reference = randomUUID();
    // Story A's execution on its worktree, reporting through this dashboard.
    const record = storyALaunch()
      .onStoryBranch({ workspace, branch })
      .reportingThrough({
        origin: dashboard.origin,
        reference,
        command: "report",
      })
      .please();
    keepLaunchRecords(dashboard, [record]);
    const card = await openBacklog(page, origin);
    const open = reviewChanges(card);
    const review = await reviewChangesAfter(page, open);
    const live = review.answer;
    expect(live?.kind).toBe("snapshot");
    expect(live?.runs).toBeUndefined();
    await review.files.expectListed(/changed file/);
    await review.comparison.expectOffered("Landed runs", false);

    // The worktree is removed with nothing captured for the launch.
    rmSync(workspace, { recursive: true, force: true });
    git(origin.project, "worktree", "prune");
    const gap = (await review.refreshAndAnswer()).answer;
    expect(gap).toMatchObject({
      kind: "landing-unavailable",
      selectedRun: reference,
      explanation: gapExplanation,
      runs: [
        {
          key: reference,
          workflow: "execution",
          launchedAt: record.launchedAt,
          remote: "origin",
          target: "main",
        },
      ],
    });
    expect(gap?.runs?.[0]?.comparison).toBeUndefined();
    await review.status.expectFeedback(gapExplanation);
    await review.comparison.expectChosen("Landed runs");
    await review.landedRun.expectOptions([
      /^Execution — .+ — No captured comparison$/,
    ]);
    await review.expectText("Execution launched");
    await review.expectText("target origin/main");
    await review.status.expectBodyEmpty();
    await review.files.expectNoLists();

    // A later opening reads the same gap.
    await review.close();
    const reopened = await reviewChangesAfter(page, open);
    expect(reopened.answer).toMatchObject({
      kind: "landing-unavailable",
      selectedRun: reference,
    });
    await reopened.files.expectNoLists();
  });

  test("a trunk that cannot be fetched names its remote and target and shows no list until Refresh reaches it", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReviewChanges(page, card);
    await review.expectRead();
    await review.files.expectListed("7 changed files");

    // The story's remote points at nothing reachable.
    const reachable = git(workspace, "config", "--get", "remote.origin.url");
    const unreachable = `${origin.machine}/unreachable.git`;
    git(workspace, "config", "remote.origin.url", unreachable);
    await review.status.refreshByKeyboard();
    await review.status.expectFeedbackSays(
      "Trunk could not be fetched (target main from remote origin), so there is no baseline to compare with:",
    );
    await review.status.expectFeedbackSays(`Worktree ${shownWorkspace}.`);
    await review.files.expectNoLists();
    await review.status.expectNoContextLine();
    await review.status.expectRefreshFocused();

    git(workspace, "config", "remote.origin.url", reachable);
    await review.status.refreshByKeyboard();
    // The list, named by its seven files, is back.
    await review.files.expectListed("7 changed files");
    await review.status.expectFeedbackSays("could not be fetched", false);
  });
});

test("a story whose kept launch record names no workspace offers no review", async ({
  page,
  dashboard,
  origin,
}) => {
  // Story A's execution, whose start established no worktree.
  keepLaunchRecords(dashboard, [storyALaunch().please()]);
  const card = await openBacklog(page, origin);
  await expect(storyCardSessions(card)).toHaveCount(1);
  await expect(reviewChanges(card)).toHaveCount(0);
  const search = new URLSearchParams({
    source: "open-dough",
    identity: queuedIdentity,
  }).toString();
  const response = await page.request.get(
    `${dashboard.baseURL}${storyReviewEndpoint}?${search}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(response.status()).toBe(404);
  expect(await response.json()).toEqual({
    error: "This story has no launch workspace to review.",
  });
});
