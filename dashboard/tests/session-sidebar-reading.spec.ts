// Before the machine's sessions are first read, the Sessions sidebar says so,
// as Recently done does, instead of claiming none are kept; once read with
// none kept it says so, and with all kept ones marked done it says none is
// open. Before that first read answers, no card offers Start while the lists
// keep reading; once read, a launch lists its session on the card, keyboard
// on its entry, and in the lists. The page's
// own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude).

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessions,
  parts,
  recentlyDoneSessionName,
} from "./dashboardPage.ts";
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
    const { sidebar, button, entries, badge } = sidebarParts(page);
    const { recentlyDone } = parts(page);
    await settled();
    await button.click();
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText("Reading sessions…");
      await expect(place).not.toContainText("No sessions launched");
    }

    answer();
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText(
        "No sessions launched from this dashboard are kept.",
      );
      await expect(place).not.toContainText("Reading sessions…");
    }
    await expect(entries).toHaveCount(0);
    await expect(badge).toHaveCount(0);

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

  test("no Start is offered before the first read while the lists keep reading; once read, a launch's session joins what was read", async ({
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
    const { recentlyDone } = parts(page);
    await settled();
    await button.click();

    const own = cardSessions(card(readyStory));
    await expect(
      card(readyStory).getByRole("button", { name: "Start execution" }),
    ).toBeDisabled();
    for (const place of [sidebar, recentlyDone]) {
      await expect(place).toContainText("Reading sessions…");
    }
    await expect(entries).toHaveCount(0);

    answer();
    await expect(entries).toHaveCount(1);
    await launch(readyStory, "Execution");
    await expect(own).toHaveCount(1);
    await expect(own).toBeFocused();
    await expect(sidebar).not.toContainText("Reading sessions…");
    await expect(recentlyDone).not.toContainText("Reading sessions…");
    await expect(entries).toHaveCount(2);
    await expect(
      recentlyDone.getByRole("article", {
        name: recentlyDoneSessionName("Execution", readyStory),
      }),
    ).toHaveCount(1);
    await expect(own).toHaveCount(1);
  });
});
