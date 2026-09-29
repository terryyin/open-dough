// Mark as done on a session its story's card lists, on the committed
// story-stages origin (./launchJourney.ts), through the same page operation as
// the terminal panel's (./agent-terminal-done.spec.ts): on a session Claude
// Code no longer lists, it leaves the card without being stopped and Recent
// sessions shows it Done, with the keyboard on that entry, which offers no
// Open terminal; on a session the panel shows, the panel closes too, and the
// keyboard goes to the entry's Open terminal. A refused mark keeps the entry
// on its card and says so there. Origin alone still places the story. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { renameSync } from "node:fs";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionName,
  cardSessions,
  expectMembership,
  parts,
  recentSessionName,
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

  test("Mark as done on a card's session, unavailable or shown in the panel, takes it off the card and Recent sessions shows it Done", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentSessions: recent } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const onCard = (workflow: "Execution" | "Refinement") =>
      cardSessions(card(readyStory)).and(
        page.getByRole("article", {
          name: cardSessionName(workflow),
          exact: true,
        }),
      );
    const inRecent = (workflow: "Execution" | "Refinement") =>
      recent.getByRole("article", {
        name: recentSessionName(workflow, readyStory),
      });
    const markDone = (entry: Locator) =>
      entry.getByRole("button", { name: "Mark as done" }).click();
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    await launch(readyStory, "Refinement");
    const unavailable = await sessionNamedBy(onCard("Execution"));
    const shown = await sessionNamedBy(onCard("Refinement"));
    const stops = () =>
      dashboard.claudeCalls().filter((call) => call.argv[0] === "stop");

    await test.step("an unavailable session leaves its card without being stopped, and the keyboard goes to its Recent sessions entry", async () => {
      dashboard.claudeSessionBecomes(unavailable, "forgotten");
      await page.reload();
      await settled();
      await expect(sessionStateOf(onCard("Execution"))).toHaveText(
        "Session unavailable",
      );

      await markDone(onCard("Execution"));

      await expect(onCard("Execution")).toHaveCount(0);
      const entry = inRecent("Execution");
      await expect(sessionStateOf(entry)).toHaveText("Done");
      await expect(entry).toContainText(
        `Named done-Open Dough · Execution · ${readyStory}`,
      );
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(0);
      await expect(entry).toBeFocused();
      expect(stops()).toEqual([]);
    });

    await test.step("a session the panel shows closes the panel, leaves its card, and the keyboard goes to its Recent sessions entry", async () => {
      await onCard("Refinement")
        .getByRole("button", { name: "Open terminal" })
        .click();
      await expect(panel.locator(".xterm-rows")).toContainText("attached");

      await markDone(onCard("Refinement"));

      await expect(panel).toHaveCount(0);
      await expect(onCard("Refinement")).toHaveCount(0);
      const entry = inRecent("Refinement");
      await expect(sessionStateOf(entry)).toHaveText("Done");
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toBeFocused();
      expect(stops().map((call) => call.argv)).toEqual([
        ["stop", shown.slice(0, 8)],
      ]);
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
    const entry = cardSessions(card(readyStory));
    await expect(entry).toHaveCount(1);
    // The project folder moves away, so the boundary refuses the mark.
    const folder = path.join(dashboard.home, "git", "open-dough");
    renameSync(folder, `${folder}.moved`);

    await entry.getByRole("button", { name: "Mark as done" }).click();

    await expect(entry.getByRole("status")).toHaveText(
      "The session could not be marked done.",
    );
    await expect(entry).toHaveCount(1);
    await expect(
      entry.getByRole("button", { name: "Mark as done" }),
    ).toBeEnabled();
    expect(
      dashboard.claudeCalls().filter((call) => call.argv[0] === "stop"),
    ).toEqual([]);
  });
});
