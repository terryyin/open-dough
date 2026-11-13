// The one Side panel replaces reviews and native final reports without
// continuing or completing a session. Late review reads never answer a new
// story; reopening reads a fresh snapshot, while asking for the shown review
// keeps it. Real worktrees and kept records supply the inputs; the panel
// divider shares terminal/review resizing behavior.

import { expect, type Page } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { keyStep } from "../sidePanelWidthPage.ts";
import { sidePanelPages } from "../sidePanelPages.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import type { FakeCodex } from "../support/fakeCodexTypes.ts";
import { holdReviewOf } from "../support/holdReviewResponse.ts";
import { queuedCodexPreviewTest as test } from "../support/preparationPage.ts";
import { openBacklog } from "../support/sessionDialog.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  type StartOrigin,
} from "../support/startOrigin.ts";
import {
  keptSession,
  retiredCodexSession,
  storyBBranch,
  storyBReport,
  storyBWorktree,
  storyReviewReads,
} from "../support/sidePanelContents.ts";
import { branch, storyWorktree } from "../support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";

test.use({ preparationHost: "codex" });

// The Board with Story A's review worktree and Story B's worktree, Story B's
// session a Codex one whose saved workspace is gone so its final report is
// Codex's native `storyBReport`; with the review reads the page asks from now.
async function openStoriesAAndB({
  page,
  dashboard,
  origin,
  codexProtocol: native,
}: {
  page: Page;
  dashboard: DashboardServer;
  origin: StartOrigin;
  codexProtocol: FakeCodex | undefined;
}) {
  if (native === undefined) throw new Error("Missing native fixture");
  const { workspace: workspaceA } = storyWorktree(origin);
  const workspaceB = storyBWorktree(origin.project);
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({ workspace: workspaceA, branch })
      .please(),
    makeMe.aLaunchRecord
      .executing({ identity: otherQueuedIdentity, title: "Story B" })
      .onStoryBranch({ workspace: workspaceB, branch: storyBBranch })
      .inCodexSession(retiredCodexSession(native, workspaceB, storyBReport))
      .please(),
  ]);
  const reviewReads = storyReviewReads(page);
  await openBacklog(page, origin);
  return { native, reviewReads, journey: sidePanelPages(page) };
}

test("a review, another story's review, and a final report replace each other in the one side panel", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  const { native, reviewReads, journey } = await openStoriesAAndB({
    page,
    dashboard,
    origin,
    codexProtocol,
  });

  // Story A's first review read is held at the transport until released.
  const heldA = await holdReviewOf(page, queuedIdentity);
  try {
    await journey.phase(
      "Story A's review opens on its held read",
      ({ board }) => board.storyCard("Story A").reviewChanges(),
    );
    await heldA.reached;
    await journey.phase(
      "Story B's review replaces Story A's, still reading",
      ({ board, sidePanel }) => {
        sidePanel.storyReview
          .expectStory("Story A")
          .expectFeedback("Reading the story's changes…");
        board
          .storyCard("Story B")
          .reviewChanges()
          .expectStory("Story B")
          .expectChangedFile("1 changed file", "Added story-b.txt");
      },
    );
  } finally {
    await heldA.releaseAndDrain();
  }
  await journey.phase(
    "a held review of Story A never answers Story B's review opened meanwhile",
    ({ sidePanel }) =>
      sidePanel.storyReview
        .expectStory("Story B")
        .expectIdentity(otherQueuedIdentity)
        .expectChangedFiles("1 changed file")
        .expectNoChangedFiles(/7 changed files/)
        .expectNoText("unstaged.txt")
        .sidePanel.expectItems(1),
  );

  await journey.phase("a final report replaces the review", ({ board }) =>
    board
      .storyCard("Story B")
      .readFinalReport()
      .expectText(storyBReport)
      .sidePanel.expectItems(1)
      .expectNotShowing("Story review"),
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
      .storyCard("Story B")
      .reviewChanges()
      .expectChangedFiles("1 changed file")
      .sidePanel.expectNotShowing("Final report")
      .expectItems(1),
  );
  // Reopening reads a fresh snapshot.
  expect(reviewReads.length).toBe(readsBeforeReopening + 1);
  await journey.phase(
    "closing the review gives the keyboard back to its Story card",
    ({ board, sidePanel }) => {
      sidePanel.storyReview.close().expectItems(0);
      board.storyCard("Story B").expectReviewChangesFocused();
    },
  );
  expect((await keptSession(dashboard, native.threadId)).doneAt).toBe(
    undefined,
  );

  await journey.phase(
    "Story A's review opens with a file chosen",
    ({ board }) =>
      board
        .storyCard("Story A")
        .reviewChanges()
        .chooseFileByKeyboard("7 changed files", "Modified unstaged.txt")
        .expectFileChosen("7 changed files", "Modified unstaged.txt"),
  );
  const readsBeforeAsking = reviewReads.length;
  await journey.phase(
    "Review changes for the review shown takes the keyboard to it and keeps its snapshot",
    ({ board }) =>
      board
        .storyCard("Story A")
        .reviewChangesByKeyboard()
        .expectKeyboardInBody()
        .expectFileChosen("7 changed files", "Modified unstaged.txt")
        .expectFileDiff("Modified unstaged.txt")
        .sidePanel.expectItems(1),
  );
  expect(reviewReads.length).toBe(readsBeforeAsking);
});

test("a review and a final report stay shown with their selection while the page changes to Intent and back", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  const { native, reviewReads, journey } = await openStoriesAAndB({
    page,
    dashboard,
    origin,
    codexProtocol,
  });

  await journey.phase(
    "Story A's review opens with a file chosen",
    ({ board }) =>
      board
        .storyCard("Story A")
        .reviewChanges()
        .chooseFile("7 changed files", "Modified unstaged.txt")
        .expectFileChosen("7 changed files", "Modified unstaged.txt"),
  );
  const reads = reviewReads.length;
  await journey.phase(
    "the review keeps its story, chosen file and diff on Intent and back",
    ({ perspective, intent }) => {
      for (const shown of ["Intent", "Development"] as const)
        perspective
          .choose(shown)
          .expectChosen(shown)
          .sidePanel.storyReview.expectStory("Story A")
          .expectFileChosen("7 changed files", "Modified unstaged.txt")
          .expectFileDiff("Modified unstaged.txt")
          .sidePanel.expectItems(1);
      intent.expectNotShown();
    },
  );
  // The review shows Story A, so Intent read Story A's comparison for its
  // lens; the shown review read none again.
  expect(reviewReads.slice(reads)).toEqual([queuedIdentity]);

  await journey.phase(
    "the final report keeps its session's report on Intent",
    ({ board, perspective, intent }) => {
      board.storyCard("Story B").readFinalReport().expectText(storyBReport);
      perspective.choose("Intent");
      intent
        .expectText("No intent locations are configured for Open Dough.")
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  await journey.phase(
    "the final report keeps its session's report back on the Board",
    ({ board, perspective }) => {
      perspective.choose("Development");
      board
        .storyCard("Story B")
        .expectShown()
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  // Reading the report left its session not done.
  expect((await keptSession(dashboard, native.threadId)).doneAt).toBe(
    undefined,
  );
});
