// Recently done records on the committed story-columns origin (./launchJourney.ts):
// State unknown entries offer Delete record… with the story-card-entry question;
// deletion removes the entry without success text and moves focus within its list,
// then to its done card or the section. The sidebar offers no deletion, nor do
// Working/Done entries. Origin owns placement; the dashboard drives fake-claude.
// Session unavailable: ./agent-launch-recent-delete-unavailable.spec.ts.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  storyCardSessionOf,
  storyCardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import { showColumn } from "./boardPage.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

test.setTimeout(120_000);

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

test.describe("deleting a Recently done entry's record", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a State unknown entry, inside a done story's card or of its own, offers Delete record…, deletes from Recently done and the sidebar, and moves the keyboard to the neighbouring entry; the sidebar offers none and Working or Done offers none", async ({
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
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const done = await sessionNamedBy(
      storyCardSessionOf(card(readyStory), "Execution"),
    );
    idleBetweenSteps(dashboard, done);
    await markDoneAnyway(storyCardSessionOf(card(readyStory), "Execution"));
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
    await launch(readyStory, "Refinement");
    await launch(takenStory, "Execution");
    // Every launch finishes, its entry naming its session, before the page
    // reloads; reloading sooner would lose a launch still in flight.
    const inDoneStory = await sessionNamedBy(
      storyCardSessionOf(card(notRefinedStory), "Refinement"),
    );
    idleBetweenSteps(dashboard, inDoneStory);
    await markDoneAnyway(
      storyCardSessionOf(card(notRefinedStory), "Refinement"),
    );
    await expect(
      storyCardSessionOf(card(notRefinedStory), "Refinement"),
    ).toHaveCount(0);
    const refinement = await sessionNamedBy(
      storyCardSessionOf(card(readyStory), "Refinement"),
    );
    const storyA = await sessionNamedBy(
      storyCardSessionOf(card(takenStory), "Execution"),
    );
    const recordFile = path.join(
      dashboard.home,
      ".open-dough",
      "dashboard",
      "agent-launches.json",
    );
    const stored = () => readFileSync(recordFile, "utf8");
    const stopsBeforeDeletes = dashboard.claudeStopCalls().length;
    const entryOf = (workflow: "Execution" | "Refinement", title: string) =>
      recent.getByRole("article", {
        name: standaloneSessionName(workflow, title),
      });
    const doneCard = recent.getByRole("article", {
      name: notRefinedStory,
      exact: true,
    });
    const markedDone = entryOf("Execution", readyStory);
    const insideDoneCard = doneCard.getByRole("article", {
      name: standaloneSessionName("Refinement", notRefinedStory),
    });
    const working = storyCardSessionOf(
      parts(page).board.getByRole("article", {
        name: readyStory,
        exact: true,
      }),
      "Refinement",
    );
    const ofStoryA = storyCardSessionOf(
      parts(page).board.getByRole("article", {
        name: takenStory,
        exact: true,
      }),
      "Execution",
    );
    const deleteButton = (entry: typeof working) =>
      entry.getByRole("button", { name: "Delete record…" });
    const confirm = (entry: typeof working) =>
      entry.getByRole("button", { name: "Delete record", exact: true });
    const deleteEntry = async (entry: typeof working) => {
      await deleteButton(entry).click();
      await confirm(entry).click();
      await expect(entry).toHaveCount(0);
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
    };

    await test.step("a session marked done and one whose story is done, inside its done card, are Recently done entries", async () => {
      await page.reload();
      await settled();
      await expect(sessionStateOf(markedDone)).toHaveText("Done");
      await show(columnsJourney.completed);
      await expect(doneCard).toBeVisible();
      await expect(insideDoneCard).toBeVisible();
      await expect(
        page
          .getByRole("region", { name: /^(Backlog|Taken)$/ })
          .getByRole("article", { name: notRefinedStory, exact: true }),
      ).toHaveCount(0);
    });

    await test.step("while the listing is read, active and Recently done entries in Working or Done offer no Delete record…", async () => {
      await expect(sessionStateOf(working)).toHaveText("Working");
      await expect(sessionStateOf(insideDoneCard)).toHaveText("Done");
      await expect(sessionStateOf(markedDone)).toHaveText("Done");
      for (const entry of [working, insideDoneCard, markedDone]) {
        await expect(
          entry.getByRole("button", { name: /^Delete record/ }),
        ).toHaveCount(0);
      }
    });

    await test.step("with the listing unreadable, each says State unknown and offers Delete record… while each Sessions sidebar Session entry stays one control", async () => {
      dashboard.claudeListingFails(true);
      await page.reload();
      await settled();
      await sidebar.button.click();
      // The sidebar lists sessions not marked done.
      await expect(sidebar.entries).toHaveCount(2);
      for (const entry of [ofStoryA, working, insideDoneCard, markedDone]) {
        await expect(sessionStateOf(entry)).toHaveText(
          "State unknown: Claude Code's session list could not be read",
        );
        await expect(deleteButton(entry)).toBeVisible();
      }
      for (let index = 0; index < 2; index++) {
        const entry = sidebar.entries.nth(index);
        await expect(entry.getByRole("button")).toHaveCount(1);
        await expect(
          entry.getByRole("button", { name: /Delete record/ }),
        ).toHaveCount(0);
      }
    });

    await test.step("deleting the last session inside a done story's card asks first, removes it from Recently done and the sidebar, and puts the keyboard on the card, which stays", async () => {
      await showColumn(page, "Recently done");
      await deleteButton(insideDoneCard).click();
      await expect(
        insideDoneCard.getByRole("button", { name: "Keep" }),
      ).toBeFocused();
      expect(stored()).toContain(inDoneStory);

      await confirm(insideDoneCard).click();

      await expect(insideDoneCard).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(2);
      await expect(sidebar.sidebar.getByText(notRefinedStory)).toHaveCount(0);
      await expect(doneCard).toBeFocused();
      await expect(doneCard.locator(".session-entry")).toHaveCount(0);
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(stored()).not.toContain(inDoneStory);
      expect(stored()).toContain(done);
      expect(dashboard.claudeStopCalls()).toHaveLength(stopsBeforeDeletes);
    });

    await test.step("deleting an entry between another and a done story's card puts the keyboard on the next entry, the card", async () => {
      await deleteEntry(markedDone);
      await expect(sidebar.entries).toHaveCount(2);
      await expect(doneCard).toBeFocused();
      expect(stored()).not.toContain(done);
    });

    await test.step("on a revision with no done record, deleting the last session on an active Taken card puts the keyboard on that card", async () => {
      await show(columnsJourney.taken);
      await expect(doneCard).toHaveCount(0);
      await showColumn(page, "Taken");
      await deleteEntry(working);
      await expect(sidebar.entries).toHaveCount(1);
      await expect(
        parts(page).taken.getByRole("article", {
          name: readyStory,
          exact: true,
        }),
      ).toBeFocused();
      expect(stored()).not.toContain(refinement);
    });

    await test.step("deleting the remaining active Backlog session puts the keyboard on its card", async () => {
      await showColumn(page, "Backlog");
      await deleteEntry(ofStoryA);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(card(takenStory)).toBeFocused();
      expect(stored()).not.toContain(storyA);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
    });
  });
});
