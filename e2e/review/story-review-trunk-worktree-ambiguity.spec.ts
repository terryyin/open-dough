// A Trunk Mode story's claim and agent-authored worktrees declared through
// MakeMe (../../dashboard/test-support/support/storyReviewTrunkAmbiguity.ts):
// Yui-chan's `trunk-a` with one slice beside worktrees that local Git passes
// over — one she left before the claim, one still on another story's claim,
// and one Akiho-chan left at an unpublished claim of Story A — so the review
// reads `trunk-a` alone. Two worktrees holding the story's claim are not
// chosen between: Review changes opens a review that says so and names both
// as the context line would show them, with no context line, file browser,
// diff, or comparison controls, and the boundary refuses to read either.
// ./story-review-trunk-worktree.spec.ts keeps the real terminal start.

import path from "node:path";
import type { Page } from "@playwright/test";
import { launchRecordsSchema } from "../../dashboard/src/agentLaunch.ts";
import { agentLaunchEndpoint } from "../../dashboard/src/launchRequest.ts";
import {
  storyReviewFileEndpoint,
  storyReviewRangeEndpoint,
} from "../../dashboard/src/storyReviewContract.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import {
  trunkModeAmbiguityAlone,
  trunkModeAmbiguityBoth,
} from "../../dashboard/test-support/support/storyReviewTrunkAmbiguity.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { yui } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";

const shown = (slug: string) => `~/git/open-dough/.worktrees/${slug}`;
const worktree = (origin: StartOrigin, slug: string) =>
  path.join(origin.project, ".worktrees", slug);

// Local Git finds the story's worktree alone, for the story's agent, and the
// story's review reads it from the claim.
async function expectStoryWorktreeReviewedAlone(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const workspace = worktree(origin, "trunk-a");
  const claim = origin.revision("take Story A");
  const branch = "exec/trunk-a";
  const sessions = await page.request.get(
    `${dashboard.baseURL}${agentLaunchEndpoint}`,
    { headers: { Origin: dashboard.origin } },
  );
  const { workspaces } = launchRecordsSchema.parse(await sessions.json());
  expect(
    workspaces.map((found) => [found.identity, found.agent, found.workspace]),
  ).toEqual([[queuedIdentity, yui.agent, shown("trunk-a")]]);

  await openBacklog(page, origin);
  const card = parts(page).taken.getByRole("article", { name: "Story A" });
  const review = await openReviewChanges(page, card);
  const opened = review.snapshot;
  expect(opened.baseline).toBe(claim);
  expect(opened.head).toBe(git(workspace, "rev-parse", "HEAD"));
  expect(opened.files.map((file) => file.path)).toEqual(["slice.txt"]);
  await review.context.expectWords(
    contextWords({ branch, baseline: claim, workspace: shown("trunk-a") }),
  );
  await review.files.expectRows("1 changed file", ["slice.txt"]);
}

test.describe("worktrees without this story's published claim", () => {
  test.use({ originRepository: trunkModeAmbiguityAlone() });

  test("the agent's earlier or other-story worktrees and an earlier agent's unpublished claim are passed over, and the review reads the publishing agent's worktree alone", async ({
    page,
    dashboard,
    origin,
  }) => {
    await expectStoryWorktreeReviewedAlone(page, dashboard, origin);
  });
});

test.describe("two worktrees holding the story's claim", () => {
  test.use({ originRepository: trunkModeAmbiguityBoth() });

  test("open a review that names both and reads neither", async ({
    page,
    dashboard,
    origin,
  }) => {
    const workspace = worktree(origin, "trunk-a");
    const claim = origin.revision("take Story A");
    const explanation = `Several worktrees on this machine hold this story's claim for ${yui.agent}: ${shown("trunk-a")}, ${shown("trunk-b")}. The review cannot choose one.`;

    await openBacklog(page, origin);
    const card = parts(page).taken.getByRole("article", { name: "Story A" });
    const review = await openReviewChanges(page, card);
    expect(review.answer).toEqual({ kind: "unavailable", explanation });

    // Read the explanation directly; do not reveal empty details.
    await review.status.expectFeedback(explanation);
    await review.status.expectNoContextLine();
    await review.status.expectBodyEmpty();
    await review.frame.expectNoFilesOrComparisons();
    await review.status.expectRefreshAndCloseOffered();

    // The boundary refuses to read either worktree with the same explanation.
    const story = { source: "open-dough", identity: queuedIdentity };
    const tree = git(workspace, "rev-parse", "HEAD^{tree}");
    const refused = { error: explanation };
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
});
