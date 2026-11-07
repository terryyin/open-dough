import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  getReview,
  completedReviewQuery,
  completedStoryQuery,
} from "../../tests/support/completedReviewRequests.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { git, writeAt } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

for (const variant of [
  undefined,
  "unrelated-merge",
  "merge-edit",
  "own-conflict-extra",
  "non-owning-story-file",
] as const) {
  test(`completed review reads printing merge drivers with ${variant ?? "clean merges"}`, async ({
    request,
    dashboard,
    origin,
  }) => {
    await completedPublishedStory(origin, "story-branch", variant);
    git(
      origin.project,
      "config",
      "merge.printing.driver",
      'printf \'driver says hello\\n\'; git merge-file "%A" "%O" "%B"',
    );
    writeAt(
      origin.project,
      ".git/info/attributes",
      "shared.txt merge=printing\nunrelated.txt merge=printing\n",
    );
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
    if (variant !== "merge-edit") return;
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
}
