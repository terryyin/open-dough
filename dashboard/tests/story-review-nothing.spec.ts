// A story's review explains when there is nothing to review, beneath its
// fixed top and without the file browser or diff: a worktree straight off
// trunk shows its context line and no changes against the named baseline,
// the line staying in place while a short panel scrolls that explanation; a
// worktree whose folder was removed with no landing captured explains that
// evidence gap, still offering Refresh and Close, and no Git runs; a trunk that cannot
// be fetched names its remote and target, shows no file list, and Refresh
// reads the review again once trunk is reachable; and a story whose kept
// launch record names no workspace offers no review at all, which the launch
// boundary also refuses.

import { rmSync } from "node:fs";
import { storyReviewEndpoint } from "../src/storyReview.ts";
import { cardSessions } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  expectFixedWhileScrolled,
  reviewBody,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  branch,
  git,
  storyWorktree,
  unchangedWorktree,
} from "./support/storyReviewWorktree.ts";
import {
  keepLaunchRecord,
  keepLaunchRecords,
  storyALaunchRecord,
} from "./support/storyLaunchRecord.ts";

const shownWorkspace = "~/git/open-dough/.worktrees/story-a";

test("a worktree straight off trunk has no changes against the named baseline", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, trunk } = unchangedWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({ branch, baseline: trunk, workspace: shownWorkspace }),
  );
  const body = reviewBody(review);
  await expect(body).toHaveText(
    `No changes: the worktree matches baseline ${trunk.slice(0, 7)}.`,
  );
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(review.getByRole("region")).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Hide files" })).toHaveCount(
    0,
  );
  await expectFixedWhileScrolled(page, body, [contextLine(review)]);
});

test("a removed worktree with no captured landing explains the gap, and no Git runs", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  rmSync(workspace, { recursive: true, force: true });
  // Trunk's later commit, which a fetch would bring, is still unknown here.
  const fetchedTrunk = () => git(origin.project, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const status = reviewFeedback(review);
  await expect(status).toHaveText(
    "This run's workspace is gone and no landing comparison was captured. Its changes cannot be reconstructed from today's trunk.",
  );
  await expect(
    review.getByRole("radio", { name: "Landed runs", exact: true }),
  ).toBeChecked();
  await expect(review.getByRole("radio")).toHaveCount(1);
  // The explanation is the fixed top's; the body beneath it shows nothing,
  // and there is no context line.
  const body = reviewBody(review);
  await expect(body).toBeEmpty();
  expect((await body.boundingBox())?.y).toBeGreaterThanOrEqual(
    await status.evaluate((shown) => shown.getBoundingClientRect().bottom),
  );
  await expect(contextLine(review)).toHaveCount(0);
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(review.getByRole("region")).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Refresh" })).toBeVisible();
  await expect(
    review.getByRole("button", { name: "Close", exact: true }),
  ).toBeVisible();
  expect(fetchedTrunk()).toBe(merged);
});

test("a trunk that cannot be fetched names its remote and target and shows no list until Refresh reaches it", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Review changes" }).click();
  const review = page.getByRole("region", { name: "Review changes" });
  const files = review.getByRole("list", { name: "7 changed files" });
  await expect(files).toBeVisible();
  const refresh = review.getByRole("button", { name: "Refresh" });

  // The story's remote points at nothing reachable.
  const reachable = git(workspace, "config", "--get", "remote.origin.url");
  const unreachable = `${origin.machine}/unreachable.git`;
  git(workspace, "config", "remote.origin.url", unreachable);
  await refresh.press("Enter");
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
  // The list, named by its seven files, is back.
  await expect(files).toBeVisible();
  await expect(status).not.toContainText("could not be fetched");
});

test("a story whose kept launch record names no workspace offers no review", async ({
  page,
  dashboard,
  origin,
}) => {
  const withoutWorkspace = storyALaunchRecord(
    `${origin.project}/.worktrees/story-a`,
  );
  delete withoutWorkspace.start;
  await keepLaunchRecords(dashboard, [withoutWorkspace]);
  const card = await openBacklog(page, origin);
  await expect(cardSessions(card)).toHaveCount(1);
  await expect(
    card.getByRole("button", { name: "Review changes" }),
  ).toHaveCount(0);
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
