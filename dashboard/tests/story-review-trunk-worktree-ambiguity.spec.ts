// A Trunk Mode story taken in a terminal (./story-review-trunk-worktree.spec.ts)
// beside other worktrees of the project's checkout, each added by Git and
// authored through the real per-worktree authorship
// (`workspace-agent-authorship.mjs`). A worktree the story's agent left before
// the story's claim, one still on another story's claim, and one another
// agent left at a claim of the story trunk does not publish are passed over:
// the review reads the story's worktree alone. Two worktrees holding the story's
// claim are not chosen between: Review changes opens a review that says so
// and names both as the context line would show them, with no context line,
// file browser, diff, or marking controls, and the boundary refuses to read
// or mark either.

import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { launchRecordsSchema } from "../src/agentLaunch.ts";
import { agentLaunchEndpoint } from "../src/launchRequest.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewMarkEndpoint,
  storyReviewRangeEndpoint,
  storyReviewSchema,
} from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import {
  agentWorktree,
  claimWorktree,
} from "./support/agentAuthoredWorktree.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  contextLine,
  contextValues,
  contextWords,
  reviewBody,
  reviewFeedback,
} from "./support/reviewContextLine.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  type StartOrigin,
  type TrunkStart,
} from "./support/startOrigin.ts";
import {
  keptReviewMarks,
  openStoryReview,
  reviewedRefs,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import { commitAll, git } from "./support/storyReviewWorktree.ts";

const shown = (slug: string) => `~/git/open-dough/.worktrees/${slug}`;

// Story A taken by the real Trunk Mode start in `trunk-a`, with one slice
// committed after the claim, and trunk as it was before the claim.
async function storyTakenWithOneSlice(origin: StartOrigin) {
  const beforeClaim = (await origin.originGit("rev-parse", "main")).trim();
  const start = await origin.takenInTrunkMode("trunk-a");
  const claim = git(start.workspace, "rev-parse", "HEAD");
  expect(claim).not.toBe(beforeClaim);
  writeFileSync(path.join(start.workspace, "slice.txt"), "slice\n");
  commitAll(start.workspace, "first slice");
  return { ...start, claim, beforeClaim };
}

// Local Git finds the story's worktree alone, for the story's agent, and the
// story's review reads it from the claim.
async function expectStoryWorktreeReviewedAlone(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  { agent, workspace, branch, claim }: TrunkStart & { readonly claim: string },
) {
  const sessions = await page.request.get(
    `${dashboard.baseURL}${agentLaunchEndpoint}`,
    { headers: { Origin: dashboard.origin } },
  );
  const { workspaces } = launchRecordsSchema.parse(await sessions.json());
  expect(
    workspaces.map((found) => [found.identity, found.agent, found.workspace]),
  ).toEqual([[queuedIdentity, agent, shown("trunk-a")]]);

  await openBacklog(page, origin);
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  const opened = await openStoryReview(page, card);
  const review = reviewRegion(page);
  expect(opened.baseline).toBe(claim);
  expect(opened.head).toBe(git(workspace, "rev-parse", "HEAD"));
  expect(opened.files.map((file) => file.path)).toEqual(["slice.txt"]);
  await expect(contextValues(review)).toHaveAccessibleName(
    contextWords({ branch, baseline: claim, workspace: shown("trunk-a") }),
  );
  await expect
    .poll(() => treeRows(review.getByRole("list", { name: "1 changed file" })))
    .toEqual(["slice.txt"]);
}

test("worktrees the story's agent left without this story's claim are passed over, and the review reads the story's worktree alone", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await storyTakenWithOneSlice(origin);
  const { agent, beforeClaim } = story;

  // One worktree the agent authors sits on trunk before the claim, and one
  // is still on the claim of another story it held, which trunk no longer
  // publishes.
  const earlier = await agentWorktree(origin, agent, "earlier", beforeClaim);
  writeFileSync(path.join(earlier, "earlier.txt"), "earlier\n");
  await claimWorktree(
    origin,
    agent,
    "closed-b",
    beforeClaim,
    otherQueuedIdentity,
  );

  await expectStoryWorktreeReviewedAlone(page, dashboard, origin, story);
});

test("a worktree of an agent trunk does not publish for the story is passed over, and the review reads the publishing agent's worktree", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await storyTakenWithOneSlice(origin);

  // An agent that held the story earlier left its worktree at its own claim,
  // which trunk does not publish.
  const earlierAgent = "Akiho-chan";
  expect(story.agent).not.toBe(earlierAgent);
  await claimWorktree(
    origin,
    earlierAgent,
    "earlier-agent",
    story.beforeClaim,
    queuedIdentity,
  );

  await expectStoryWorktreeReviewedAlone(page, dashboard, origin, story);
});

test("two worktrees holding the story's claim open a review that names both and reads neither", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const { agent, workspace } = await origin.takenInTrunkMode("trunk-a");
  const claim = git(workspace, "rev-parse", "HEAD");
  writeFileSync(path.join(workspace, "notes.md"), "notes\n");
  const second = await agentWorktree(origin, agent, "trunk-b", claim);
  writeFileSync(path.join(second, "second.txt"), "second\n");
  const explanation = `Several worktrees on this machine hold this story's claim for ${agent}: ${shown("trunk-a")}, ${shown("trunk-b")}. The review cannot choose one.`;

  await openBacklog(page, origin);
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  const answered = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  await card.getByRole("button", { name: "Review changes" }).click();
  expect(storyReviewSchema.parse(await (await answered).json())).toEqual({
    kind: "unavailable",
    explanation,
  });

  const review = reviewRegion(page);
  await expect(reviewFeedback(review)).toHaveText(explanation);
  await expect(contextLine(review)).toHaveCount(0);
  await expect(reviewBody(review)).toBeEmpty();
  await expect(review.getByRole("list")).toHaveCount(0);
  await expect(review.getByRole("region")).toHaveCount(0);
  await expect(review.getByRole("radio")).toHaveCount(0);
  await expect(review.getByRole("checkbox")).toHaveCount(0);
  await expect(
    review.getByRole("button", { name: "Mark reviewed" }),
  ).toHaveCount(0);
  await expect(review.getByRole("button", { name: "Refresh" })).toBeVisible();

  // The boundary refuses to mark or read either worktree, with the same
  // words.
  const story = { source: "open-dough", identity: queuedIdentity };
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const refused = { error: explanation };
  const mark = await page.request.post(
    `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
    {
      headers: { Origin: dashboard.origin },
      data: { ...story, tree, baseline: claim },
    },
  );
  expect(mark.status()).toBe(409);
  expect(await mark.json()).toEqual(refused);
  expect(keptReviewMarks(dashboard)).toBeUndefined();
  expect(reviewedRefs(origin.project)).toBe("");
  for (const [endpoint, query] of [
    [storyReviewFileEndpoint, { baseline: claim, tree, path: "notes.md" }],
    [
      storyReviewRangeEndpoint,
      { fromTree: tree, fromBaseline: claim, tree, baseline: claim },
    ],
  ] as const) {
    const read = await page.request.get(
      `${dashboard.baseURL}${endpoint}?${new URLSearchParams({ ...story, ...query })}`,
      { headers: { Origin: dashboard.origin } },
    );
    expect(read.status(), endpoint).toBe(409);
    expect(await read.json()).toEqual(refused);
  }
});
