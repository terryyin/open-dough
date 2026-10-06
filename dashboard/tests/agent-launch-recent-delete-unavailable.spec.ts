// Delete record… on an entry that reads Session unavailable, on its active
// card or in Recently done after its story completes
// (./agent-launch-recent-delete.spec.ts covers State unknown and keyboard
// movement): confirming deletes from its card and the Sessions sidebar
// without a success announcement; an entry whose state became known since the
// page read it keeps its record and says so. Origin alone still places every
// story. The page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting an unavailable session's record from its current home", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a Session unavailable entry offers Delete record…, deletes from its active card and the sidebar, and a completed story's entry keeps the record when its state became known", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, show, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const sidebar = sidebarParts(page);
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const gone = await sessionNamedBy(
      cardSessionOf(card(readyStory), "Execution"),
    );
    const becameKnown = await sessionNamedBy(
      cardSessionOf(card(notRefinedStory), "Refinement"),
    );
    dashboard.claudeSessionBecomes(gone, "forgotten");
    dashboard.claudeSessionBecomes(becameKnown, "forgotten");
    // The completed story has no active card, so its open session retains
    // its local Taken home while the other session follows Taken.
    await show(stagesJourney.completed);
    await sidebar.button.click();
    const unavailable = cardSessionOf(
      parts(page).taken.getByRole("article", { name: readyStory, exact: true }),
      "Execution",
    );
    const becomesKnown = page
      .locator(".dashboard-columns")
      .getByRole("article", {
        name: standaloneSessionName("Refinement", notRefinedStory),
      });
    const recordFile = path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    );
    const stored = () => readFileSync(recordFile, "utf8");

    for (const entry of [unavailable, becomesKnown]) {
      await expect(sessionStateOf(entry)).toHaveText("Session unavailable");
      await expect(
        entry.getByRole("button", { name: "Delete record…" }),
      ).toBeVisible();
    }
    await expect(sidebar.entries).toHaveCount(2);
    await expect(
      sidebar.sidebar.getByRole("button", { name: /Delete record/ }),
    ).toHaveCount(0);

    await test.step("a session whose state became known since the page read it keeps its record and says so", async () => {
      // Marked done elsewhere, it no longer reads Session unavailable.
      await markDone(dashboard, { source: "open-dough", session: becameKnown });
      await showColumn(page, "Taken");
      await becomesKnown
        .getByRole("button", { name: "Delete record…" })
        .click();
      await becomesKnown
        .getByRole("button", { name: "Delete record", exact: true })
        .click();

      await expect(recent.locator(".session-entry")).toHaveCount(1);
      expect(stored()).toContain(becameKnown);
      // Read again, it is Done: it offers no delete and leaves the sidebar.
      await expect(sessionStateOf(becomesKnown)).toHaveText("Done");
      await expect(
        becomesKnown.getByRole("button", { name: /^Delete record/ }),
      ).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(1);
    });

    await test.step("an unavailable active session's record is deleted from its card and the sidebar", async () => {
      await showColumn(page, "Taken");
      await unavailable.getByRole("button", { name: "Delete record…" }).click();
      await unavailable
        .getByRole("button", { name: "Delete record", exact: true })
        .click();

      await expect(unavailable).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(recent.locator(".session-entry")).toHaveCount(1);
      expect(stored()).not.toContain(gone);
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    });
  });
});
