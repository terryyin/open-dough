// Intent's Compare choice reads a Taken story through Review changes' own
// selection: a commit range chosen by its two ends changes the listed files,
// their diffs and the header together, survives view switches, and a newly
// selected story opens on all changes. Explicit service answers own the Git
// judgment.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import {
  putFrontendIntentStory,
  frontendIntentChanges,
} from "../../test-support/support/frontendIntentStory.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openStoryIntent } from "../../test-support/intentModePage.ts";
import { changed } from "../../test-support/support/intentStoryWorktree.ts";
import { purposeRegion } from "../../test-support/intentPerspectivePage.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { emptyArea } from "../../test-support/storyCardSelection.ts";
import { storyReviewRangeEndpoint } from "../../src/storyReviewContract.ts";

const [first, second, third] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
  makeMe.aReviewCommit.numbered(3, "third change").please(),
];

test("choosing the two oldest commits lists only their files with diffs from the commit before, names them in the header, and survives view switches but not another story", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  const review = await installFrontendStoryReview(
    page,
    frontendReviewSnapshot({
      files: frontendIntentChanges,
      commits: [third, second, first],
      uncommitted: makeMe.anUncommittedReviewItem.after(third).please(),
    }),
  );
  review.answerFile(
    frontendFileDiff("dashboard/tests/a.spec.ts", ["+all changes"]),
    "dashboard/tests/a.spec.ts",
  );
  review.answerRange({
    kind: "comparison",
    from: first.fromTree,
    tree: second.tree,
    trunkIntegrated: false,
    files: [
      makeMe.aReviewedFile
        .with({ kind: "modified", path: "dashboard/tests/a.spec.ts" })
        .please(),
      makeMe.aReviewedFile
        .with({ kind: "added", path: "dashboard/tests/boundary/b.spec.ts" })
        .please(),
    ],
  });
  const { card, intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  const compare = story.compare();
  await story.chooseTab("Changed tests");

  await test.step("a Taken story opens on all changes, uncommitted included, beside an uncollapsible header", async () => {
    await story.headerDetail();
    await expect(compare.choice("All changes")).toBeChecked();
    await expect(story.header.revisions).toContainText(
      "uncommitted changes included",
    );
    await expect(compare.commits).toHaveCount(0);
    await expect(story.file(changed.deleted)).toBeVisible();
    expect(await story.diff(changed.modified)).toContain("all changes");
  });

  await test.step("Commits, then the two oldest commits as ends, lists only their files, each diff from the commit before, and names the range", async () => {
    review.answerNextFile(
      frontendFileDiff("dashboard/tests/a.spec.ts", ["+range change"]),
      "dashboard/tests/a.spec.ts",
    );
    await compare.choose("Commits");
    await expect(compare.commits).toBeVisible();
    await compare.chooseAlone("first change");
    await compare.commit("second change").click();
    await expect(compare.range).toContainText("Changes in 2 commits");
    await expect(compare.range).toContainText(
      "From c1c1c1c first change to c2c2c2c second change.",
    );
    await expect(story.file(changed.deleted)).toHaveCount(0);
    // Each listed with its change marker.
    for (const name of [changed.modified, changed.added])
      await expect(story.file(name)).toBeVisible();
    expect(review.queriesAsked(storyReviewRangeEndpoint).at(-1)).toMatchObject({
      fromTree: first.fromTree,
      tree: second.tree,
    });
    await expect(story.diffReading.name).toHaveText(changed.modified);
    await expect(story.diffReading.code).toContainText("range change");
  });

  await test.step("CI comparison and back keeps the range and the selected file", async () => {
    await story.chooseTab("CI comparison");
    await story.chooseTab("Changed tests");
    await expect(compare.choice("Commits")).toBeChecked();
    await expect(compare.range).toContainText("Changes in 2 commits");
    await expect(story.diffReading.name).toHaveText(changed.modified);
  });

  await test.step("under the range, an unchanged file shows the source Intent reads today", async () => {
    await story.file("dashboard/tests/boundary/kept.spec.ts").click();
    await expect(purposeRegion(intent)).toContainText("kept 11");
  });

  await test.step("selecting another story and returning opens on all changes", async () => {
    const { development, intentChoice, backlog } = parts(page);
    await development.click();
    await backlog
      .getByRole("article", { name: "Story B" })
      .getByRole("heading", { level: 3 })
      .click();
    await emptyArea(card).click();
    await intentChoice.click();
    await story.chooseTab("Changed tests");
    await expect(compare.choice("All changes")).toBeChecked();
    await expect(story.file(changed.deleted)).toHaveCount(1);
    // Commits again anchors as a first choice: its newest item alone.
    await compare.choose("Commits");
    await expect(compare.range).toContainText("Uncommitted changes");
    await expect(compare.range).not.toContainText("Changes in 2 commits");
  });
});
