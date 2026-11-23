// Native final reports and published session reviews replace each other in
// the Side panel. A held Git comparison must not answer a later session.
import { expect } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keyStep } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import { holdPublishedReviewOf } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import { test as base } from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { otherQueuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  keptSession,
  retiredCodexSession,
  storyBBranch,
  storyBReport,
  storyBWorktree,
  storyReviewReads,
} from "../../dashboard/test-support/support/sidePanelContents.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  publishedPairAdding,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import { publishReviewSession } from "../../dashboard/test-support/support/publishedReviewSession.ts";

const test = base.extend<{
  storiesAAndB: {
    reviewReads: readonly string[];
    journey: ReturnType<typeof sidePanelPages>;
    storyBSession: string;
    first: string;
    second: string;
  };
}>({
  storiesAAndB: async ({ page, dashboard, origin, codexProtocol }, use) => {
    if (codexProtocol === undefined) throw new Error("Missing native fixture");
    const started = publishedPairAdding(origin, "first.txt");
    const candidate = trunkAdvancedWith(origin, "second.txt");
    const first = publishReviewSession(origin, {
      base: started.base,
      candidate,
    });
    const second = publishReviewSession(
      origin,
      publishedPairAdding(origin, "story-b.txt"),
    );
    const workspaceB = storyBWorktree(origin.project);
    keepLaunchRecords(dashboard, [
      makeMe.aLaunchRecord
        .executing({ identity: otherQueuedIdentity, title: "Story B" })
        .onStoryBranch({ workspace: workspaceB, branch: storyBBranch })
        .inCodexSession(
          retiredCodexSession(codexProtocol, workspaceB, storyBReport),
        )
        .please(),
    ]);
    const reviewReads = storyReviewReads(page);
    await page.setViewportSize({ width: 2400, height: 900 });
    await openBacklog(page, origin);
    await use({
      reviewReads,
      journey: sidePanelPages(page),
      first,
      second,
      storyBSession: codexProtocol.threadId,
    });
  },
});
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
