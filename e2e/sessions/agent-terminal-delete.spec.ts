// Deleting the record of the session the page's one terminal shows
// (../terminals/agent-terminal.spec.ts), on the committed story-columns origin
// (../../dashboard/tests/launchJourney.ts): while the listing cannot be read the session is State
// unknown and still offers Open terminal; deleting its record from its card
// entry closes the panel, as Mark as done does (../../dashboard/tests/sessions/agent-terminal-done.spec.ts),
// leaves no "Shown in terminal" mark, keeps the story selected (ADR 0008),
// detaches the attach, and stops nothing.
// The conversation stays in Claude Code, so it is listed again once the
// listing recovers. The keyboard follows the entry rule of
// ../../dashboard/tests/sessions/agent-launch-story-card-delete.spec.ts. Origin alone still places the story. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { sessionActions } from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  storyCardSessionOf,
  storyCardSessions,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/tests/storyColumnsPage.ts";
import { attachesOf } from "../../dashboard/tests/sessionNavigationJourney.ts";
import { expectSelected } from "../../dashboard/tests/storyCardSelection.ts";

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
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = terminalPanel(page);
    await settled();
    await launch(readyStory, "Execution");
    const entry = storyCardSessionOf(card(readyStory), "Execution");
    const sessionName = await sessionNamedBy(entry);
    const inRecent = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    });

    dashboard.claudeListingFails(true);
    await page.reload();
    await settled();
    await expect(sessionStateOf(entry)).toContainText("State unknown");
    await openTerminalControl(entry, { exact: false }).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    await expect(page.getByText("Shown in terminal")).not.toHaveCount(0);
    await expectSelected(card(readyStory), true);

    await (
      await sessionActions(entry)
    )
      .getByRole("button", { name: "Delete record…" })
      .click();
    await entry
      .getByRole("button", { name: "Delete record", exact: true })
      .click();

    await expect(panel).toHaveCount(0);
    await expect(entry).toHaveCount(0);
    await expect(page.getByText("Shown in terminal")).toHaveCount(0);
    await expectSelected(card(readyStory), true);
    await expect(card(readyStory)).toBeFocused();
    await expect
      .poll(() => attachesOf(dashboard, sessionName).at(-1)?.endedBy)
      .toBeDefined();
    expect(dashboard.claudeStopCalls()).toEqual([]);

    // Claude Code still lists the conversation once its listing recovers.
    dashboard.claudeListingFails(false);
    expect(
      dashboard.claudeListing().map((item) => item["sessionId"]),
    ).toContain(sessionName);
    await page.reload();
    await settled();
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
    await expect(inRecent).toHaveCount(0);
  });
});
