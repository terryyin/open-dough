// Reopening a session marked done from the page, on the committed
// story-columns origin (../../dashboard/test-support/launchJourney.ts): a session already marked done,
// through the boundary, shows Done in the unfinished card's Done history
// with no current-work entry; opening its terminal there reopens it: once
// the terminal attaches, it is back on its card and no longer Done, through
// a reload, until it is marked done again from its card. How the boundary
// reopens it is
// ../../dashboard/backend-tests/sessions/agent-terminal-reopen.spec.ts, and how the page marks a session done is
// ./agent-terminal-done.spec.ts. The page's own dashboard server drives the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { markDone } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  expectTerminalText,
  openTerminalFromEntry,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  doneSessionEntriesOf,
  shownDoneSessionEntriesOf,
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
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("reopening a session marked done from its card's Done history", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("opening its terminal puts it back on its card and no longer Done, through a reload, until it is marked done again", async ({
    page,
    dashboard,
  }) => {
    const { sessionId: session, shortId } = await composeSession(
      dashboard,
      "open-dough",
      { identity: readyIdentity, title: readyStory },
    );
    const { card, settled } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const story = card(readyStory);
    const panel = terminalPanel(page);
    const listed = storyCardSessions(story);
    const doneOnCard = doneSessionEntriesOf(page, readyStory);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await settled();
    const key = `claude:${session}`;
    await expect(listed).toHaveAttribute("data-shows-session", key);
    const doneName = `done-Open Dough · Execution · ${readyStory}`;
    idleBetweenSteps(dashboard, session);
    const marked = await markDone(dashboard, {
      source: "open-dough",
      session,
    });
    expect(marked.status).toBe(200);
    await page.reload();
    await settled();
    await expect(listed).toHaveCount(0);
    const entry = await shownDoneSessionEntriesOf(page, readyStory);
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toHaveAttribute("data-shows-session", key);
    await expect(entry).toContainText(`Named ${doneName}`);
    await expect(entry).not.toContainText("rename failed");
    // With no terminal open, the rename ran through one private attachment
    // that was hung up once the name was listed.
    await expect
      .poll(() => dashboard.claudeAttaches())
      .toEqual([
        expect.objectContaining({
          lines: [`/rename ${doneName}`],
          endedBy: "SIGHUP",
        }),
      ]);

    // Opening its terminal again reopens it, without waiting for the next
    // read of the records.
    await openTerminalFromEntry(entry);
    await expectTerminalText(panel, `attached ${shortId}`);
    await expect(listed).toHaveCount(1);
    await expect(listed).toHaveAttribute("data-shows-session", key);
    await expect(sessionStateOf(listed)).not.toHaveText("Done");
    await expect(doneOnCard).toHaveCount(0);
    await expectMembership(page, queued);

    await page.reload();
    await settled();
    await expect(listed).toHaveCount(1);
    await expect(listed).toHaveAttribute("data-shows-session", key);
    await expect(sessionStateOf(listed)).not.toHaveText("Done");
    await expect(doneOnCard).toHaveCount(0);

    // Reload closed the attachment. With a terminal open again, this mark
    // types the rename into it rather than opening another.
    await openTerminalFromEntry(listed);
    await expectTerminalText(panel, `attached ${shortId}`);
    const opened = dashboard.claudeAttaches().length;
    // Attached, it runs again.
    idleBetweenSteps(dashboard, session);
    await markDoneAnyway(listed);
    await expect(listed).toHaveCount(0);
    const markedAgain = await shownDoneSessionEntriesOf(page, readyStory);
    await expect(sessionStateOf(markedAgain)).toHaveText("Done");
    await expect(markedAgain).toContainText(`Named ${doneName}`);
    await expect(markedAgain).not.toContainText("rename failed");
    expect(dashboard.claudeAttaches()).toHaveLength(opened);
    expect(dashboard.claudeAttaches().at(-1)?.lines).toEqual([
      `/rename ${doneName}`,
    ]);
    await expectMembership(page, queued);
  });
});
