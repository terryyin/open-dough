import { askToDeleteRecord } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
// Deleting the record of the session the page's one terminal shows
// (../terminals/agent-terminal.spec.ts), on the committed story-columns origin
// (../../dashboard/test-support/launchJourney.ts): while the listing cannot be read the session is State
// unknown and still offers Open terminal; deleting its record from its card
// entry closes the panel, as Mark as done does (./agent-terminal-done.spec.ts),
// leaves no "Shown in terminal" mark, keeps the story selected (ADR 0008),
// detaches the attach, and stops nothing.
// The conversation stays in Claude Code, so it is listed again once the
// listing recovers. The keyboard follows the entry rule of
// ../../dashboard/frontend-tests/sessions/agent-launch-story-card-delete.spec.ts. Origin alone still places the story. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import {
  expectTerminalText,
  openTerminalFromEntry,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  storyCardSessionOf,
  storyCardSessions,
  parts,
  standaloneSessionName,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { attachesOf } from "../../dashboard/test-support/sessionNavigationJourney.ts";
import { expectSelected } from "../../dashboard/test-support/storyCardSelection.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting the record of the session the terminal shows", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("confirming Delete record closes the panel, leaves no Shown in terminal mark, keeps the story selected, detaches without stopping, sends the keyboard to the card, and the session is listed again once the listing recovers", async ({
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
    const panel = terminalPanel(page);
    await settled();
    const entry = storyCardSessionOf(card(readyStory), "Execution");
    const inRecent = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    });
    await openTerminalFromEntry(entry);
    await expectTerminalText(panel, `attached ${shortId}`);

    dashboard.claudeListingFails(true);
    await page.reload();
    await settled();
    await expect(sessionStateOf(entry)).toContainText("State unknown");
    await openTerminalFromEntry(entry);
    await expectTerminalText(panel, `attached ${shortId}`);
    await expect.poll(() => attachesOf(dashboard, sessionId)).toHaveLength(2);
    await expect(page.getByText("Shown in terminal")).not.toHaveCount(0);
    await expectSelected(card(readyStory), true);

    await (await askToDeleteRecord(entry)).confirm.click();

    await expect(panel).toHaveCount(0);
    await expect(entry).toHaveCount(0);
    await expect(page.getByText("Shown in terminal")).toHaveCount(0);
    await expectSelected(card(readyStory), true);
    await expect(card(readyStory)).toBeFocused();
    await expect
      .poll(() => attachesOf(dashboard, sessionId).at(-1)?.endedBy)
      .toBeDefined();
    expect(dashboard.claudeStopCalls()).toEqual([]);

    // Claude Code still lists the conversation once its listing recovers.
    dashboard.claudeListingFails(false);
    expect(
      dashboard.claudeListing().map((item) => item["sessionId"]),
    ).toContain(sessionId);
    await page.reload();
    await settled();
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
    await expect(inRecent).toHaveCount(0);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });
});
