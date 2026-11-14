// The page's one side panel switches between a story's review and a
// session's terminal, of Story A's and Story B's real worktrees
// (../../dashboard/tests/support/sidePanelContents.ts) and kept launch records: Story A's session is
// listed by the synthetic `claude` (./fixtures/fake-claude). Whatever opens,
// by a card's or the Sessions sidebar's own controls, the panel shows exactly
// one named item beside a Board that stays usable. A review replaces the
// terminal, which detaches without ending the session or marking it done, and
// opening that session again attaches to the same session. Review and
// terminal share the panel's frame icon controls, maximize into the same
// room, and any change of content returns the normal split. Each opening
// selects and highlights its story, which Intent reads; inspecting or
// selecting another card leaves the panel as it is. The real `claude` is
// never reached.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectSettledPage } from "../../dashboard/tests/dashboardPage.ts";
import {
  type SidePanelPages,
  sidePanelPages,
} from "../../dashboard/tests/sidePanelPages.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/tests/support/sessionDialog.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
} from "../../dashboard/tests/support/startOrigin.ts";
import {
  keptSession,
  listed,
  storyBBranch,
  storyBWorktree,
  storyReviewReads,
} from "../../dashboard/tests/support/sidePanelContents.ts";
import {
  branch,
  storyWorktree,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";

// Intent reads the Selected story; the page then goes back to the Board.
function intentReads(
  { perspective, intent }: SidePanelPages,
  identity: string,
) {
  perspective.choose("Intent");
  intent.expectSelectedStory(identity);
  perspective.choose("Development");
}

test("review and terminal take turns in the one side panel beside a usable Board", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace: workspaceA } = storyWorktree(origin);
  const workspaceB = storyBWorktree(origin.project);
  const sessionA = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspaceA,
    startedAt: Date.now(),
  });
  const now = new Date().toISOString();
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({ workspace: workspaceA, branch })
      .inClaudeSession(listed(sessionA))
      .launchedAt(now)
      .please(),
    makeMe.aLaunchRecord
      .executing({ identity: otherQueuedIdentity, title: "Story B" })
      .onStoryBranch({ workspace: workspaceB, branch: storyBBranch })
      .launchedAt(now)
      .please(),
  ]);
  const reviewReads = storyReviewReads(page);
  await openBacklog(page, origin);
  await expectSettledPage(page);
  const journey = sidePanelPages(page);
  const attachedA = `attached ${sessionA.slice(0, 8)}`;
  // Story A's session's attachments the synthetic `claude` saw so far.
  const attachesOfA = () =>
    dashboard
      .claudeAttaches()
      .filter((attached) => attached.id === sessionA.slice(0, 8));
  const keptA = await keptSession(dashboard, sessionA);
  expect(keptA.doneAt).toBeUndefined();

  await journey.phase(
    "Story A's terminal opens on its session and selects Story A",
    (pages) => {
      const { board, terminal } = pages;
      board
        .storyCard("Story A")
        .openTerminal()
        .expectText(attachedA)
        .sidePanel.expectItems(1);
      terminal.typeLine("keep this line").expectText("echo keep this line");
      board.storyCard("Story A").expectShownInTerminal().expectSelected();
      board.storyCard("Story B").expectNotSelected();
      intentReads(pages, queuedIdentity);
    },
  );
  const splitPanel = await journey.shownRoom();
  await journey.phase("the terminal maximizes", ({ sidePanel }) =>
    sidePanel.maximize(),
  );
  const maximizedRoom = await journey.shownRoom();
  await journey.phase("the terminal restores to the split", ({ sidePanel }) =>
    sidePanel.restore().expectInSplit(),
  );

  await journey.phase(
    "a story's review replaces the terminal, which detaches without ending or marking the session done",
    ({ board }) => {
      board
        .storyCard("Story B")
        .reviewChanges()
        .expectStory("Story B")
        .expectIdentity(otherQueuedIdentity)
        .expectChangedFile("1 changed file", "Added story-b.txt")
        .expectKeyboardInBody()
        .sidePanel.expectItems(1)
        .expectNotShowing("Terminal")
        .expectFills(splitPanel);
      // A review is no session: no session entry is marked as shown. Story
      // B's review moves the selection to Story B.
      board.storyCard("Story A").expectNotShownInTerminal();
      board.storyCard("Story B").expectSelected();
      board.storyCard("Story A").expectNotSelected();
    },
  );
  // The detached terminal ended its one attachment; the session stays open
  // and its kept record as it was.
  expect(attachesOfA()).toHaveLength(1);
  await expect
    .poll(() =>
      attachesOfA().every((attached) => attached.endedBy !== undefined),
    )
    .toBe(true);
  expect(await keptSession(dashboard, sessionA)).toEqual(keptA);

  await journey.phase(
    "inspecting another card, or opening the shown review again, leaves its story selected",
    (pages) => {
      const { board } = pages;
      intentReads(pages, otherQueuedIdentity);
      board
        .storyCard("Story A")
        .inspect()
        .expectInspected()
        .hideDetail()
        .expectNotInspected();
      board.storyCard("Story B").expectSelected();
      board.storyCard("Story A").expectNotSelected();
      board.storyCard("Story B").reviewChanges();
      board.storyCard("Story B").expectSelected();
    },
  );

  await journey.phase(
    "the dashboard stays usable beside the review",
    // Not a modal: the keyboard leaves the review for the page's controls.
    ({ sessionsSidebar }) =>
      sessionsSidebar
        .toggle()
        .expectToggleFocused()
        .expectShown()
        .expectEntry("Story A")
        .sidePanel.storyReview.expectStory("Story B")
        .sidePanel.expectItems(1),
  );

  await journey.phase(
    "the review's header shares the terminal's frame icon controls",
    ({ sidePanel, sessionsSidebar }) => {
      sidePanel
        .expectFrameIconControl("Refresh")
        .expectFrameIconControl("Maximize")
        .expectFrameIconControl("Close", "Close (⌘⇧Esc)");
      sessionsSidebar
        .toggle()
        .expectHidden()
        .sidePanel.storyReview.chooseFileByKeyboard(
          "1 changed file",
          "Added story-b.txt",
        )
        .expectFileDiff("Added story-b.txt", "+story b");
    },
  );
  const readsBeforeMaximizing = reviewReads.length;
  await journey.phase(
    "the review maximizes into the terminal's room and restores its content",
    ({ sidePanel }) =>
      sidePanel
        .maximize()
        .expectMaximized()
        .expectFills(maximizedRoom)
        .restore()
        .expectInSplit()
        .expectFills(splitPanel)
        .storyReview.expectFileChosen("1 changed file", "Added story-b.txt"),
  );
  expect(reviewReads.length).toBe(readsBeforeMaximizing);

  await journey.phase(
    "the review maximizes beside the open Sessions sidebar",
    ({ sessionsSidebar }) =>
      sessionsSidebar.toggle().sidePanel.maximize().expectMaximized(),
  );
  const attachedBefore = attachesOfA().length;
  await journey.phase(
    "opening the session from the sidebar beside a maximized review attaches to the same session in the normal split",
    ({ sessionsSidebar }) => {
      sessionsSidebar
        .openEntry("Story A")
        .expectText(attachedA)
        .sidePanel.expectItems(1)
        .expectNotShowing("Story review")
        .expectInSplit();
      sessionsSidebar.expectEntryCurrent("Story A");
    },
  );
  // The same session, attached once more; its kept record as it was.
  expect(attachesOfA()).toHaveLength(attachedBefore + 1);
  expect(await keptSession(dashboard, sessionA)).toEqual(keptA);
  await journey.phase(
    "the sidebar closes on the reattached session, its story selected",
    ({ sessionsSidebar, board }) => {
      sessionsSidebar.toggle().expectHidden();
      board.storyCard("Story A").expectSelected();
      board.storyCard("Story B").expectNotSelected();
    },
  );

  await journey.phase(
    "an empty-area click selects another card and clears it, leaving the terminal and every detail as they are",
    (pages) => {
      const { board, terminal } = pages;
      board.storyCard("Story B").clickEmptyArea().expectSelected();
      board.storyCard("Story A").expectNotSelected();
      terminal.expectText(attachedA);
      intentReads(pages, otherQueuedIdentity);
      board.storyCard("Story B").clickEmptyArea().expectNotSelected();
      board.storyCard("Story A").expectNotSelected();
      terminal.expectShown();
      board.expectNoStoryDetail();
    },
  );
});
