// Delete record… on a Recently done entry, on the committed story-stages
// origin (./launchJourney.ts): a session whose story is done, inside its done
// story's card, one marked done, and others, all State unknown while the
// whole listing cannot be read, each offer "Delete record…" with the same
// question as a card's entry (./agent-launch-card-delete.spec.ts); confirming
// removes the entry from Recently done and the Sessions sidebar without a
// success announcement, and the keyboard goes to the next entry in the same
// list, else the previous, else the done story's card that held it, else the
// Recently done section. Session unavailable is
// ./agent-launch-recent-delete-unavailable.spec.ts. The sidebar's entries in
// State unknown are each one control with no delete, and a Recently done entry
// in Working or Done offers none. Origin alone still places every story. The
// page's own dashboard server drives the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

test.describe("deleting a Recently done entry's record", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a State unknown entry, inside a done story's card or of its own, offers Delete record…, deletes from Recently done and the sidebar, and moves the keyboard to the neighbouring entry; the sidebar offers none and Working or Done offers none", async ({
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
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    const done = await sessionNamedBy(
      cardSessionOf(card(readyStory), "Execution"),
    );
    idleBetweenSteps(dashboard, done);
    await markDoneAnyway(cardSessionOf(card(readyStory), "Execution"));
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    await launch(readyStory, "Refinement");
    await launch(takenStory, "Execution");
    // Every launch finishes, its entry naming its session, before the page
    // reloads; reloading sooner would lose a launch still in flight.
    const inDoneStory = await sessionNamedBy(
      cardSessionOf(card(notRefinedStory), "Refinement"),
    );
    idleBetweenSteps(dashboard, inDoneStory);
    await markDoneAnyway(cardSessionOf(card(notRefinedStory), "Refinement"));
    await expect(
      cardSessionOf(card(notRefinedStory), "Refinement"),
    ).toHaveCount(0);
    const refinement = await sessionNamedBy(
      cardSessionOf(card(readyStory), "Refinement"),
    );
    const storyA = await sessionNamedBy(
      cardSessionOf(card(takenStory), "Execution"),
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
    const working = cardSessionOf(
      parts(page).stages.getByRole("article", {
        name: readyStory,
        exact: true,
      }),
      "Refinement",
    );
    const ofStoryA = cardSessionOf(
      parts(page).stages.getByRole("article", {
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
      await show(stagesJourney.completed);
      await expect(insideDoneCard).toBeVisible();
      await expect(
        page
          .getByRole("region", { name: "Work stages" })
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

    await test.step("with the listing unreadable, each says State unknown and offers Delete record… while each sidebar entry stays one control", async () => {
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
      await show(stagesJourney.taken);
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
