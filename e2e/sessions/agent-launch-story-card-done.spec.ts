// Mark as done on a session its story's card lists, on the committed
// story-columns origin (../../dashboard/test-support/launchJourney.ts), through the
// same page operation as the terminal's (./agent-terminal-done.spec.ts): on a
// session Claude Code no longer lists, it leaves the card without being
// stopped or attached, the rename fails as no longer running, and Recently
// done shows it Done, through a reload. Origin alone still places the story.
// A refused mark on its card is
// ../../dashboard/frontend-tests/sessions/agent-launch-story-card-done.spec.ts.
// The page's own dashboard server drives the synthetic `claude`; the real one
// is never reached.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { openStoryColumnsJourney } from "../../dashboard/test-support/storyColumnsPage.ts";
import { markDoneAnyway } from "../../dashboard/test-support/support/markDone.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { sessionAction } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("marking a card's session done", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Mark as done on a card's session Claude Code no longer lists takes it off the card and Recently done shows it Done", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const onStoryCard = (workflow: "Execution" | "Refinement") =>
      storyCardSessionOf(card(readyStory), workflow);
    const inRecent = (workflow: "Execution" | "Refinement") =>
      recent.getByRole("article", {
        name: standaloneSessionName(workflow, readyStory),
      });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    const unavailable = await sessionNamedBy(onStoryCard("Execution"));
    await expect(inRecent("Execution")).toHaveCount(0);
    await test.step("an unavailable session leaves its card without being stopped, and Recently done shows it Done", async () => {
      dashboard.claudeSessionBecomes(unavailable, "forgotten");
      await page.reload();
      await settled();
      await expect(sessionStateOf(onStoryCard("Execution"))).toHaveText(
        "Session unavailable",
      );

      await markDoneAnyway(onStoryCard("Execution"));

      await expect(onStoryCard("Execution")).toHaveCount(0);
      const entry = inRecent("Execution");
      await expect(entry).toContainText(`Session ${unavailable}`);
      await expect(sessionStateOf(entry)).toHaveText("Done");
      await expect(entry).toContainText(
        `Intended name done-Open Dough · Execution · ${readyStory}`,
      );
      await expect(entry).toContainText(
        "Claude Code rename failed: The session is no longer running, so it was not renamed.",
      );
      await expect(await sessionAction(entry, "Mark as done")).toBeEnabled();
      await expect(openTerminalControl(entry)).toHaveCount(0);
      expect(dashboard.claudeAttaches()).toEqual([]);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    });
    await expectMembership(page, queued);
    await page.reload();
    await settled();
    await expectMembership(page, queued);
    await expect(onStoryCard("Execution")).toHaveCount(0);
    await expect(inRecent("Execution")).toContainText(`Session ${unavailable}`);
  });
});
