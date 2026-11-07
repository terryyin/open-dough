import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  getReview,
  completedStoryQuery,
  completedReviewQuery,
} from "../../tests/support/completedReviewRequests.ts";
import { completedPublishedStory } from "../../tests/support/completedPublishedStory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";

test.use({ serverMode: "boundary" });

test("completion-conflict exposes resolved files as mixed while keeping other files attributed", async ({
  request,
  dashboard,
  origin,
}) => {
  const story = await completedPublishedStory(
    origin,
    "story-branch",
    "completion-conflict",
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
  const normal = await getReview(request, dashboard, storyReviewFileEndpoint, {
    ...completedStoryQuery,
    completion: review.completion,
    baseline: review.baseline,
    tree: review.tree,
    path: "[literal]*.txt",
  });
  expect(normal.status()).toBe(200);
  expect(await normal.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+delivered on another machine"),
  });
});

test("an integration merge's own edits are delivered while its conflict stays mixed and restored trunk files stay out", async ({
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
  const review = storyReviewSchema.parse(await response.json());
  if (review.kind !== "published")
    throw new Error(`No published review: ${JSON.stringify(review)}`);
  const listed = new Map(review.files.map((file) => [file.path, file]));
  // Besides the story's own planning records.
  const delivered = [...listed.keys()].filter(
    (path) => !path.startsWith(".planning/"),
  );
  expect(delivered).toEqual([
    "[literal]*.txt",
    "checks/after.test.mjs",
    "merge-resolution.txt",
    "profiles/only.json",
    "shared.txt",
  ]);
  expect(listed.get("checks/after.test.mjs")).toMatchObject({
    kind: "renamed",
    oldPath: "checks/before.test.mjs",
  });
  expect(listed.get("profiles/only.json")).toMatchObject({
    kind: "renamed",
    oldPath: "agents/only.json",
  });
  const mixed = listed.get("shared.txt")?.includesTrunkFrom;
  expect(mixed).toBeDefined();
  for (const path of [
    "[literal]*.txt",
    "checks/after.test.mjs",
    "merge-resolution.txt",
  ])
    expect(listed.get(path)?.includesTrunkFrom).toBeUndefined();
  const file = {
    ...completedStoryQuery,
    completion: review.completion,
    baseline: review.baseline,
    tree: review.tree,
  };
  for (const [path, added] of [
    ["[literal]*.txt", "+delivered on another machine"],
    ["merge-resolution.txt", "+integration edit"],
    ["checks/after.test.mjs", "+renamed"],
  ] as const) {
    const diff = await getReview(request, dashboard, storyReviewFileEndpoint, {
      ...file,
      path,
      ...(path === "checks/after.test.mjs"
        ? { oldPath: "checks/before.test.mjs" }
        : {}),
    });
    expect(diff.status(), path).toBe(200);
    expect(await diff.json()).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining(added),
    });
  }
  const shared = { ...file, path: "shared.txt" };
  expect(
    (
      await getReview(request, dashboard, storyReviewFileEndpoint, shared)
    ).status(),
  ).toBe(409);
  const resolved = await getReview(
    request,
    dashboard,
    storyReviewFileEndpoint,
    {
      ...shared,
      baseline: mixed ?? "",
    },
  );
  expect(await resolved.json()).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+resolved story and trunk"),
  });
});

for (const mode of ["story-branch", "trunk"] as const) {
  test(`a non-owning merge resolution on a story file keeps the ${mode} comparison`, async ({
    request,
    dashboard,
    origin,
  }) => {
    await completedPublishedStory(origin, mode, "non-owning-story-file");
    const response = await getReview(
      request,
      dashboard,
      storyReviewEndpoint,
      completedReviewQuery,
    );
    expect(response.status()).toBe(200);
    const review = storyReviewSchema.parse(await response.json());
    if (review.kind !== "published")
      throw new Error(`No published review: ${JSON.stringify(review)}`);
    const shared = review.files.find((file) => file.path === "shared.txt");
    // Separable in Story Branch Mode; the foreign resolution rewrote the
    // story's line already on trunk in Trunk Mode.
    const [mixed, shown] =
      mode === "story-branch"
        ? [undefined, "+story first"]
        : [expect.any(String), "+foreign rewrites story"];
    expect(shared?.includesTrunkFrom).toEqual(mixed);
    const diff = await getReview(request, dashboard, storyReviewFileEndpoint, {
      ...completedStoryQuery,
      completion: review.completion,
      baseline: shared?.includesTrunkFrom ?? review.baseline,
      tree: review.tree,
      path: "shared.txt",
    });
    const printed = ((await diff.json()) as { printed: string }).printed;
    expect(printed).toContain(shown);
    if (mode === "story-branch")
      expect(printed).not.toContain("foreign resolution");
  });
}
