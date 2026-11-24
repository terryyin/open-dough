import { renameSync } from "node:fs";
import {
  expectReviewChangesOffered,
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import {
  commitAllAs,
  push,
  yui,
} from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  openTaken,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import { writeAt } from "../../dashboard/test-support/support/storyReviewWorktree.ts";

test.use({
  originRepository: trunkModeStory({ published: 2, unpublished: true }),
});

const changedFile = "Modified src/a.ts";
const notSynced = /Review not refreshed: origin could not be synced \(.+\)\./;
const lastSynced = /What is shown was last synced at \S.*\./;

test("a synced Taken review stays readable while origin is unreachable and advances once it returns", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  const card = await openTaken(page, origin);
  const away = `${origin.origin}-away`;

  await test.step("Given I reviewed the Taken story while origin was reachable", async () => {
    review = await openIntentReviewChanges(page, card);
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md"]);
    await review.returnToDevelopment();
  });
  await test.step("When origin becomes unreachable and I reopen the review", async () => {
    renameSync(origin.origin, away);
    review = await openIntentReviewChanges(page, card);
  });
  await test.step("Then the last synced comparison appears with the sync notice", async () => {
    await review.expectFeedback(notSynced);
    await review.expectFeedback(lastSynced);
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md"]);
  });
  await test.step("And switching files shows their exact diffs", async () => {
    await review.files.choose("Added d.md");
    await review.diffs.expectShows("Added d.md", "+");
    await review.files.choose(changedFile);
    await review.diffs.expectChangedLines(changedFile, {
      removed: ["-a 0"],
      added: ["+a one"],
    });
  });
  await test.step("When I refresh while origin is still unreachable", async () => {
    review = await review.refreshAndAnswer();
  });
  await test.step("Then the comparison, selection and notice stay", async () => {
    await review.expectFeedback(notSynced);
    await review.files.expectSelected(changedFile);
    await review.diffs.expectShows(changedFile, "+a one");
  });
  await test.step("When origin returns and the agent publishes again", () => {
    renameSync(away, origin.origin);
    writeAt(origin.project, "more.md", "another published change\n");
    commitAllAs(origin.project, "Continue Story A", yui);
    push(origin.project);
  });
  await test.step("And I refresh the review", async () => {
    review = await review.refreshAndAnswer();
  });
  await test.step("Then the comparison advances and src/a.ts stays selected", async () => {
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md", "more.md"]);
    await review.expectNoText(notSynced);
    await review.files.expectSelected(changedFile);
    await review.diffs.expectShows(changedFile, "+a one");
  });
});

test("a Taken review never synced on this machine is unavailable offline and names the failed sync", async ({
  page,
  origin,
}) => {
  const card = await openTaken(page, origin);
  await expectReviewChangesOffered(card);
  renameSync(origin.origin, `${origin.origin}-away`);

  const review = await openIntentReviewChanges(page, card);

  await review.expectText(
    "The review could not sync from origin, and nothing synced earlier holds this comparison: ",
  );
});
