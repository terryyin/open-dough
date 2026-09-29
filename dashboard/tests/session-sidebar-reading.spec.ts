// Before the machine's sessions are first read, the Sessions sidebar says so,
// as Recent sessions does, instead of claiming none are kept; once read with
// none kept it says so, and with all kept ones marked done it says none is
// open. A session launched from a card before that first read answers shows
// on its card at once, keyboard on its entry, and joins the lists the read
// answers. The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude).

import { expect, test } from "./dashboardTest.ts";
import { cardSessions, parts, recentSessionName } from "./dashboardPage.ts";
import {
  publishStoryStagesJourney,
  readyStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { holdSessionReads } from "./sessionStatePace.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("the Sessions sidebar's reading", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("says it is reading until the machine's sessions are first read, then that none are kept, then none open", async ({
    page,
    dashboard,
  }) => {
    const { answer } = await holdSessionReads(page);
    const { settled } = await openStoryStagesJourney(page, stagesJourney);
    const { sidebar, button, entries } = sidebarParts(page);
    const { recentSessions } = parts(page);
    await settled();
    await button.click();
    for (const place of [sidebar, recentSessions]) {
      await expect(place).toContainText("Reading sessions…");
      await expect(place).not.toContainText("No sessions launched");
    }

    answer();
    for (const place of [sidebar, recentSessions]) {
      await expect(place).toContainText(
        "No sessions launched from this dashboard are kept.",
      );
      await expect(place).not.toContainText("Reading sessions…");
    }
    await expect(entries).toHaveCount(0);
    await expect(button).toHaveText("Sessions");

    // Kept, but all marked done: none is open.
    const { sessionId } = await launched(dashboard, "doughnut");
    await markDone(dashboard, { source: "doughnut", session: sessionId });
    await page.reload();
    // Open as it was left.
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toContainText(
      "No sessions launched from this dashboard are open.",
    );
    await expect(entries).toHaveCount(0);
  });

  test("a launch before the first read shows on its card while the lists keep reading, then joins what the read answers", async ({
    page,
    dashboard,
  }) => {
    // Kept before the page opens, so the first read answers it too.
    await launched(dashboard, "doughnut");
    dashboard.claudeScenario("launched");
    const { answer } = await holdSessionReads(page);
    const { settled, card, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { sidebar, button, entries } = sidebarParts(page);
    const { recentSessions } = parts(page);
    await settled();
    await button.click();

    await launch(readyStory, "Execution");
    const own = cardSessions(card(readyStory));
    await expect(own).toHaveCount(1);
    await expect(own).toBeFocused();
    for (const place of [sidebar, recentSessions]) {
      await expect(place).toContainText("Reading sessions…");
    }
    await expect(entries).toHaveCount(0);

    answer();
    await expect(sidebar).not.toContainText("Reading sessions…");
    await expect(recentSessions).not.toContainText("Reading sessions…");
    await expect(entries).toHaveCount(2);
    await expect(
      recentSessions.getByRole("article", {
        name: recentSessionName("Execution", readyStory),
      }),
    ).toHaveCount(1);
    await expect(own).toHaveCount(1);
  });
});
