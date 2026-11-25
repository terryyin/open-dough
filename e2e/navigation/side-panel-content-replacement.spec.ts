// Native final reports and published session reviews replace each other in
// the Side panel. A held Git comparison must not answer a later session.
import { expect } from "@playwright/test";
import { keyStep } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { holdPublishedReviewOf } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import { finalReportParts } from "../../dashboard/test-support/finalReportPages.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
} from "../../dashboard/test-support/support/startOrigin.ts";
import {
  keptSession,
  storyBReport,
} from "../../dashboard/test-support/support/sidePanelContents.ts";
import { test } from "../../dashboard/test-support/support/sidePanelReplacement.ts";

test.use({ preparationHost: "codex" });

test("a session review, another session's review, and a final report replace each other in the one side panel", async ({
  page,
  dashboard,
  storiesAAndB: { reviewReads, journey, storyBSession, first, second },
}) => {
  const heldA = await holdPublishedReviewOf(page, dashboard.origin, first);
  try {
    await journey.phase(
      "The first session's review opens on its held read",
      ({ board }) => board.reviewPublishedSession(first),
    );
    await heldA.reached;
    await journey.phase(
      "The second session's review replaces the first session's pending review",
      ({ board, sidePanel }) => {
        sidePanel.storyReview
          .expectStory(`Published session ${first}`)
          .expectFeedback("Reading the story's changes…");
        board
          .reviewPublishedSession(second)
          .expectStory(`Published session ${second}`)
          .expectChangedFile("1 changed file", "Added story-b.txt");
      },
    );
  } finally {
    await heldA.releaseAndDrain();
  }
  await journey.phase(
    "a held review never answers a later session's review",
    ({ sidePanel }) =>
      sidePanel.storyReview
        .expectStory(`Published session ${second}`)
        .expectSession(second)
        .expectChangedFiles("1 changed file")
        .expectNoChangedFiles(/2 changed files/)
        .expectNoText("first.txt")
        .sidePanel.expectItems(1),
  );

  await journey.phase("a final report replaces the review", ({ board }) =>
    board
      .storyCard("Story B")
      .readFinalReport()
      .expectText(storyBReport)
      .sidePanel.expectItems(1)
      .expectNotShowing("Session review"),
  );
  const width = await journey.shownWidth();
  await journey.phase(
    "the Panel divider resizes the Side panel with the mouse and the keyboard",
    ({ panelDivider, sidePanel }) => {
      panelDivider
        .drag(-100)
        .expectSidePanelWidth(width + 100)
        .press("ArrowRight")
        .expectSidePanelWidth(width + 100 - keyStep);
      sidePanel.finalReport.expectText(storyBReport);
    },
  );
  const readsBeforeReopening = reviewReads.length;
  await journey.phase("a review replaces the final report", ({ board }) =>
    board
      .reviewPublishedSession(second)
      .expectChangedFiles("1 changed file")
      .sidePanel.expectNotShowing("Final report")
      .expectItems(1),
  );
  // Reopening reads a fresh snapshot.
  expect(reviewReads.length).toBe(readsBeforeReopening + 1);
  await journey.phase(
    "closing the review gives the keyboard back to its session entry",
    ({ board, sidePanel }) => {
      sidePanel.storyReview.close().expectItems(0);
      board.expectPublishedReviewFocused(second);
    },
  );
  expect((await keptSession(dashboard, storyBSession)).doneAt).toBe(undefined);

  await journey.phase(
    "The first session's review opens with a file chosen",
    ({ board }) =>
      board
        .reviewPublishedSession(first)
        .chooseFileByKeyboard("2 changed files", "Added second.txt")
        .expectFileChosen("2 changed files", "Added second.txt"),
  );
  const readsBeforeAsking = reviewReads.length;
  await journey.phase(
    "Review changes for the review shown takes the keyboard to it and keeps its snapshot",
    ({ board }) =>
      board
        .reviewPublishedSession(first, "keyboard")
        .expectKeyboardInBody()
        .expectFileChosen("2 changed files", "Added second.txt")
        .expectFileDiff("Added second.txt")
        .sidePanel.expectItems(1),
  );
  expect(reviewReads.length).toBe(readsBeforeAsking);
});

