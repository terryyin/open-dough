import { renameSync } from "node:fs";
import { reviewInitialSyncEndpoint } from "../../dashboard/src/reviewInitialSync.ts";
import {
  beginIntentReviewChanges,
  expectReviewChangesOffered,
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
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
    await review.expectRetrySyncUnavailable();
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

test("a cold Taken review retains its initial sync failure and opens the original diff after a keyboard retry", async ({
  page,
  origin,
}) => {
  const card = await openTaken(page, origin);
  await expectReviewChangesOffered(card);
  const away = `${origin.origin}-away`;
  const failure =
    "The review could not sync from origin, and nothing synced earlier holds this comparison: fatal: Could not read from remote repository.";
  const retries: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      request.method() === "POST" &&
      url.pathname === reviewInitialSyncEndpoint &&
      url.searchParams.get("retry") === "true"
    )
      retries.push(request.url());
  });
  renameSync(origin.origin, away);
  const review = await beginIntentReviewChanges(page, card);
  await review.expectFeedback(failure);
  await review.expectRetrySyncAvailable();
  await review.returnToDevelopment();

  renameSync(away, origin.origin);
  const reopened = await beginIntentReviewChanges(page, card);
  await reopened.expectFeedback(failure);
  await reopened.expectRetrySyncAvailable();
  expect(retries).toHaveLength(0);
  await reopened.retrySync("keyboard");

  await reopened.expectStory("Story A");
  await reopened.files.expectSelected(changedFile);
  await reopened.diffs.expectChangedLines(changedFile, {
    removed: ["-a 0"],
    added: ["+a one"],
  });
  await reopened.expectRetrySyncUnavailable();
  expect(retries).toHaveLength(1);
});
