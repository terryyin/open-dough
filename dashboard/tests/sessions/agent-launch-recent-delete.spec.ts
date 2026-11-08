import { sessionAction } from "../support/sessionEntryDisclosure.ts";
import { launchStoreFile } from "../support/launchStore.ts";
// Recently done records on the committed story-columns origin (../launchJourney.ts):
// State unknown entries offer Delete record…; deletion removes only that record
// from Recently done and the sidebar, stops nothing, and moves focus within its
// list, then to its done card or the section. The sidebar offers no deletion, nor
// do Working/Done entries. Origin owns placement; the dashboard drives fake-claude.
// The question, Keep, Escape and their focus: ./agent-launch-story-card-delete.spec.ts.
// Session unavailable: ./agent-launch-recent-delete-unavailable.spec.ts.

import { readFileSync } from "node:fs";
import { expect, test } from "../dashboardTest.ts";
import {
  identityA,
  identityB,
} from "../../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { launch, markDone } from "../agentLaunchBoundary.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionStateOf,
} from "../dashboardPage.ts";
import { showColumn } from "../boardPage.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { idleBetweenSteps } from "../support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("deleting a Recently done entry's record", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
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
    const { card, settled, show } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const sidebar = sessionsSidebarParts(page);
    await expectMembership(page, {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    });
    await settled();
    // The four sessions and two done marks are setup, started and marked
    // through the launch boundary; each launch answers once it settled.
    const started = async (
      story: string,
      identity: string,
      workflow: "execution" | "refinement",
    ) => {
      const answer = await launch(dashboard, {
        source: "open-dough",
        identity,
        title: story,
        workflow,
        host: "claude",
      });
      const { record } = JSON.parse(answer.body) as {
        record?: { session: { sessionId: string } };
      };
      if (record === undefined) throw new Error(`Not launched: ${answer.body}`);
      return record.session.sessionId;
    };
    const markedDoneOf = async (session: string) => {
      // Idle between steps, the mark takes the native rename at once.
      idleBetweenSteps(dashboard, session);
      const answer = await markDone(dashboard, {
        source: "open-dough",
        host: "claude",
        session,
      });
      expect(answer.status, answer.body).toBe(200);
    };
    const done = await started(readyStory, identityB, "execution");
    await markedDoneOf(done);
    const inDoneStory = await started(
      notRefinedStory,
      notRefinedIdentity,
      "refinement",
    );
    await markedDoneOf(inDoneStory);
    const refinement = await started(readyStory, identityB, "refinement");
    const storyA = await started(takenStory, identityA, "execution");
    const recordFile = launchStoreFile(dashboard.home);
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
    const deleteButton = async (entry: typeof working) =>
      await sessionAction(entry, "Delete record…");
    const confirm = (entry: typeof working) =>
      entry.getByRole("button", { name: "Delete record", exact: true });
    const deleteEntry = async (entry: typeof working) => {
      await (await deleteButton(entry)).click();
      await confirm(entry).click();
      await expect(entry).toHaveCount(0);
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
        await expect(await deleteButton(entry)).toBeVisible();
      }
      for (let index = 0; index < 2; index++) {
        const entry = sidebar.entries.nth(index);
        await expect(entry.getByRole("button")).toHaveCount(1);
        await expect(
          entry.getByRole("button", { name: /Delete record/ }),
        ).toHaveCount(0);
      }
    });

    await test.step("deleting the last session inside a done story's card removes it from Recently done and the sidebar, and puts the keyboard on the card, which stays", async () => {
      await showColumn(page, "Recently done");
      await deleteEntry(insideDoneCard);

      await expect(sidebar.entries).toHaveCount(2);
      await expect(sidebar.sidebar.getByText(notRefinedStory)).toHaveCount(0);
      await expect(doneCard).toBeFocused();
      await expect(doneCard.locator(".session-entry")).toHaveCount(0);
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
