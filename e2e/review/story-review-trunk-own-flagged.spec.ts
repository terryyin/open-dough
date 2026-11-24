import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import {
  openTaken,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";

test.use({ originRepository: trunkModeStory({ rewritten: true }) });

test("a published Trunk file rewritten by another developer keeps its mixed attribution and older story lines", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  const mixed = "Modified src/c.ts, includes trunk's changes";

  await test.step("When I open the Taken story's Review changes", async () => {
    review = await openIntentReviewChanges(page, await openTaken(page, origin));
  });
  await test.step("Then the rewritten file is marked as including trunk's changes", async () => {
    await review.files.expectTrunkQualifier(mixed);
    await review.files.expectLineCounts(mixed, "+2 −2");
  });
  await test.step("When I select the rewritten file", async () => {
    await review.files.choose(mixed, "keyboard");
  });
  await test.step("Then the diff keeps the older story edit beside the mixed rewrite", async () => {
    await review.diffs.expectChangedLines(mixed, {
      removed: ["-c 3", "-c 9"],
      added: ["+c trunk", "+c nine"],
    });
    await review.diffs.expectLacks(mixed, "c story", "<<<<<<<");
  });
});
