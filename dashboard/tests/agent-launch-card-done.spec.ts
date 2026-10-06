// Mark as done on a session its story's card lists, on the committed
// story-stages origin (./launchJourney.ts), through the same page operation as
// the terminal panel's (./agent-terminal-done.spec.ts): on a session Claude
// Code no longer lists, it leaves the card without being stopped and Recently
// done shows it Done. A refused mark keeps the entry on its card and says so
// there. Origin alone still places the story. The page's own dashboard
// server drives the synthetic `claude` (./fixtures/fake-claude); the real one
// is never reached.

import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  expectMembership,
  parts,
  recentlyDoneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("marking a card's session done", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Mark as done on a card's session Claude Code no longer lists takes it off the card and Recently done shows it Done", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const onCard = (workflow: "Execution" | "Refinement") =>
      cardSessionOf(card(readyStory), workflow);
    const inRecent = (workflow: "Execution" | "Refinement") =>
      recent.getByRole("article", {
        name: recentlyDoneSessionName(workflow, readyStory),
      });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    const unavailable = await sessionNamedBy(onCard("Execution"));
    await test.step("an unavailable session leaves its card without being stopped, and Recently done shows it Done", async () => {
      dashboard.claudeSessionBecomes(unavailable, "forgotten");
      await page.reload();
      await settled();
      await expect(sessionStateOf(onCard("Execution"))).toHaveText(
        "Session unavailable",
      );

      await markDoneAnyway(onCard("Execution"));

      await expect(onCard("Execution")).toHaveCount(0);
      const entry = inRecent("Execution");
      await expect(sessionStateOf(entry)).toHaveText("Done");
      await expect(entry).toContainText(
        `Named done-Open Dough · Execution · ${readyStory}`,
      );
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(0);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    });
    await expectMembership(page, queued);
  });

  test("a refused mark keeps the session on its card and says so on its entry", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    await settled();
    await launch(readyStory, "Execution");
    const entry = cardSessionOf(card(readyStory), "Execution");
    await expect(entry).toHaveCount(1);
    // The project folder moves away, so the boundary refuses the mark.
    const folder = path.join(dashboard.home, "git", "open-dough");
    renameSync(folder, `${folder}.moved`);

    await markDoneAnyway(entry);

    await expect(entry.getByRole("status")).toHaveText(
      "The session could not be marked done.",
    );
    await expect(entry).toHaveCount(1);
    await expect(
      entry.getByRole("button", { name: "Mark as done" }),
    ).toBeEnabled();
    expect(dashboard.claudeStopCalls()).toEqual([]);
  });
});
