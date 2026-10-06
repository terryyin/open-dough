// Deleting the record of the session the page's one terminal shows
// (./agent-terminal.spec.ts), on the committed story-stages origin
// (./launchJourney.ts): while the listing cannot be read the session is State
// unknown and still offers Open terminal; deleting its record from its card
// entry closes the panel, as Mark as done does (./agent-terminal-done.spec.ts),
// leaves no "Shown in terminal" mark, detaches the attach, and stops nothing.
// The conversation stays in Claude Code, so it is listed again once the
// listing recovers. The keyboard follows the entry rule of
// ./agent-launch-card-delete.spec.ts. Origin alone still places the story. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessions,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  readyStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { attachesOf } from "./sessionNavigationJourney.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting the record of the session the terminal shows", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("confirming Delete record closes the panel, leaves no Shown in terminal mark, detaches without stopping, sends the keyboard to the card, and the session is listed again once the listing recovers", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    await settled();
    await launch(readyStory, "Execution");
    const entry = cardSessionOf(card(readyStory), "Execution");
    const sessionName = await sessionNamedBy(entry);
    const inRecent = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    });

    dashboard.claudeListingFails(true);
    await page.reload();
    await settled();
    await expect(sessionStateOf(entry)).toContainText("State unknown");
    await entry.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await expect(page.getByText("Shown in terminal")).not.toHaveCount(0);

    await entry.getByRole("button", { name: "Delete record…" }).click();
    await entry
      .getByRole("button", { name: "Delete record", exact: true })
      .click();

    await expect(panel).toHaveCount(0);
    await expect(entry).toHaveCount(0);
    await expect(page.getByText("Shown in terminal")).toHaveCount(0);
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
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    await expect(inRecent).toHaveCount(0);
  });
});