test("a review and a final report stay shown with their selection while the page changes to Intent and back", async ({
  page,
  dashboard,
  storiesAAndB: { reviewReads, journey, storyBSession, first },
}) => {
  await journey.phase(
    "The first session's review opens with a file chosen",
    ({ board }) =>
      board
        .reviewPublishedSession(first)
        .chooseFile("2 changed files", "Added second.txt")
        .expectFileChosen("2 changed files", "Added second.txt"),
  );
  const reads = reviewReads.length;
  await journey.phase(
    "the review keeps its session, chosen file and diff on Intent",
    ({ perspective }) =>
      perspective
        .choose("Intent")
        .expectChosen("Intent")
        .sidePanel.storyReview.expectStory(`Published session ${first}`)
        .expectFileChosen("2 changed files", "Added second.txt")
        .expectFileDiff("Added second.txt")
        .sidePanel.expectItems(1),
  );
  await page.goBack();
  await journey.phase(
    "browser Back keeps the same review on the Board",
    ({ perspective, intent }) => {
      perspective
        .expectChosen("Development")
        .sidePanel.storyReview.expectStory(`Published session ${first}`)
        .expectFileChosen("2 changed files", "Added second.txt")
        .expectFileDiff("Added second.txt")
        .sidePanel.expectItems(1);
      intent.expectNotShown();
    },
  );
  expect(reviewReads.slice(reads)).toEqual([]);

  await journey.phase(
    "the final report keeps its session's report on Intent",
    ({ board, perspective, intent }) => {
      board.storyCard("Story B").readFinalReport().expectText(storyBReport);
      perspective.choose("Intent");
      intent
        .expectSelectedStory(otherQueuedIdentity)
        .expectText("No Intent locations are configured for Open Dough.")
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  await page.goBack();
  await journey.phase(
    "browser Back keeps the same final report on the Board",
    ({ board, perspective }) => {
      perspective.expectChosen("Development");
      board
        .storyCard("Story B")
        .expectShown()
        .expectSelected()
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  // Reading the report left its session not done.
  expect((await keptSession(dashboard, storyBSession)).doneAt).toBe(undefined);
});

test("a Story card opens Intent beside another story's final report", async ({
  page,
  storiesAAndB: { journey },
}) => {
  const report =
    await test.step("Given Story B's final report is open", async () => {
      await journey.phase("Read Story B's report", ({ board }) =>
        board.storyCard("Story B").readFinalReport().expectText(storyBReport),
      );
      return finalReportParts(page).reportBody.elementHandle();
    });
  await test.step("When I review changes on Story A's card by keyboard", () =>
    journey.phase("Open Story A's Changes", ({ board }) =>
      board.storyCard("Story A").openChanges("keyboard"),
    ));
  await test.step("Then the path reading has focus beside the same report", () =>
    journey.phase("Story A is selected in Intent", ({ intent, sidePanel }) => {
      intent.expectSelectedStory(queuedIdentity).expectFocusedPathReading();
      sidePanel.finalReport.expectText(storyBReport).sidePanel.expectItems(1);
    }));
  await test.step("When I return to Development", () =>
    journey.phase("Choose Development", ({ perspective }) =>
      perspective.choose("Development"),
    ));
  await test.step("Then Story A remains selected and the original report stays mounted", async () => {
    await journey.phase(
      "Development shows both stories' content",
      ({ board, sidePanel }) => {
        board.storyCard("Story A").expectSelected();
        sidePanel.finalReport.expectText(storyBReport).sidePanel.expectItems(1);
      },
    );
    expect(await report.evaluate((body) => body.isConnected)).toBe(true);
  });
});
