// Delete record… on a Recently done entry, on the committed story-stages
// origin (./launchJourney.ts): a session whose story is in no list and one
// marked done, both State unknown while the whole listing cannot be read, each
// offer "Delete record…" with the same question as a card's entry
// (./agent-launch-card-delete.spec.ts); confirming removes the entry from
// Recently done and the Sessions sidebar without a success announcement,
// and the keyboard goes to the next Recently done entry, else the previous,
// else the Recently done section. Session unavailable is
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
import { sidebarParts } from "./sessionSidebarPage.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting a Recently done entry's record", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a State unknown entry, whose story is in no list or which is marked done, offers Delete record…, deletes from Recently done and the sidebar, and moves the keyboard; the sidebar offers none and Working or Done offers none", async ({
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
    await markDoneAnyway(cardSessionOf(card(readyStory), "Execution"));
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    await launch(readyStory, "Refinement");
    // Every launch finishes, its entry naming its session, before the page
    // reloads; reloading sooner would lose a launch still in flight.
    await sessionNamedBy(cardSessionOf(card(readyStory), "Refinement"));
    const noList = await sessionNamedBy(
      cardSessionOf(card(notRefinedStory), "Refinement"),
    );
    await sessionNamedBy(cardSessionOf(card(readyStory), "Refinement"));
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
        name: recentlyDoneSessionName(workflow, title),
      });
    const markedDone = entryOf("Execution", readyStory);
    const inNoList = entryOf("Refinement", notRefinedStory);
    const working = entryOf("Refinement", readyStory);
    const deleteButton = (entry: typeof working) =>
      entry.getByRole("button", { name: "Delete record…" });
    const confirm = (entry: typeof working) =>
      entry.getByRole("button", { name: "Delete record", exact: true });

    await test.step("a session marked done and one whose story left every list are Recently done entries", async () => {
      await page.reload();
      await settled();
      await expect(sessionStateOf(markedDone)).toHaveText("Done");
      await show(stagesJourney.completed);
      await expect(entryOf("Refinement", notRefinedStory)).toBeVisible();
      await expect(
        page
          .getByRole("region", { name: "Work stages" })
          .getByRole("article", { name: notRefinedStory, exact: true }),
      ).toHaveCount(0);
    });

    await test.step("while the listing is read, a Recently done entry in Working or Done offers no Delete record…", async () => {
      await expect(sessionStateOf(working)).toHaveText("Working");
      await expect(sessionStateOf(inNoList)).toHaveText("Working");
      await expect(sessionStateOf(markedDone)).toHaveText("Done");
      for (const entry of [working, inNoList, markedDone]) {
        await expect(
          entry.getByRole("button", { name: /^Delete record/ }),
        ).toHaveCount(0);
      }
    });

    await test.step("with the listing unreadable, all three say State unknown, and each offers Delete record… while each sidebar entry stays one control", async () => {
      dashboard.claudeListingFails(true);
      await page.reload();
      await settled();
      await sidebar.button.click();
      // The sidebar lists sessions not marked done.
      await expect(sidebar.entries).toHaveCount(2);
      for (const entry of [working, inNoList, markedDone]) {
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

    await test.step("deleting the middle entry asks first, removes it from Recently done and the sidebar, and puts the keyboard on the next Recently done entry", async () => {
      await deleteButton(inNoList).click();
      await expect(
        inNoList.getByRole("button", { name: "Keep" }),
      ).toBeFocused();
      expect(stored()).toContain(noList);

      await confirm(inNoList).click();

      await expect(inNoList).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(1);
      await expect(sidebar.sidebar.getByText(notRefinedStory)).toHaveCount(0);
      await expect(markedDone).toBeFocused();
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(stored()).not.toContain(noList);
      expect(stored()).toContain(done);
      expect(dashboard.claudeStopCalls()).toHaveLength(stopsBeforeDeletes);
    });

    await test.step("deleting the last entry puts the keyboard on the previous one", async () => {
      await deleteButton(markedDone).click();
      await confirm(markedDone).click();

      await expect(markedDone).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(1);
      await expect(working).toBeFocused();
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      expect(stored()).not.toContain(done);
    });

    await test.step("deleting the only entry left puts the keyboard on the Recently done section", async () => {
      await deleteButton(working).click();
      await confirm(working).click();

      await expect(working).toHaveCount(0);
      await expect(sidebar.entries).toHaveCount(0);
      await expect(recent).toBeFocused();
      await expect(
        page.getByText("Session record deleted", { exact: true }),
      ).toHaveCount(0);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
    });
  });
});
