// Sessions sidebar attention order: oldest needing the developer first, then
// other open sessions newest first. Real boundaries, fake Claude, paused time.
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import {
  publishStoryColumnsJourney,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { launched } from "../agentTerminalBoundary.ts";
import { watchRecordReads } from "../sessionStatePace.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("the Sessions sidebar's attention order", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("leads with the sessions that need the developer, earliest launch first, then the others newest first", async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    const { passOnePace } = await watchRecordReads(page);
    // Launched in this order, so this is their launch order, earliest first.
    const story = (letter: string) => ({
      identity: `SEED-900#story-${letter}`,
      title: `Story ${letter}`,
    });
    const working08 = story("A");
    const blocked09 = story("B");
    const failed10 = story("C");
    const working11 = story("D");
    const working12 = story("E");
    let toBlock = "";
    for (const work of [working08, blocked09, failed10, working11, working12]) {
      const { sessionId } = await launched(dashboard, "doughnut", work);
      if (work === blocked09)
        dashboard.claudeSessionBecomes(sessionId, "blocked");
      if (work === failed10)
        dashboard.claudeSessionBecomes(sessionId, "failed");
      if (work === working11) toBlock = sessionId;
    }
    const { settled } = await openStoryColumnsJourney(page, columnsJourney);
    const { button, entries, titles, badge } = sessionsSidebarParts(page);
    await settled();
    await button.click();

    await test.step("a needs-input and a failed session lead, earliest first, then the working ones newest first", async () => {
      await expect(titles).toHaveText([
        blocked09.title,
        failed10.title,
        working12.title,
        working11.title,
        working08.title,
      ]);
      await expect(badge).toHaveText("2");
    });

    await test.step("a working session that needs input joins the attention group at its launch place, and the count rises", async () => {
      dashboard.claudeSessionBecomes(toBlock, "blocked");
      await passOnePace();
      await expect(badge).toHaveText("3");
      await expect(titles).toHaveText([
        blocked09.title,
        failed10.title,
        working11.title,
        working12.title,
        working08.title,
      ]);
      await expectSessionsSidebarSessionEntryShown(
        entries.nth(2),
        "Needs input",
        "needs-input",
      );
    });
  });
});
