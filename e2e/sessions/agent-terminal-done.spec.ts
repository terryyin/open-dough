// Mark as done in the page's one terminal
// (../terminals/agent-terminal.spec.ts), on the committed story-columns origin
// (../../dashboard/test-support/launchJourney.ts): a session not known to be complete
// is asked about first within the panel, with the terminal still showing;
// Keep open or Escape leaves the panel open, attached, and the session
// running, with the keyboard back on Mark as done. While it marks, the panel
// says so quietly; then the panel closes, keeping its story selected (ADR
// 0008), the session leaves current work, and the unfinished card's Done
// history shows the entry Done under its `done-` name, still openable,
// through a reload. How the boundary renames and stops the session is
// ../../dashboard/backend-tests/sessions/agent-launch-done.spec.ts, how the
// page reopens it is ./agent-terminal-done-reopen.spec.ts, a card entry's own
// Mark as done is ./agent-launch-story-card-done.spec.ts, and a refused or
// late mark, pending answers and what the question decides by are
// ../../dashboard/frontend-tests/sessions/agent-terminal-done*.spec.ts. The
// page's own dashboard server drives the synthetic `claude`; the real one is
// never reached.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  expectTerminalText,
  openTerminalControl,
  openTerminalFromEntry,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  shownDoneSessionEntriesOf,
  storyCardSessionName,
  storyCardSessions,
  expectMembership,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  colourOf,
  tokenColour,
} from "../../dashboard/test-support/pageColours.ts";
import { untilDoneMarkAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { expectSelected } from "../../dashboard/test-support/storyCardSelection.ts";
import { holdDoneRequests } from "../../dashboard/test-support/support/holdDoneRequest.ts";
import {
  doneQuestion,
  expectAsked,
  idleBetweenSteps,
  headerMarkAsDone,
  sendDoneMarkAnyway,
  stillWorking,
} from "../../dashboard/test-support/support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("marking a session done from its terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Mark as done closes the panel, the session leaves current work, and the card's Done history shows it Done until its terminal opens again", async ({
    page,
    dashboard,
  }) => {
    const { sessionId, shortId } = await composeSession(
      dashboard,
      "open-dough",
      {
        identity: readyIdentity,
        title: readyStory,
      },
    );
    const { card, settled } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const story = card(readyStory);
    const panel = terminalPanel(page);
    const listed = storyCardSessions(story);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await expect(listed).toHaveAccessibleName(
      storyCardSessionName("Execution"),
    );
    await openTerminalFromEntry(listed);
    await expectTerminalText(panel, `attached ${shortId}`);
    await expectSelected(story, true);
    const doneName = `done-Open Dough · Execution · ${readyStory}`;
    const { rows } = terminalScreenParts(panel);
    for (const answer of ["Keep open", "Escape"] as const) {
      const question = await expectAsked(panel, stillWorking);
      await expect(rows).toBeVisible();
      await expect(rows).toContainText("attached");
      await expect(headerMarkAsDone(panel)).toBeDisabled();
      if (answer === "Escape") await page.keyboard.press("Escape");
      else await question.getByRole("button", { name: answer }).click();
      await expect(doneQuestion(panel)).toHaveCount(0);
      await expect(headerMarkAsDone(panel)).toBeFocused();
      await expect(panel).toBeVisible();
      await expect(panel.getByRole("status")).toBeEmpty();
      await expect(rows).toContainText("attached");
      expect(dashboard.claudeStopCalls()).toEqual([]);
      await expect(listed).toHaveCount(1);
    }
    const release = await holdDoneRequests(page);
    idleBetweenSteps(dashboard, sessionId);

    await sendDoneMarkAnyway(panel);

    const marking = panel.getByRole("status").getByText("Marking as done…");
    await expect(marking).toBeVisible();
    expect(await colourOf(marking)).toBe(await tokenColour(page, "--quiet"));
    release();
    await untilDoneMarkAnswered(page);
    await expect(panel).toHaveCount(0);
    // The panel the mark closed keeps the story selected.
    await expectSelected(story, true);

    await expect(listed).toHaveCount(0);
    const entry = await shownDoneSessionEntriesOf(page, readyStory);
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    // Claude Code keeps the conversation, so the entry still opens it.
    await expect(openTerminalControl(entry)).toBeVisible();
    await expectMembership(page, queued);

    await page.reload();
    await settled();
    const retained = await shownDoneSessionEntriesOf(page, readyStory);
    await expect(sessionStateOf(retained)).toHaveText("Done");
    await expect(retained).toContainText(`Named ${doneName}`);
    await expect(listed).toHaveCount(0);
    await expectMembership(page, queued);
  });
});
