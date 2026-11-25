import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedStoryQuery as named,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import {
  advanceCompletedTrunk,
  laterDeveloperCarriesDoneRecord,
} from "../../test-support/support/completedStoryVisibleActions.ts";
import {
  ordinaryCompletedReviewHistories,
  ordinaryTrunkModeCompletedHistory,
} from "../../test-support/support/completedStoryHistory.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import {
  renameExecutionCheckout,
  trunkAdvancedPastCheckout,
} from "../../test-support/support/reviewRepositoryFixture.ts";

test.use({ serverMode: "boundary" });

for (const [mode, history] of ordinaryCompletedReviewHistories()) {
  test.describe(mode, () => {
    test.use({ originRepository: history });

    test(`completion keeps interleaved-work isolation and immutable literal-file diffs`, async ({
      request,
      dashboard,
      origin,
    }) => {
      const completion = origin.revision("completion");
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
      expect(review.completion).toBe(completion);
      expect(review.agent).toBe(agentIdentity("Yui").agent);
      expect(review.files.map((file) => file.path)).toContain("shared.txt");
      expect(review.files.map((file) => file.path)).not.toContain(
        "other-story.txt",
      );
      expect(review.files.map((file) => file.path)).not.toContain(
        "integration-other.txt",
      );
      if (mode === "story-branch")
        expect(origin.revision("branch completion")).toBe(
          git(origin.project, "rev-parse", `${completion}^2`),
        );
      const file = {
        ...named,
        completion,
        baseline: review.baseline,
        tree: review.tree,
        path: "[literal]*.txt",
      };
      const remote = git(
        origin.project,
        "config",
        "--get",
        "remote.origin.url",
      );
      git(
        origin.project,
        "config",
        "remote.origin.url",
        `${origin.machine}/unreachable.git`,
      );
      const accepted = await get(
        request,
        dashboard,
        storyReviewFileEndpoint,
        file,
      );
      expect(accepted.status()).toBe(200);
      expect(await accepted.json()).toMatchObject({
        kind: "diff",
        printed: expect.stringContaining("+delivered on another machine"),
      });
      const shared = await get(request, dashboard, storyReviewFileEndpoint, {
        ...file,
        path: "shared.txt",
      });
      expect(await shared.json()).toMatchObject({
        kind: "diff",
        printed: expect.stringContaining("+story first"),
      });
      const printed = ((await shared.json()) as { printed: string }).printed;
      expect(printed).not.toContain("+other last");
      expect(printed).not.toContain("-line 11");
      git(origin.project, "config", "remote.origin.url", remote);
      advanceCompletedTrunk(origin);
      expect(
        storyReviewSchema.parse(
          await (
            await get(request, dashboard, storyReviewEndpoint, completed)
          ).json(),
        ),
      ).toEqual(review);
      const fixed = await get(
        request,
        dashboard,
        storyReviewFileEndpoint,
        file,
      );
      expect(await fixed.json()).toEqual(await accepted.json());
    });

    test(`completion keeps its own delivery after a later story's branch merges trunk and fast-forwards`, async ({
      request,
      dashboard,
      origin,
    }) => {
      const completion = origin.revision("completion");
      const delivered = storyReviewSchema.parse(
        await (
          await get(request, dashboard, storyReviewEndpoint, completed)
        ).json(),
      );
      expect(delivered).toMatchObject({ kind: "published", completion });
      // Started from trunk before Story A's done record arrived.
      laterDeveloperCarriesDoneRecord(origin, completion);
      const review = storyReviewSchema.parse(
        await (
          await get(request, dashboard, storyReviewEndpoint, completed)
        ).json(),
      );
      expect(review).toEqual(delivered);
      if (review.kind !== "published") throw new Error("No published review");
      const diff = await get(request, dashboard, storyReviewFileEndpoint, {
        ...named,
        completion,
        baseline: review.baseline,
        tree: review.tree,
        path: "shared.txt",
      });
      expect(diff.status()).toBe(200);
      expect(await diff.json()).toMatchObject({
        kind: "diff",
        printed: expect.stringContaining("+story first"),
      });
    });
  });
}

test.describe("execution checkout", () => {
  test.use({ originRepository: ordinaryTrunkModeCompletedHistory() });

  test("a renamed execution checkout leaves the published review and its file diffs readable", async ({
    request,
    dashboard,
    origin,
  }) => {
    const review = storyReviewSchema.parse(
      await (
        await get(request, dashboard, storyReviewEndpoint, completed)
      ).json(),
    );
    if (review.kind !== "published")
      throw new Error("No initial published review");
    const moved = renameExecutionCheckout(origin);
    try {
      const reopened = await get(
        request,
        dashboard,
        storyReviewEndpoint,
        completed,
      );
      expect(await reopened.json()).toMatchObject({
        kind: "published",
        completion: review.completion,
        baseline: review.baseline,
        tree: review.tree,
        files: review.files,
      });
      const file = await get(request, dashboard, storyReviewFileEndpoint, {
        ...named,
        completion: review.completion,
        baseline: review.baseline,
        tree: review.tree,
        path: "[literal]*.txt",
      });
      expect(file.status()).toBe(200);
    } finally {
      moved.restore();
    }
  });

  test("opening a published review leaves the execution checkout's tracked trunk where it was", async ({
    request,
    dashboard,
    origin,
  }) => {
    const synced = trunkAdvancedPastCheckout(origin);
    const review = await get(
      request,
      dashboard,
      storyReviewEndpoint,
      completed,
    );
    expect(await review.json()).toMatchObject({ kind: "published" });
    expect(git(origin.project, "rev-parse", "refs/remotes/origin/main")).toBe(
      synced,
    );
  });
});
