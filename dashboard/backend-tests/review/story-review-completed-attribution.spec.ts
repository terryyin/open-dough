import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../tests/support/completedReviewRequests.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

test("published attribution includes both historical owners after a story takeover", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk", "takeover");
  const review = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );
  expect(review.kind).toBe("published");
  if (review.kind !== "published") throw new Error("No takeover review");
  expect(review.files.map((file) => file.path)).toEqual(
    expect.arrayContaining(["[literal]*.txt", "shared.txt", "takeover.txt"]),
  );
  expect(review.files.map((file) => file.path)).not.toContain(
    "other-story.txt",
  );
  for (const [path, added] of [
    ["[literal]*.txt", "+delivered on another machine"],
    ["takeover.txt", "+second agent work"],
  ]) {
    const response = await get(request, dashboard, storyReviewFileEndpoint, {
      ...named,
      completion: review.completion,
      baseline: review.baseline,
      tree: review.tree,
      path: path ?? "",
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining(added ?? ""),
    });
  }
});

test("another story's conflict resolution does not hide this story's attributable changes", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk", "unrelated-merge");
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  const review = storyReviewSchema.parse(await response.json());
  expect(review.kind).toBe("published");
  if (review.kind !== "published") throw new Error("No published review");
  expect(review.files.map((file) => file.path)).toContain("[literal]*.txt");
  expect(review.files.map((file) => file.path)).not.toContain("unrelated.txt");
  const file = await get(request, dashboard, storyReviewFileEndpoint, {
    ...named,
    completion: review.completion,
    baseline: review.baseline,
    tree: review.tree,
    path: "[literal]*.txt",
  });
  expect(await file.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+delivered on another machine"),
  });
});

test("an inseparable file declares included trunk changes and admits only its declared baseline", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "trunk", "inseparable");
  const review = storyReviewSchema.parse(
    await (
      await get(request, dashboard, storyReviewEndpoint, completed)
    ).json(),
  );
  expect(review.kind).toBe("published");
  if (review.kind !== "published") throw new Error("No published review");
  const file = review.files.find((file) => file.path === "shared.txt");
  expect(file?.includesTrunkFrom).toBeDefined();
  const query = {
    ...named,
    completion: review.completion,
    baseline: file?.includesTrunkFrom ?? "",
    tree: review.tree,
    path: "shared.txt",
  };
  const accepted = await get(
    request,
    dashboard,
    storyReviewFileEndpoint,
    query,
  );
  expect(accepted.status()).toBe(200);
  expect(await accepted.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+other rewrites story"),
  });
  expect(
    (
      await get(request, dashboard, storyReviewFileEndpoint, {
        ...query,
        baseline: review.baseline,
      })
    ).status(),
  ).toBe(409);
});

test("another story's octopus merge leaves the completed review published", async ({
  request,
  dashboard,
  origin,
}) => {
  const { completion } = await completedPublishedStory(
    origin,
    "story-branch",
    "foreign-octopus",
  );
  expect(
    git(origin.project, "rev-list", "--min-parents=3", completion),
  ).not.toBe("");
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  const review = storyReviewSchema.parse(await response.json());
  expect(review.kind).toBe("published");
  if (review.kind !== "published") throw new Error("No published review");
  const paths = review.files.map((file) => file.path);
  expect(paths).toEqual(
    expect.arrayContaining(["[literal]*.txt", "shared.txt"]),
  );
  expect(paths).not.toContain("octopus-a.txt");
  expect(paths).not.toContain("octopus-b.txt");
});

test("the story's own octopus integration explains why its changes cannot be attributed", async ({
  request,
  dashboard,
  origin,
}) => {
  await completedPublishedStory(origin, "story-branch", "own-octopus");
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    kind: "unavailable",
    explanation:
      "Published execution history contains a merge whose story changes cannot be attributed safely.",
  });
});
