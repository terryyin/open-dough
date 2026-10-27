// A Trunk Mode story with published commits
// (./support/storyReviewTrunkMode.ts) is marked reviewed as any story is,
// though its baseline is a tree: trunk less the story's published commits.
// The mark keeps that tree through Git's housekeeping with a second ref
// beside the marked tree's. A story commit published after the mark is
// listed in the changes since the review and another developer's is not; the
// heading says trunk was integrated only when trunk gained a change other
// than the story's own publication, also for a mark taken before anything
// was published, against the merge-base commit, and compared with the later
// tree baseline.

import type { Locator, Page } from "@playwright/test";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { treeRows } from "./support/reviewTreeRows.ts";
import { queuedIdentity, type StartOrigin } from "./support/startOrigin.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  changedPaths,
  comparison,
  expectSinceTheReview,
  keptStoryAMark,
  markReviewed,
  openStoryReview,
  refreshReview,
  reviewedRefs,
  reviewRegion,
} from "./support/storyReviewMark.ts";
import {
  commitUnpublished,
  openTaken,
  publishLater,
  trunkModeStory,
} from "./support/storyReviewTrunkMode.ts";
import { git } from "./support/storyReviewWorktree.ts";

const integrated = "Trunk was integrated since the mark";

// Story A in Trunk Mode with as many story commits published as said and one
// unpublished, its review opened from its Taken card and marked reviewed.
// Answers the worktree, trunk, the snapshot marked, and the review.
async function markedStory(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  published: 0 | 2,
) {
  const { workspace, trunk } = trunkModeStory(origin, { published });
  commitUnpublished(workspace);
  await keepLaunchRecord(dashboard, workspace);
  const card = await openTaken(page, origin);
  const shown = await openStoryReview(page, card);
  const review = reviewRegion(page);
  await markReviewed(review);
  return { workspace, trunk, shown, review };
}

// The changes since the review list the later story commit's file alone.
async function expectLaterStoryFileAlone(review: Locator) {
  await expect(
    comparison(review).getByRole("radio", { name: "Since the review" }),
  ).toBeChecked();
  const files = review.getByRole("list", { name: "1 changed file" });
  await expect.poll(() => treeRows(files)).toEqual(["src", "  e.ts"]);
}

test("a Trunk Mode story's mark is kept with its baseline tree, and a story commit published after it is listed since the review", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, trunk, shown, review } = await markedStory(
    page,
    dashboard,
    origin,
    2,
  );
  expect(shown.published).toEqual({ trunk, commits: 2 });
  expect(git(workspace, "cat-file", "-t", shown.baseline)).toBe("tree");
  const mark = keptStoryAMark(dashboard);

  await test.step("the snapshot is marked as any story's is, its baseline tree kept beside its tree", async () => {
    expect(mark).toMatchObject({ tree: shown.tree, baseline: shown.baseline });
    await expect(review).toContainText("This snapshot is marked reviewed,");
    await expect(review.locator("time")).toHaveAttribute(
      "datetime",
      mark?.markedAt ?? "",
    );
    expect(reviewedRefs(origin.project)).toBe(
      `refs/open-dough/reviewed/${queuedIdentity} ${shown.tree}`,
    );
    expect(reviewedRefs(origin.project, "reviewed-baseline")).toBe(
      `refs/open-dough/reviewed-baseline/${queuedIdentity} ${shown.baseline}`,
    );
  });

  const later = publishLater(origin.project, workspace, true);
  const since = await refreshReview(review);

  await test.step("since the review lists the later story commit's file and not trunk's", async () => {
    expect(since.published).toEqual({ trunk: later, commits: 3 });
    expect(since.baseline).not.toBe(shown.baseline);
    expect(since.markUncomparable).toBeUndefined();
    // Not `src/f.ts`, which another developer published.
    expect(changedPaths(since.since?.files)).toEqual(["src/e.ts"]);
    await expectSinceTheReview(review, mark);
    await expect(review.locator(".story-review-since")).toContainText(
      integrated,
    );
    await expectLaterStoryFileAlone(review);
  });

  await test.step("all changes lists the story's published, unpublished and uncommitted files", async () => {
    expect(changedPaths(since.files)).toEqual([
      "d.md",
      "notes.md",
      "src/a.ts",
      "src/e.ts",
      "src/g.ts",
    ]);
    await comparison(review)
      .getByRole("radio", { name: "All changes" })
      .check();
    await expect
      .poll(() =>
        treeRows(review.getByRole("list", { name: "5 changed files" })),
      )
      .toEqual(["src", "  a.ts", "  e.ts", "  g.ts", "d.md", "notes.md"]);
  });

  await test.step("after Git's housekeeping, Refresh still compares with the mark", async () => {
    git(origin.project, "gc", "--quiet", "--prune=now");
    expect(git(origin.project, "cat-file", "-t", shown.baseline)).toBe("tree");
    const kept = await refreshReview(review);
    expect(kept.markUncomparable).toBeUndefined();
    expect(changedPaths(kept.since?.files)).toEqual(["src/e.ts"]);
    await comparison(review)
      .getByRole("radio", { name: "Since the review" })
      .check();
    await expectSinceTheReview(review, mark);
    await expectLaterStoryFileAlone(review);
  });
});

test("a story commit published after the mark with nothing else on trunk is listed without saying trunk was integrated", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, shown, review } = await markedStory(
    page,
    dashboard,
    origin,
    2,
  );

  const later = publishLater(origin.project, workspace, false);
  const since = await refreshReview(review);

  expect(since.published).toEqual({ trunk: later, commits: 3 });
  // Trunk less the story's commits is the tree it was.
  expect(since.baseline).toBe(shown.baseline);
  expect(changedPaths(since.since?.files)).toEqual(["src/e.ts"]);
  await expectSinceTheReview(review, keptStoryAMark(dashboard));
  await expectLaterStoryFileAlone(review);
  await expect(review.locator(".story-review-since")).not.toContainText(
    integrated,
  );
});

for (const trunkToo of [false, true]) {
  test(`a mark taken before the story published anything is compared with the later tree baseline${trunkToo ? " trunk also changed" : ""}`, async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace, trunk, shown, review } = await markedStory(
      page,
      dashboard,
      origin,
      0,
    );
    // The merge-base commit, as for any worktree.
    expect(shown.baseline).toBe(trunk);

    const later = publishLater(origin.project, workspace, trunkToo);
    const since = await refreshReview(review);

    expect(since.published).toEqual({ trunk: later, commits: 1 });
    expect(git(workspace, "cat-file", "-t", since.baseline)).toBe("tree");
    expect(since.markUncomparable).toBeUndefined();
    expect(changedPaths(since.since?.files)).toEqual(["src/e.ts"]);
    await expectSinceTheReview(review, keptStoryAMark(dashboard));
    await expectLaterStoryFileAlone(review);
    // The story's own publication alone is not trunk integrated.
    expect(since.since?.trunkIntegrated).toBe(trunkToo);
    const heading = review.locator(".story-review-since");
    await (trunkToo
      ? expect(heading).toContainText(integrated)
      : expect(heading).not.toContainText(integrated));
  });
}
