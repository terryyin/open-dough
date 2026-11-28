// A Done review attributes every historical owner's contribution, keeps
// foreign merges out of it, declares inseparable trunk baselines, and
// explains an owning octopus merge it cannot attribute.
import { expect, test } from "vitest";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { takeoverCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import {
  foreignOctopusCompletedHistory,
  inseparableRewriteCompletedHistory,
  unrelatedForeignMergeCompletedHistory,
} from "../../test-support/support/completedForeignMergeHistory.ts";
import { ownOctopusCompletedHistory } from "../../test-support/support/completedOwnMergeHistory.ts";
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
  const open = () =>
    storyReview({ read: { subject, completed: true } }, signal);
  const published = async () => {
    const review = await open();
    if (review.kind !== "published") throw new Error("No published review");
    return review;
  };
  const readFile = (
    { baseline, tree }: Published,
    path: string,
    from = baseline,
  ) =>
    reviewedFileDiff(
      { read: { subject, completion, baseline: from, tree, path } },
      signal,
    );
  // The review's exact published endpoints: the completion and its tree.
  const endpoints = {
    completion,
    landingRevision: completion,
    tree: git(project, "rev-parse", `${completion}^{tree}`),
  };
  return {
    project,
    revision,
    completion,
    endpoints,
    open,
    published,
    readFile,
  };
}

// Every Done review lists the completion's own backlog bookkeeping first.
const completedBookkeeping = (agentFile: string) => [
  ".planning/PRODUCT-BACKLOG.md",
  `.planning/agents/${agentFile}`,
  ".planning/done/.catalog.json",
  ".planning/done/SEED-A_a.json",
];

const paths = (review: Published) => review.files.map((file) => file.path);
const added = (line: string) => ({
  kind: "diff",
  printed: expect.stringContaining(`+${line}`) as unknown,
});

test("a takeover completion includes each historical owner's contribution and no other story's", async () => {
  const story = await doneStory(takeoverCompletedHistory());

  const review = await story.published();

  expect(review).toMatchObject(story.endpoints);
  expect(paths(review)).toEqual([
    ...completedBookkeeping("akiho-chan.json"),
    "[literal]*.txt",
    "shared.txt",
    "takeover.txt",
  ]);
  expect(await story.readFile(review, "[literal]*.txt")).toMatchObject(
    added("delivered on another machine"),
  );
  expect(await story.readFile(review, "takeover.txt")).toMatchObject(
    added("second agent work"),
  );
});

test("another story's conflict resolution does not hide this story's edits", async () => {
  const story = await doneStory(unrelatedForeignMergeCompletedHistory());
  expect(() =>
    git(
      story.project,
      "merge-tree",
      "--write-tree",
      story.revision("foreign trunk"),
      story.revision("foreign branch"),
    ),
  ).toThrow(expect.objectContaining({ status: 1 }));

  const review = await story.published();

  expect(review).toMatchObject(story.endpoints);
  expect(paths(review)).toEqual([
    ...completedBookkeeping("yui-chan.json"),
    "[literal]*.txt",
    "shared.txt",
  ]);
  expect(await story.readFile(review, "[literal]*.txt")).toMatchObject(
    added("delivered on another machine"),
  );
});

test("an inseparable trunk rewrite declares its mixed baseline and refuses an unlisted one", async () => {
  const story = await doneStory(inseparableRewriteCompletedHistory());

  const review = await story.published();

  expect(review).toMatchObject(story.endpoints);
  expect(paths(review)).toEqual([
    ...completedBookkeeping("yui-chan.json"),
    "[literal]*.txt",
    "shared.txt",
  ]);
  // The story's claimed tree, which already carries trunk's rewrite of its
  // line once the story's edit is restated over it.
  const mixed = git(
    story.project,
    "rev-parse",
    `${story.revision("claim")}^{tree}`,
  );
  expect(
    review.files.filter((file) => file.includesTrunkFrom !== undefined),
  ).toEqual([
    expect.objectContaining({ path: "shared.txt", includesTrunkFrom: mixed }),
  ]);
  expect(await story.readFile(review, "shared.txt", mixed)).toMatchObject(
    added("other rewrites story"),
  );
  await expect(
    story.readFile(review, "shared.txt", review.baseline),
  ).rejects.toMatchObject({ status: 409 });
});

test("another story's octopus merge leaves the completed review readable", async () => {
  const story = await doneStory(foreignOctopusCompletedHistory());
  expect(
    git(story.project, "rev-list", "--min-parents=3", story.completion),
  ).not.toBe("");

  const review = await story.published();

  expect(review).toMatchObject(story.endpoints);
  expect(paths(review)).toEqual([
    ...completedBookkeeping("yui-chan.json"),
    "[literal]*.txt",
    "shared.txt",
  ]);
  expect(await story.readFile(review, "[literal]*.txt")).toMatchObject(
    added("delivered on another machine"),
  );
});

test("the story's own octopus merge explains why its edits cannot be attributed", async () => {
  const story = await doneStory(ownOctopusCompletedHistory());

  expect(await story.open()).toEqual({
    kind: "unavailable",
    explanation:
      "Published execution history contains a merge whose story changes cannot be attributed safely.",
  });
});
