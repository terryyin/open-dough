import { renameSync } from "node:fs";
import type { Page } from "@playwright/test";
import { reviewInitialSyncEndpoint } from "../../dashboard/src/reviewInitialSync.ts";
import {
  beginIntentReviewChanges,
  expectReviewChangesOffered,
  openIntentReviewChanges,
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
const failure =
  "The review could not sync from origin, and nothing synced earlier holds this comparison: fatal: Could not read from remote repository.";

function takeOriginOffline(origin: string) {
  const away = `${origin}-away`;
  renameSync(origin, away);
  return away;
}

function trackSyncRetries(page: Page) {
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
  return retries;
}

test("a synced Taken review stays readable while origin is unreachable and advances once it returns", async ({
  page,
  origin,
}) => {
  const card = await test.step("Given Story A is Taken", () =>
    openTaken(page, origin));
  await test.step("And I reviewed the Taken story while origin was reachable", async () => {
    const review = await openIntentReviewChanges(page, card);
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md"]);
    await review.returnToDevelopment();
  });
  const away = await test.step("When origin becomes unreachable", () =>
    takeOriginOffline(origin.origin));
  const review = await test.step("And I reopen the review", () =>
    openIntentReviewChanges(page, card));
  await test.step("Then the last synced comparison appears with the sync notice", async () => {
    await review.expectFeedback(notSynced);
    await review.expectFeedback(lastSynced);
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md"]);
  });
  await test.step("And the review offers no initial-sync retry", () =>
    review.expectRetrySyncUnavailable());
  await test.step("When I select the added file", () =>
    review.files.choose("Added d.md"));
  await test.step("Then I see its added line", () =>
    review.diffs.expectShows("Added d.md", "+"));
  await test.step("When I select src/a.ts", () =>
    review.files.choose(changedFile));
  await test.step("Then I see its exact changed lines", () =>
    review.diffs.expectChangedLines(changedFile, {
      removed: ["-a 0"],
      added: ["+a one"],
    }));
  const offline =
    await test.step("When I refresh while origin is still unreachable", () =>
      review.refreshAndAnswer());
  await test.step("Then the comparison, selection and notice stay", async () => {
    await offline.expectFeedback(notSynced);
    await offline.files.expectSelected(changedFile);
    await offline.diffs.expectShows(changedFile, "+a one");
  });
  await test.step("When origin returns", () => {
    renameSync(away, origin.origin);
  });
  await test.step("And the agent publishes again", () => {
    writeAt(origin.project, "more.md", "another published change\n");
    commitAllAs(origin.project, "Continue Story A", yui);
    push(origin.project);
  });
  const online = await test.step("And I refresh the review", () =>
    offline.refreshAndAnswer());
  await test.step("Then the comparison advances and the notice clears", async () => {
    await online.files.expectOutsideRows(["src", "  a.ts", "d.md", "more.md"]);
    await online.expectNoText(notSynced);
  });
  await test.step("And src/a.ts stays selected with its diff", async () => {
    await online.files.expectSelected(changedFile);
    await online.diffs.expectShows(changedFile, "+a one");
  });
});

test("a cold Taken review retains its initial sync failure and opens the original diff after a keyboard retry", async ({
  page,
  origin,
}) => {
  const card =
    await test.step("Given I can review the Taken story", async () => {
      const card = await openTaken(page, origin);
      await expectReviewChangesOffered(card);
      return card;
    });
  const retries = await test.step("And I track explicit retries", () =>
    trackSyncRetries(page));
  const away = await test.step("When origin becomes unreachable", () =>
    takeOriginOffline(origin.origin));
  const review = await test.step("And I open Review changes", () =>
    beginIntentReviewChanges(page, card));
  await test.step("Then the initial sync failure appears with Retry sync", async () => {
    await review.expectFeedback(failure);
    await review.expectRetrySyncAvailable();
  });
  await test.step("When I return to Development", () =>
    review.returnToDevelopment());
  await test.step("And origin returns", () => {
    renameSync(away, origin.origin);
  });
  const reopened = await test.step("And I reopen Review changes", () =>
    beginIntentReviewChanges(page, card));
  await test.step("Then the failure and Retry sync remain visible without an automatic retry", async () => {
    await reopened.expectFeedback(failure);
    await reopened.expectRetrySyncAvailable();
    expect(retries).toHaveLength(0);
  });
  await test.step("When I activate Retry sync with the keyboard", () =>
    reopened.retrySync("keyboard"));
  await test.step("Then Story A opens with its original selected diff", async () => {
    await reopened.expectStory("Story A");
    await reopened.files.expectSelected(changedFile);
    await reopened.diffs.expectChangedLines(changedFile, {
      removed: ["-a 0"],
      added: ["+a one"],
    });
  });
  await test.step("And Retry sync is no longer offered after the single retry", async () => {
    await reopened.expectRetrySyncUnavailable();
    expect(retries).toHaveLength(1);
  });
});
