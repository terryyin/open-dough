import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview,
  completedStoryQuery,
  completedReviewQuery,
} from "../../test-support/support/completedReviewRequests.ts";
import {
  completionConflictCompletedHistory,
  ownConflictExtraCompletedHistory,
} from "../../test-support/support/completedOwnMergeHistory.ts";
import { nonOwningForeignMergeCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { declaredParentsConflict } from "../../test-support/support/storyReviewTrunk.ts";
import type { APIRequestContext } from "@playwright/test";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";

test.use({ serverMode: "boundary" });

async function publishedReview(
  request: APIRequestContext,
  dashboard: DashboardServer,
) {
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
  return review;
}

test.describe("completion-conflict", () => {
  test.use({ originRepository: completionConflictCompletedHistory() });

  test("completion-conflict exposes resolved files as mixed while keeping other files attributed", async ({
    request,
    dashboard,
    origin,
  }) => {
    expect(
      declaredParentsConflict(
        origin,
        "trunk completion conflict",
        "branch completion",
      ),
    ).toBe(true);
    const review = await publishedReview(request, dashboard);
    expect(review.completion).toBe(origin.revision("completion"));
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
});

test.describe("own-conflict-extra", () => {
  test.use({ originRepository: ownConflictExtraCompletedHistory() });

  test("an integration merge's own edits are delivered while its conflict stays mixed and restored trunk files stay out", async ({
    request,
    dashboard,
    origin,
  }) => {
    expect(
      declaredParentsConflict(origin, "implementation", "interleaving"),
    ).toBe(true);
    const review = await publishedReview(request, dashboard);
    const listed = new Map(review.files.map((file) => [file.path, file]));
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
      const diff = await getReview(
        request,
        dashboard,
        storyReviewFileEndpoint,
        {
          ...file,
          path,
          ...(path === "checks/after.test.mjs"
            ? { oldPath: "checks/before.test.mjs" }
            : {}),
        },
      );
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
    expect(
      await (
        await getReview(request, dashboard, storyReviewFileEndpoint, {
          ...shared,
          baseline: mixed ?? "",
        })
      ).json(),
    ).toMatchObject({
      kind: "diff",
      printed: expect.stringContaining("+resolved story and trunk"),
    });
  });
});

for (const [mode, expectation] of [
  [
    "story-branch",
    {
      mixed: false,
      contain: "+story first",
      absent: "foreign resolution",
    },
  ],
  [
    "trunk",
    {
      mixed: true,
      contain: "+foreign rewrites story",
      absent: undefined,
    },
  ],
] as const) {
  test.describe(`non-owning foreign merge (${mode})`, () => {
    test.use({
      originRepository: nonOwningForeignMergeCompletedHistory(mode),
    });

    test(`a non-owning merge resolution on a story file keeps the ${mode} comparison`, async ({
      request,
      dashboard,
      origin,
    }) => {
      expect(
        declaredParentsConflict(origin, "foreign trunk", "foreign branch"),
      ).toBe(true);
      const review = await publishedReview(request, dashboard);
      const shared = review.files.find((file) => file.path === "shared.txt");
      if (expectation.mixed)
        expect(shared?.includesTrunkFrom).toEqual(expect.any(String));
      else expect(shared?.includesTrunkFrom).toBeUndefined();
      const printed = (
        (await (
          await getReview(request, dashboard, storyReviewFileEndpoint, {
            ...completedStoryQuery,
            completion: review.completion,
            baseline: shared?.includesTrunkFrom ?? review.baseline,
            tree: review.tree,
            path: "shared.txt",
          })
        ).json()) as { printed: string }
      ).printed;
      expect(printed).toContain(expectation.contain);
      if (expectation.absent !== undefined)
        expect(printed).not.toContain(expectation.absent);
    });
  });
}
