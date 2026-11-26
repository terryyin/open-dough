// A Done story's repository inventory may arrive after its comparison has
// listed the changed files. Folders the reader opened in the meantime stay
// open when it arrives (../../src/useIntentOpenFolders.ts), while the
// first changed configured root still opens.

import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryReviewResult } from "../../src/storyReviewResult.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

const first = "z-tests/nested/first.spec.ts";
const second = "a-tests/second-folder/second.spec.ts";
const rootListing = (file: string) =>
  makeMe.anIntentLocation
    .at(file.split("/")[0] ?? "")
    .ofKind("typescript", ["**/*.spec.ts"])
    .selecting(file)
    .please();

test("folders the reader opened before the inventory arrives stay open after it", async () => {
  const inventory = heldRead<StoryReviewResult>();
  await openDoneStoryComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .published(doneCompletion)
          .adding(first)
          .adding(second)
          .please(),
      ),
    storyResult: () => inventory.ask(),
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect.element(story.folder("a-tests")).toBeInTheDocument();
  await expect.poll(inventory.asked).toBe(true);
  await story.expandShownFolderPath("a-tests/second-folder");

  inventory.resolve({
    kind: "inventory",
    revision: doneCompletion,
    paths: [first, second],
    locations: [rootListing(first), rootListing(second)],
  });
  await story.inventoryRead();
  await expect.element(story.folderToggle("z-tests", true)).toBeVisible();
  await expect.element(story.folderToggle("a-tests", true)).toBeVisible();
  await expect.element(story.folderToggle("second-folder", true)).toBeVisible();
  await expect.element(story.file(`Added ${second}`)).toBeVisible();
});
