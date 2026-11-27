import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test("a Trunk story taken in a terminal shows an empty published review until its first change is pushed", async ({
  page,
  origin,
}) => {
  let workspace: string;
  let review: IntentReviewChanges;

  await test.step("Given a terminal start has only unpublished work", async () => {
    ({ workspace } = await origin.takenInTrunkMode("trunk-a"));
    makeMe
      .theWorkspace(workspace)
      .writeAt("slice.txt", "first slice\n")
      .commitAll("First slice")
      .please();
  });
  await test.step("When I open the Taken story's Review changes", async () => {
    await openBacklog(page, origin);
    const card = parts(page).taken.getByRole("article", { name: "Story A" });
    review = await openIntentReviewChanges(page, card);
  });
  await test.step("Then the review explains why no published files are listed", async () => {
    await review.expectText(
      "No changes attributed to this story on published trunk.",
    );
    await review.diffs.expectAbsent();
  });
  await test.step("When the agent publishes the first change and I refresh", async () => {
    push(workspace);
    review = await review.refreshAndAnswer();
  });
  await test.step("Then the file appears with the published diff", async () => {
    await review.files.choose("Added slice.txt");
    await review.diffs.expectShows("Added slice.txt", "+first slice");
  });
});
