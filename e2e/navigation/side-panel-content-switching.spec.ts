// A published session review replaces the active story terminal. The
// terminal detaches without ending and can reattach to the same session.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectSettledPage } from "../../dashboard/test-support/dashboardPage.ts";
import { publishedPairAdding } from "../../dashboard/test-support/originatingMachine.ts";
import { publishReviewSession } from "../../dashboard/test-support/support/publishedReviewSession.ts";
import {
  type SidePanelPages,
  sidePanelPages,
} from "../../dashboard/test-support/sidePanelPages.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
} from "../../dashboard/test-support/support/startOrigin.ts";
import {
  keptSession,
  listed,
  storyReviewReads,
} from "../../dashboard/test-support/support/sidePanelContents.ts";
import {
  branch,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";

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
  const published = publishReviewSession(
    origin,
    publishedPairAdding(origin, "story-b.txt"),
  );
  const sessionA = dashboard.claudeListsSession({
    name: "Story A",
    cwd: workspaceA,
    startedAt: Date.now(),
  });
  keepLaunchRecords(dashboard, [
    makeMe.aLaunchRecord
      .executing({ identity: queuedIdentity, title: "Story A" })
      .onStoryBranch({ workspace: workspaceA, branch })
      .inClaudeSession(listed(sessionA))
      .please(),
  ]);
  const reviewReads = storyReviewReads(page);
  await page.setViewportSize({ width: 2400, height: 900 });
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
    "a published review replaces the terminal, which detaches without ending the session",
    ({ board }) => {
      board
        .reviewPublishedSession(published)
        .expectStory(`Published session ${published}`)
        .expectSession(published)
        .expectChangedFile("1 changed file", "Added story-b.txt")
        .expectKeyboardInBody()
        .sidePanel.expectItems(1)
        .expectNotShowing("Terminal")
        .expectFills(splitPanel);
      board.storyCard("Story A").expectNotShownInTerminal().expectNotSelected();
      board.storyCard("Story B").expectNotSelected();
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
    "inspecting a card or reopening the published session review leaves the active stories unselected",
    (pages) => {
      const { board } = pages;
      board
        .storyCard("Story A")
        .inspect()
        .expectInspected()
        .hideDetail()
        .expectNotInspected();
      board.storyCard("Story B").expectNotSelected();
      board.storyCard("Story A").expectNotSelected();
      board.reviewPublishedSession(published).expectSession(published);
      board.storyCard("Story B").expectNotSelected();
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
        .sidePanel.storyReview.expectStory(`Published session ${published}`)
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
        .expectFileDiff("Added story-b.txt", "+trunk moved on");
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
        .expectNotShowing("Session review")
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
