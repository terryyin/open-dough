import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
import {
  reviewRefresh,
  reviewRegion,
  comparisonChoice,
  landedRunChoice,
  filesToggle,
  toolbarComparison,
  showReviewDetails,
} from "../../dashboard/test-support/support/reviewControls.ts";
// An empty review explains the matching baseline or missing evidence below
// its status, with the context line fixed on scroll. A removed worktree with
// no captured landing offers Refresh and Close without invoking Git.
// Refresh can discover the removed worktree and a later opening shows the
// same gap. An unreachable trunk names the remote and target, with file
// discovery returning after Refresh when trunk is reachable. A kept launch
// with no workspace is refused at the launch boundary.

import { changedFilesList } from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { storyReviewEndpoint } from "../../dashboard/src/storyReviewContract.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import { reviewAfter } from "../../dashboard/test-support/support/launchLandingReview.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  expectFixedWhileScrolled,
  reviewBody,
  reviewFeedback,
} from "../../dashboard/test-support/support/reviewContextLine.ts";
import {
  expectReviewRead,
  openReview,
} from "../../dashboard/test-support/support/reviewRead.ts";
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
  const review = await openReview(page, card);
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  const body = reviewBody(review);
  await expect(body).toHaveText(
    `No changes: the worktree matches baseline ${trunk.slice(0, 7)}.`,
  );
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(review.getByRole("region")).toHaveCount(0);
  await expect(toolbarComparison(review)).toHaveText("All changes");
  await expect(filesToggle(review)).toHaveCount(0);
  await expectFixedWhileScrolled(page, body, [contextLine(review)]);
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
    await reviewChanges(card).click();
    const review = await showReviewDetails(reviewRegion(page));
    const status = reviewFeedback(review);
    await expect(status).toHaveText(gapExplanation);
    await expect(
      comparisonChoice(review, "Landed runs", { exact: true }),
    ).toBeChecked();
    await expect(review.getByRole("radio")).toHaveCount(1);
    // The explanation is the status above the work area; the body beneath it
    // shows nothing, and there is no context line.
    const body = reviewBody(review);
    await expect(body).toBeEmpty();
    expect((await body.boundingBox())?.y).toBeGreaterThanOrEqual(
      await status.evaluate((shown) => shown.getBoundingClientRect().bottom),
    );
    await expect(contextLine(review)).toHaveCount(0);
    await expect(review.getByRole("list")).toHaveCount(0);
    await expect(review.getByRole("region")).toHaveCount(0);
    await expect(reviewRefresh(review)).toBeVisible();
    await expect(
      review.getByRole("button", { name: "Close", exact: true }),
    ).toBeVisible();
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
    const review = reviewRegion(page);
    const live = await reviewAfter(page, open);
    await showReviewDetails(review);
    expect(live.kind).toBe("snapshot");
    expect(live.runs).toBeUndefined();
    await expect(review.getByRole("list")).not.toHaveCount(0);
    await expect(comparisonChoice(review, "Landed runs")).toHaveCount(0);

    // The worktree is removed with nothing captured for the launch.
    rmSync(workspace, { recursive: true, force: true });
    git(origin.project, "worktree", "prune");
    const gap = await reviewAfter(page, reviewRefresh(review));
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
    expect(gap.runs?.[0]?.comparison).toBeUndefined();
    await expect(reviewFeedback(review)).toHaveText(gapExplanation);
    await expect(
      comparisonChoice(review, "Landed runs", { exact: true }),
    ).toBeChecked();
    await expect(landedRunChoice(review).getByRole("option")).toHaveText([
      /^Execution — .+ — No captured comparison$/,
    ]);
    await expect(review).toContainText("Execution launched");
    await expect(review).toContainText("target origin/main");
    await expect(reviewBody(review)).toBeEmpty();
    await expect(review.getByRole("list")).toHaveCount(0);

    // A later opening reads the same gap.
    await closeSidePanel(review);
    expect(await reviewAfter(page, open)).toMatchObject({
      kind: "landing-unavailable",
      selectedRun: reference,
    });
    await expect(review.getByRole("list")).toHaveCount(0);
  });

  test("a trunk that cannot be fetched names its remote and target and shows no list until Refresh reaches it", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    keepLaunchRecord(dashboard, workspace);
    const card = await openBacklog(page, origin);
    const review = await openReview(page, card);
    const files = changedFilesList(review, "7 changed files");
    await expect(files).toBeVisible();
    const refresh = reviewRefresh(review);

    // The story's remote points at nothing reachable.
    const reachable = git(workspace, "config", "--get", "remote.origin.url");
    const unreachable = `${origin.machine}/unreachable.git`;
    git(workspace, "config", "remote.origin.url", unreachable);
    await refresh.press("Enter");
    await expectReviewRead(review);
    const status = reviewFeedback(review);
    await expect(status).toContainText(
      "Trunk could not be fetched (target main from remote origin), so there is no baseline to compare with:",
    );
    await expect(status).toContainText(`Worktree ${shownWorkspace}.`);
    await expect(review.getByRole("list")).toHaveCount(0);
    await expect(contextLine(review)).toHaveCount(0);
    await expect(refresh).toBeFocused();

    git(workspace, "config", "remote.origin.url", reachable);
    await refresh.press("Enter");
    await expectReviewRead(review);
    // The list, named by its seven files, is back.
    await expect(files).toBeVisible();
    await expect(status).not.toContainText("could not be fetched");
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
