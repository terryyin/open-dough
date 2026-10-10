// A claimed Story Branch Mode launch that never landed, in the story review
// (../STORY-REVIEW-ONE-SHOT.md): over the real installed start, a launch with
// its workspace is no landed run, and once its worktree is gone with nothing
// captured the review explains that evidence gap instead of listing files.
import { existsSync, rmSync } from "node:fs";
import { test, expect } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { git } from "./support/oneShotLanding.ts";
import { readReview } from "./support/oneShotReview.ts";
import { reviewBody, reviewFeedback } from "./support/reviewContextLine.ts";
import { claimedStoryBranchLaunch } from "./support/storyBranchIntegration.ts";
import { storyReviewEndpoint, storyReviewSchema } from "../src/storyReview.ts";

test("a claimed launch with its workspace is no landed run, and once its worktree is gone without capture the review explains the gap and lists no files", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(90_000);
  const { start, record } = await claimedStoryBranchLaunch(dashboard, "codex");
  expect(record.landing).toBeUndefined();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  const review = page.getByRole("region", { name: "Review changes" });
  const live = await readReview(page, card);
  expect(live.kind).toBe("snapshot");
  expect(live.runs).toBeUndefined();
  await expect(review.getByRole("radio", { name: "Landed runs" })).toHaveCount(
    0,
  );

  // The worktree is removed with nothing captured for the launch.
  rmSync(start.workspace, { recursive: true, force: true });
  git(origin.project, "worktree", "prune");
  expect(existsSync(start.workspace)).toBe(false);
  const refreshed = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await review.getByRole("button", { name: "Refresh" }).click();
  const gap = storyReviewSchema.parse(await (await refreshed).json());
  expect(gap).toMatchObject({
    kind: "landing-unavailable",
    selectedRun: record.request.reporting?.reference,
    explanation:
      "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.",
    runs: [
      {
        key: record.request.reporting?.reference,
        workflow: "execution",
        launchedAt: record.launchedAt,
        remote: "origin",
        target: "main",
      },
    ],
  });
  expect(gap.runs?.[0]?.comparison).toBeUndefined();
  await expect(reviewFeedback(review)).toHaveText(
    "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.",
  );
  await expect(
    review.getByRole("radio", { name: "Landed runs", exact: true }),
  ).toBeChecked();
  await expect(
    review.getByRole("listbox", { name: "Landed run" }).getByRole("option"),
  ).toHaveText([/^Execution — .+ — No captured comparison$/]);
  await expect(review).toContainText("Execution launched");
  await expect(review).toContainText("target origin/main");
  await expect(reviewBody(review)).toBeEmpty();
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);

  // A later opening reads the same gap.
  await review.getByRole("button", { name: "Close", exact: true }).click();
  expect(await readReview(page, card)).toMatchObject({
    kind: "landing-unavailable",
    selectedRun: record.request.reporting?.reference,
  });
  await expect(review.getByRole("list")).toHaveCount(0);
});
