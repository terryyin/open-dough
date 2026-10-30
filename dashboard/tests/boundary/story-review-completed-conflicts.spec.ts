import { expect, test } from "../support/preparationPage.ts";
import {
  getReview,
  completedStoryQuery,
  completedReviewQuery,
} from "../support/completedReviewRequests.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

for (const variant of ["own-conflict", "completion-conflict"] as const) {
  test(`${variant} exposes resolved files as mixed while keeping other files attributed`, async ({
    request,
    dashboard,
    origin,
  }) => {
    const story = await completedPublishedStory(
      origin,
      "story-branch",
      variant,
    );
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      completedReviewQuery,
    );
    expect(response.status()).toBe(200);
    const review = storyReviewSchema.parse(await response.json());
    expect(review.kind).toBe("published");
    if (review.kind !== "published")
      throw new Error("No published conflict review");
    expect(review.completion).toBe(story.completion);
    const mixed = review.files.find((file) => file.path === "shared.txt");
    expect(mixed?.includesTrunkFrom).toBeDefined();
    expect(
      review.files.find((file) => file.path === "[literal]*.txt")
        ?.includesTrunkFrom,
    ).toBeUndefined();
    expect(review.files.map((file) => file.path)).not.toContain(
      "other-story.txt",
    );
    const diff = await getReview(request, dashboard, storyReviewFileEndpoint, {
      ...completedStoryQuery,
      completion: review.completion,
      baseline: mixed?.includesTrunkFrom ?? "",
      tree: review.tree,
      path: "shared.txt",
    });
    expect(diff.status()).toBe(200);
    expect(await diff.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+resolved story and trunk"),
    });
    const normal = await getReview(
      request,
      dashboard,
      storyReviewFileEndpoint,
      {
        ...completedStoryQuery,
        completion: review.completion,
        baseline: review.baseline,
        tree: review.tree,
        path: "[literal]*.txt",
      },
    );
    expect(normal.status()).toBe(200);
    expect(await normal.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+delivered on another machine"),
    });
  });
}

test("a genuine conflict does not authorize added resolution edits outside its paths", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "story-branch", "own-conflict-extra");
  const response = await getReview(
    request,
    dashboard,
    storyReviewEndpoint,
    completedReviewQuery,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "merge resolutions whose story changes cannot be attributed safely",
    ),
  });
});
