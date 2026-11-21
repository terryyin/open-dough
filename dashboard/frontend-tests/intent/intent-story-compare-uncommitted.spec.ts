// Intent's Compare choice of all changes can leave a Taken story's
// uncommitted changes out, as Review changes can, and Refresh reads the
// worktree again keeping that choice. Explicit snapshot answers own the Git
// judgment.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import { putFrontendIntentStory } from "../../test-support/support/frontendIntentStory.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openStoryIntent } from "../../test-support/intentModePage.ts";
import { changed } from "../../test-support/support/intentStoryWorktree.ts";

const [first, second, third, fourth] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
  makeMe.aReviewCommit.numbered(3, "third change").please(),
  makeMe.aReviewCommit.numbered(4, "landing committed").please(),
];
const modified = makeMe.aReviewedFile
  .with({ kind: "modified", path: "dashboard/tests/a.spec.ts" })
  .please();
const added = makeMe.aReviewedFile
  .with({ kind: "added", path: "dashboard/tests/c.spec.ts" })
  .please();
const newFile = "Added dashboard/tests/c.spec.ts";
const landing = makeMe.aReviewedFile
  .with({ kind: "modified", path: "dashboard/tests/landing.spec.ts" })
  .please();
const landingEdit = "Modified dashboard/tests/landing.spec.ts";

// A worktree with `commits`, newest first, holding the committed files and an
// uncommitted edit to `landing.spec.ts` (Intent lists only location tests).
function worktree(
  commits: readonly (typeof first)[],
  committedFiles: readonly (typeof modified)[],
) {
  const newest = commits[0] ?? first;
  return frontendReviewSnapshot({
    files: [...committedFiles, landing],
    commits: [...commits],
    uncommitted: makeMe.anUncommittedReviewItem.after(newest).please(),
    committed: {
      from: first.fromTree,
      tree: newest.tree,
      files: [...committedFiles],
    },
  });
}

test("clearing Include uncommitted changes leaves out landing.spec.ts, and Refresh shows a new commit with the check still cleared", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  const review = await installFrontendStoryReview(
    page,
    worktree([second, first], [modified]),
  );
  review.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", ["+change"]),
    "dashboard/tests/a.spec.ts",
  );
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  const compare = story.compare();
  await story.chooseTab("Changes");
  await story.headerDetail();

  await test.step("all changes offers the check, on, with landing.spec.ts listed", async () => {
    await expect(compare.includeUncommitted).toBeChecked();
    await expect(story.file(landingEdit)).toBeVisible();
    await expect(story.header.revisions).toContainText(
      "uncommitted changes included",
    );
  });

  await test.step("clearing the check removes landing.spec.ts and the header's uncommitted words", async () => {
    await compare.includeUncommitted.uncheck();
    await expect(story.file(landingEdit)).toHaveCount(0);
    await expect(story.file(changed.modified)).toBeVisible();
    await expect(story.header.revisions).not.toContainText("uncommitted");
  });

  await test.step("the check shows only with All changes", async () => {
    await compare.choose("Commits");
    await expect(compare.includeUncommitted).toHaveCount(0);
    await compare.choose("All changes");
    await expect(compare.includeUncommitted).not.toBeChecked();
  });

  await test.step("Refresh reads a worktree with a new commit", async () => {
    review.answerNextSnapshot(
      worktree([third, second, first], [modified, added]),
    );
    await compare.refresh();
  });

  await test.step("the new commit's file shows and the check stays cleared", async () => {
    await expect(story.file(newFile)).toBeVisible();
    await expect(compare.includeUncommitted).not.toBeChecked();
    await expect(story.file(landingEdit)).toHaveCount(0);
  });

  await test.step("Commits lists the new commit", async () => {
    await compare.choose("Commits");
    await expect(compare.commit("third change")).toBeVisible();
    await compare.choose("All changes");
  });

  await test.step("Refresh reads a worktree whose changes are all committed", async () => {
    review.answerNextSnapshot(
      frontendReviewSnapshot({
        files: [modified, added, landing],
        commits: [fourth, third, second, first],
      }),
    );
    await compare.refresh();
  });

  await test.step("all changes lists the committed landing.spec.ts and offers no check", async () => {
    await expect(story.file(landingEdit)).toBeVisible();
    await expect(compare.choice("All changes")).toBeChecked();
    await expect(compare.includeUncommitted).toHaveCount(0);
  });
});
