// A changed file whose path names no grammar takes its `syntax` hint from the
// project's Intent settings at the comparison's revision
// (../../src/IntentComparedFile.tsx), and the hint styles its diff.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { storyReviewIds } from "../../../Distribution/tests/support/storyReviewCompletedTestData.mjs";
import { reviewDiffPage } from "../review/reviewDiffPage.ts";
import { openStoryChanges } from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const shellCode = "if true; then echo x; fi";
const hintedPath = "scripts/setup.test";

test("a story's diff reads its Intent syntax hint at the comparison's revision and styles it", async () => {
  const { locationRevisions } = await openStoryChanges({
    locationAnswer: makeMe.anIntentLocationsAnswer
      .locating(
        makeMe.anIntentLocation
          .at("scripts")
          .withSources({ include: ["**/*.test"], syntax: "shell" })
          .selecting(hintedPath)
          .please(),
      )
      .please(),
    review: () =>
      Promise.resolve(makeMe.aStoryReview.adding(hintedPath).please()),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(hintedPath, shellCode).please(),
      ),
    fileText: () =>
      Promise.resolve({ kind: "text", baseline: "", tree: `${shellCode}\n` }),
  });
  await intentStoryCompare().file(`Added ${hintedPath}`).click();

  await expect.element(reviewDiffPage().newLine(1).token(/^if$/)).toBeVisible();
  expect(locationRevisions).toContain(storyReviewIds.head);
});
