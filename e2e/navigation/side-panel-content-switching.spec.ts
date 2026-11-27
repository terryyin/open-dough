// Review session changes opens Intent beside the active story terminal,
// which stays attached; the Side panel holds the terminal throughout.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectSettledPage } from "../../dashboard/test-support/dashboardPage.ts";
import { publishedPairAdding } from "../../dashboard/test-support/originatingMachine.ts";
import {
  publishedReviewStory,
  publishReviewSession,
} from "../../dashboard/test-support/support/publishedReviewSession.ts";
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

test("a session's changes open in Intent while the terminal keeps the one side panel beside a usable Board", async ({
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
  await journey.phase("the terminal restores to the split", ({ sidePanel }) =>
    sidePanel.restore().expectInSplit(),
  );

  await journey.phase(
    "Review session changes opens Intent at that session beside the still attached terminal",
    ({ board, terminal, sidePanel }) => {
      board
        .reviewPublishedSession(published)
        .expectSelectedStory(publishedReviewStory.identity)
        .expectSessionChosen("1 changed file");
      terminal.expectText(attachedA);
      sidePanel.expectItems(1).expectFills(splitPanel);
    },
  );
  // The terminal kept its one attachment; its kept record as it was.
  expect(attachesOfA()).toHaveLength(1);
  expect(await keptSession(dashboard, sessionA)).toEqual(keptA);

  await journey.phase(
    "inspecting a card or reopening the session's changes leaves the active stories unselected",
    (pages) => {
      const { board, perspective } = pages;
      perspective.choose("Development");
      board
        .storyCard("Story A")
        .inspect()
        .expectInspected()
        .hideDetail()
        .expectNotInspected();
      board.storyCard("Story B").expectNotSelected();
      board.storyCard("Story A").expectNotSelected();
      board
        .reviewPublishedSession(published)
        .expectSessionChosen("1 changed file");
      perspective.choose("Development");
      board.storyCard("Story B").expectNotSelected();
    },
  );

  await journey.phase(
    "the terminal maximizes and restores beside the open Sessions sidebar",
    ({ sessionsSidebar }) =>
      sessionsSidebar
        .toggle()
        .expectToggleFocused()
        .expectShown()
        .expectEntry("Story A")
        .sidePanel.maximize()
        .expectMaximized()
        .restore()
        .expectInSplit(),
  );
  await journey.phase(
    "opening the session from the sidebar shows the same session in the normal split",
    ({ sessionsSidebar }) => {
      sessionsSidebar
        .openEntry("Story A")
        .expectText(attachedA)
        .sidePanel.expectItems(1)
        .expectInSplit();
      sessionsSidebar.expectEntryCurrent("Story A");
    },
  );
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
