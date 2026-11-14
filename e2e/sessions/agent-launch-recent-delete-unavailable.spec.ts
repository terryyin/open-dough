import {
  askToDeleteRecord,
  sessionAction,
} from "../../dashboard/tests/support/sessionEntryDisclosure.ts";
import { launchStoreFile } from "../../dashboard/tests/support/launchStore.ts";
// Delete record… on an entry that reads Session unavailable, on its active
// card or in Recently done after its story completes
// (./agent-launch-recent-delete.spec.ts covers State unknown and keyboard
// movement): confirming deletes from its card and the Sessions sidebar
// without a success announcement; an entry whose state became known since the
// page read it keeps its record and says so. Origin alone still places every
// story. The page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { readFileSync } from "node:fs";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  storyCardSessionOf,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { markDone } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { sessionsSidebarParts } from "../../dashboard/tests/sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "../../dashboard/tests/storyColumnsPage.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting an unavailable session's record from its current home", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a Session unavailable entry offers Delete record…, deletes from its active card and the sidebar, and a completed story's entry keeps the record when its state became known", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, show, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const gone = await sessionNamedBy(
      storyCardSessionOf(card(readyStory), "Execution"),
    );
    const becameKnown = await sessionNamedBy(
      storyCardSessionOf(card(notRefinedStory), "Refinement"),
    );
    dashboard.claudeSessionBecomes(gone, "forgotten");
    dashboard.claudeSessionBecomes(becameKnown, "forgotten");
    // The completed story has no active card, so its open session retains
    // its local Taken home while the other session follows Taken.
    await show(columnsJourney.completed);
    await sidebar.button.click();
    const unavailable = storyCardSessionOf(
      parts(page).taken.getByRole("article", { name: readyStory, exact: true }),
      "Execution",
    );
    const becomesKnown = page.locator(".board").getByRole("article", {
      name: standaloneSessionName("Refinement", notRefinedStory),
    });
    const recordFile = launchStoreFile(dashboard.home);
    const stored = () => readFileSync(recordFile, "utf8");

    for (const entry of [unavailable, becomesKnown]) {
      await expect(sessionStateOf(entry)).toHaveText("Session unavailable");
      await expect(await sessionAction(entry, "Delete record…")).toBeVisible();
    }
    await expect(sidebar.entries).toHaveCount(2);
    await expect(
      sidebar.sidebar.getByRole("button", { name: /Delete record/ }),
    ).toHaveCount(0);

    await test.step("a session whose state became known since the page read it keeps its record and says so", async () => {
      // Marked done elsewhere, it no longer reads Session unavailable.
      await markDone(dashboard, { source: "open-dough", session: becameKnown });
      await showColumn(page, "Taken");
      await (await askToDeleteRecord(becomesKnown)).confirm.click();

      await expect(sessionEntriesIn(recent)).toHaveCount(1);
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
      await (await askToDeleteRecord(unavailable)).confirm.click();

      await expect(unavailable).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(sessionEntriesIn(recent)).toHaveCount(1);
      expect(stored()).not.toContain(gone);
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(dashboard.claudeStopCalls()).toEqual([]);
    });
  });
});
