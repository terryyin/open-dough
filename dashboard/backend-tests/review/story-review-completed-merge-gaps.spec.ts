// Merge reads under a chattering Git merge driver keep the Done review's
// answer; a Git that cannot write merge trees, or a merge edit object the
// Review repository cannot read, explains the gap instead of a partial
// comparison.
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync } from "node:fs";
import path from "node:path";
import { beforeAll, expect, test, vi } from "vitest";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import type { RepositoryDescription } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { ordinaryStoryBranchCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import {
  ownConflictExtraCompletedHistory,
  plainMergeEditCompletedHistory,
} from "../../test-support/support/completedOwnMergeHistory.ts";
import { nonOwningForeignMergeCompletedHistory } from "../../test-support/support/completedForeignMergeHistory.ts";
import {
  dropReviewRepositoryObject,
  fixtureReviewRepository,
} from "../../test-support/support/reviewRepositoryFixture.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// Each history's template is built before the cases that copy it.
for (const history of [
  () => ordinaryStoryBranchCompletedHistory(),
  () => plainMergeEditCompletedHistory(),
  () => ownConflictExtraCompletedHistory(),
  () => nonOwningForeignMergeCompletedHistory("story-branch"),
])
  beforeAll(() => prepareRepository(history()));

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
const open = () => storyReview({ read: { subject, completed: true } }, signal);

async function doneStory(history: RepositoryDescription<string>) {
  const { repository } = await configuredFixtureProject(history);
  return { repository, project: repository.integration };
}
type DoneStory = Awaited<ReturnType<typeof doneStory>>;

// A merge driver that prints before merging, configured outside the
// declared history in the Review repository the review merges in, once its
// first read created it. It leaves a mark each time Git runs it.
async function configurePrintingDriver(story: DoneStory) {
  await open();
  const review = fixtureReviewRepository(story.repository.fixture);
  const ran = path.join(story.repository.fixture, "driver-ran");
  git(
    review,
    "config",
    "merge.printing.driver",
    `printf 'driver says hello\\n'; touch '${ran}'; git merge-file "%A" "%O" "%B"`,
  );
  makeMe
    .theWorkspace(review)
    .writeAt("info/attributes", "shared.txt merge=printing\n")
    .please();
  return () => existsSync(ran);
}

for (const [label, history] of [
  ["clean merges", ordinaryStoryBranchCompletedHistory],
  ["a merge edit", plainMergeEditCompletedHistory],
  ["an own conflict", ownConflictExtraCompletedHistory],
  [
    "a non-owning story-file resolution",
    () => nonOwningForeignMergeCompletedHistory("story-branch"),
  ],
] as const)
  test(`a printing merge driver keeps the review of ${label}`, async () => {
    const story = await doneStory(history());
    const driverRan = await configurePrintingDriver(story);

    expect(await open()).toMatchObject({
      kind: "published",
      files: expect.arrayContaining([
        expect.objectContaining({ path: "shared.txt" }),
      ]) as unknown,
    });
    expect(driverRan()).toBe(true);
  });

test("a printing merge driver keeps the merge edit's diff", async () => {
  const story = await doneStory(plainMergeEditCompletedHistory());
  const driverRan = await configurePrintingDriver(story);

  const review = await open();
  if (review.kind !== "published") throw new Error("No published review");

  expect(review.files.map((file) => file.path)).toContain(
    "merge-resolution.txt",
  );
  expect(
    await reviewedFileDiff(
      {
        read: {
          subject,
          completion: review.completion,
          baseline: review.baseline,
          tree: review.tree,
          path: "merge-resolution.txt",
        },
      },
      signal,
    ),
  ).toMatchObject({
    kind: "diff",
    printed: expect.stringContaining("+integration edit") as unknown,
  });
  expect(driverRan()).toBe(true);
});

test("a Git that cannot write merge trees explains the merge resolution gap without files", async () => {
  const story = await doneStory(plainMergeEditCompletedHistory());
  // A Git older than 2.38 refuses `merge-tree --write-tree`; every other
  // command reaches real Git.
  const realGit = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  const bin = path.join(story.repository.fixture, "old-git");
  makeMe
    .theWorkspace(bin)
    .writeAt(
      "git",
      [
        "#!/bin/sh",
        'if [ "$1" = merge-tree ]; then',
        '  echo "error: unknown option \\`write-tree\'" >&2',
        "  exit 129",
        "fi",
        `exec '${realGit}' "$@"`,
        "",
      ].join("\n"),
    )
    .please();
  chmodSync(path.join(bin, "git"), 0o755);
  vi.stubEnv("PATH", `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`);

  expect(await open()).toEqual({
    kind: "unavailable",
    explanation:
      "Published execution history contains a merge whose resolution evidence could not be read.",
  });
});

test("an unreadable merge edit object explains the Git gap instead of a partial comparison", async () => {
  const story = await doneStory(ownConflictExtraCompletedHistory());
  const blob = git(
    story.project,
    "rev-parse",
    `${story.repository.revisions["completion"] ?? ""}:merge-resolution.txt`,
  );
  await open();
  dropReviewRepositoryObject(story.repository.fixture, blob);

  const review = await open();

  expect(review).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "Published completion history could not be read",
    ) as unknown,
  });
  expect(review).not.toHaveProperty("files");
});
