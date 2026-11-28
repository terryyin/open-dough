// A completion or integration merge keeps the story's own merge edits,
// declares each inseparable conflict file with its readable trunk base,
// leaves restored trunk files out, and a non-owning resolution keeps the
// story comparison in both delivery modes.
import { expect, test } from "vitest";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import {
  completionConflictCompletedHistory,
  ownConflictExtraCompletedHistory,
} from "../../test-support/support/completedOwnMergeHistory.ts";
import { nonOwningForeignMergeCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
type Published = Extract<StoryReview, { kind: "published" }>;

async function doneStory(history: RepositoryDescription<string>) {
  const { repository } = await configuredFixtureProject(history);
  const project = repository.integration;
  const revision = (name: string) => {
    const commit = repository.revisions[name];
    if (commit === undefined) throw new Error(`No revision ${name}`);
    return commit;
  };
  const completion = revision("completion");
  // The declared merge's parents really conflict under `merge-tree`.
  const parentsConflict = (first: string, second: string) => {
    try {
      git(
        project,
        "merge-tree",
        "--write-tree",
        revision(first),
        revision(second),
      );
      return false;
    } catch (error) {
      if ((error as { status?: number }).status === 1) return true;
      throw error;
    }
  };
  const published = async () => {
    const review = await storyReview(
      { read: { subject, completed: true } },
      signal,
    );
    if (review.kind !== "published") throw new Error("No published review");
    return review;
  };
  const readFile = (
    { baseline, tree }: Published,
    path: string,
    from = baseline,
    oldPath?: string,
  ) =>
    reviewedFileDiff(
      {
        read: {
          subject,
          completion,
          baseline: from,
          tree,
          path,
          ...(oldPath === undefined ? {} : { oldPath }),
        },
      },
      signal,
    );
  return { completion, parentsConflict, published, readFile };
}

const delivered = (review: Published) =>
  review.files
    .map((file) => file.path)
    .filter((path) => !path.startsWith(".planning/"));
const mixedPaths = (review: Published) =>
  review.files
    .filter((file) => file.includesTrunkFrom !== undefined)
    .map((file) => file.path);
const mixedBase = (review: Published, path: string) => {
  const base = review.files.find(
    (file) => file.path === path,
  )?.includesTrunkFrom;
  if (base === undefined) throw new Error(`${path} is not mixed`);
  return base;
};
const added = (line: string) => ({
  kind: "diff",
  printed: expect.stringContaining(`+${line}`) as unknown,
});

test("a completion conflict keeps its resolved file mixed and other story files attributed", async () => {
  const story = await doneStory(completionConflictCompletedHistory());
  expect(
    story.parentsConflict("trunk completion conflict", "branch completion"),
  ).toBe(true);

  const review = await story.published();

  expect(review.completion).toBe(story.completion);
  expect(mixedPaths(review)).toEqual(["shared.txt"]);
  expect(delivered(review)).not.toContain("other-story.txt");
  expect(
    await story.readFile(review, "shared.txt", mixedBase(review, "shared.txt")),
  ).toMatchObject(added("resolved story and trunk"));
  expect(await story.readFile(review, "[literal]*.txt")).toMatchObject(
    added("delivered on another machine"),
  );
});

test("an integration merge delivers its own edits, keeps its conflict mixed and leaves restored trunk files out", async () => {
  const story = await doneStory(ownConflictExtraCompletedHistory());
  expect(story.parentsConflict("implementation", "interleaving")).toBe(true);

  const review = await story.published();

  expect(delivered(review)).toEqual([
    "[literal]*.txt",
    "checks/after.test.mjs",
    "merge-resolution.txt",
    "profiles/only.json",
    "shared.txt",
  ]);
  expect(review.files).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        path: "checks/after.test.mjs",
        kind: "renamed",
        oldPath: "checks/before.test.mjs",
      }),
      expect.objectContaining({
        path: "profiles/only.json",
        kind: "renamed",
        oldPath: "agents/only.json",
      }),
    ]),
  );
  expect(mixedPaths(review)).toEqual(["shared.txt"]);
  expect(await story.readFile(review, "[literal]*.txt")).toMatchObject(
    added("delivered on another machine"),
  );
  expect(await story.readFile(review, "merge-resolution.txt")).toMatchObject(
    added("integration edit"),
  );
  expect(
    await story.readFile(
      review,
      "checks/after.test.mjs",
      review.baseline,
      "checks/before.test.mjs",
    ),
  ).toMatchObject(added("renamed"));
  await expect(story.readFile(review, "shared.txt")).rejects.toMatchObject({
    status: 409,
  });
  expect(
    await story.readFile(review, "shared.txt", mixedBase(review, "shared.txt")),
  ).toMatchObject(added("resolved story and trunk"));
});

test("a non-owning resolution of a story file keeps the story-branch comparison attributed", async () => {
  const story = await doneStory(
    nonOwningForeignMergeCompletedHistory("story-branch"),
  );
  expect(story.parentsConflict("foreign trunk", "foreign branch")).toBe(true);

  const review = await story.published();

  expect(mixedPaths(review)).not.toContain("shared.txt");
  const diff = await story.readFile(review, "shared.txt");
  expect(diff).toMatchObject(added("story first"));
  expect(diff).toMatchObject({
    printed: expect.not.stringContaining("foreign resolution") as unknown,
  });
});

test("a non-owning resolution of a story file keeps the trunk comparison mixed", async () => {
  const story = await doneStory(nonOwningForeignMergeCompletedHistory("trunk"));
  expect(story.parentsConflict("foreign trunk", "foreign branch")).toBe(true);

  const review = await story.published();

  expect(
    await story.readFile(review, "shared.txt", mixedBase(review, "shared.txt")),
  ).toMatchObject(added("foreign rewrites story"));
});
