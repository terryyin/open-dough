import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview,
  completedReviewQuery,
  completedStoryQuery,
} from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryStoryBranchCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import {
  ownConflictExtraCompletedHistory,
  plainMergeEditCompletedHistory,
} from "../../test-support/support/completedOwnMergeHistory.ts";
import { nonOwningForeignMergeCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import {
  git,
  writeAt,
} from "../../test-support/support/storyReviewWorktree.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";
import type { StartRepository } from "../../test-support/support/startOriginPreparation.ts";

test.use({ serverMode: "boundary" });

// Visible harness action: merge-driver configuration stays outside the
// declared history (commitment 14).
function configurePrintingDriver(origin: StartOrigin) {
  git(
    origin.project,
    "config",
    "merge.printing.driver",
    'printf \'driver says hello\\n\'; git merge-file "%A" "%O" "%B"',
  );
  writeAt(
    origin.project,
    ".git/info/attributes",
    "shared.txt merge=printing\n",
  );
}

for (const [label, originRepository] of [
  ["clean merges", ordinaryStoryBranchCompletedHistory()],
  ["merge-edit", plainMergeEditCompletedHistory()],
  ["own-conflict-extra", ownConflictExtraCompletedHistory()],
  [
    "non-owning-story-file",
    nonOwningForeignMergeCompletedHistory("story-branch"),
  ],
] as const satisfies ReadonlyArray<readonly [string, StartRepository]>) {
  test.describe(label, () => {
    test.use({ originRepository });

    test(`completed review reads printing merge drivers with ${label}`, async ({
      request,
      dashboard,
      origin,
    }) => {
      configurePrintingDriver(origin);
      const response = await getReview(
        request,
        dashboard,
        storyReviewEndpoint,
        completedReviewQuery,
      );
      expect(response.status()).toBe(200);
      const review = storyReviewSchema.parse(await response.json());
      expect(review).toMatchObject({
        kind: "published",
        files: expect.arrayContaining([
          expect.objectContaining({ path: "shared.txt" }),
        ]),
      });
    });
  });
}

test.describe("merge-edit under printing driver", () => {
  test.use({ originRepository: plainMergeEditCompletedHistory() });

  test("delivers merge-resolution.txt with its integration edit", async ({
    request,
    dashboard,
    origin,
  }) => {
    configurePrintingDriver(origin);
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      completedReviewQuery,
    );
    expect(response.status()).toBe(200);
    const review = storyReviewSchema.parse(await response.json());
    if (review.kind !== "published") throw new Error("No published review");
    expect(review.files.map((file) => file.path)).toContain(
      "merge-resolution.txt",
    );
    const file = await getReview(request, dashboard, storyReviewFileEndpoint, {
      ...completedStoryQuery,
      completion: review.completion,
      baseline: review.baseline,
      tree: review.tree,
      path: "merge-resolution.txt",
    });
    expect(await file.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+integration edit"),
    });
  });
});
