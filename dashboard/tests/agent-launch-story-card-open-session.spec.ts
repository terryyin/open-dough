// While a story's card lists an open session, every Start on that card is
// disabled and described why, on the committed story-columns origin
// (./launchJourney.ts, ./storyColumnsPage.ts): both workflows, a Taken card's
// kept-start Start execution, Mark as done and Cursor Delete record return the
// Starts without a reload, another story's Starts stay, and a dialog opened
// before another page launched answers Start with the session-open refusal
// beside the action. The page's own dashboard server launches the synthetic
// `claude` (./fixtures/fake-claude); the real one is never reached.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import {
  storyCardSessionOf,
  storyCardSessions,
  expectMembership,
  expectSettledPage,
  parts,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { openSessionStartReason } from "../src/agentLaunch.ts";
import { sessionOpenExplanation } from "../src/launchOutcome.ts";
import { openStoryRecord } from "./machineLaunchRecords.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import { expectStartNote, launchGroup } from "./storyCardControls.ts";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

const openSessionDescription = new RegExp(
  openSessionStartReason.replace(/[.]/g, "\\."),
);

test.describe("a story's card while its session is open", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("disables both Starts until Mark as done or Delete record, keeps another story's Starts, blocks a Taken kept start, and refuses a dialog opened beforehand", async ({
    page,
    dashboard,
  }) => {
    test.setTimeout(120_000);
    dashboard.claudeScenario("launched");
    const { card, action, settled, show, launch } =
      await openStoryColumnsJourney(page, columnsJourney);
    const { taken } = parts(page);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    const expectBlocked = async (title: string) => {
      await expect(action(title, "Execution")).toBeDisabled();
      await expect(action(title, "Refinement")).toBeDisabled();
      await expect(action(title, "Execution")).toHaveAccessibleDescription(
        openSessionDescription,
      );
      await expect(action(title, "Refinement")).toHaveAccessibleDescription(
        openSessionDescription,
      );
    };
    const expectOffered = async (title: string) => {
      await expect(action(title, "Execution")).toBeEnabled();
      await expect(action(title, "Refinement")).toBeEnabled();
    };

    await test.step("an open session disables both Starts and leaves another story's Starts", async () => {
      await launch(readyStory, "Execution");
      await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
      await expectBlocked(readyStory);
      await expectOffered(notRefinedStory);
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    });

    await test.step("Mark as done returns both Starts without a reload", async () => {
      const open = storyCardSessionOf(card(readyStory), "Execution");
      idleBetweenSteps(dashboard, await sessionNamedBy(open));
      await markDoneAnyway(open);
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expectOffered(readyStory);
      await expect(action(readyStory, "Execution")).toHaveAccessibleDescription(
        "",
      );
    });

    await test.step("Delete record on a Cursor session returns both Starts without a reload", async () => {
      const cursorSession = "cccccccc-0000-4000-8000-0000000000c1";
      const storeDir = path.join(dashboard.home, ".open-dough", "dashboard");
      mkdirSync(storeDir, { recursive: true });
      writeFileSync(
        path.join(storeDir, "agent-launches.json"),
        JSON.stringify({
          "open-dough": [
            openStoryRecord("cursor", cursorSession, {
              source: "open-dough",
              identity: identityB,
              title: readyStory,
              workflow: "execution",
            }),
          ],
        }),
      );
      await page.reload();
      await settled();
      await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
      await expectBlocked(readyStory);
      const entry = storyCardSessions(card(readyStory)).first();
      await entry.getByRole("button", { name: "Delete record…" }).click();
      await entry
        .getByRole("button", { name: "Delete record", exact: true })
        .click();
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expectOffered(readyStory);
    });

    await test.step("a Taken card's kept-start Start execution is disabled the same way", async () => {
      const storeDir = path.join(dashboard.home, ".open-dough", "dashboard");
      mkdirSync(storeDir, { recursive: true });
      writeFileSync(
        path.join(storeDir, "execution-starts.json"),
        JSON.stringify({
          "open-dough": {
            [identityB]: {
              identity: identityB,
              host: "claude",
              workspace: path.join(
                dashboard.home,
                "git",
                "open-dough",
                ".worktrees",
                "story-b",
              ),
              branch: "claude/story-b",
              startedAt: "2026-10-03T00:00:00.000Z",
            },
          },
        }),
      );
      writeFileSync(
        path.join(storeDir, "agent-launches.json"),
        JSON.stringify({
          "open-dough": [
            openStoryRecord("claude", "dddddddd-0000-4000-8000-0000000000d1", {
              source: "open-dough",
              identity: identityB,
              title: readyStory,
              workflow: "refinement",
            }),
          ],
        }),
      );
      await show(columnsJourney.taken);
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
      // Machine store writes are picked up on a full reload of the page.
      await page.reload();
      await settled();
      const takenStoryCard = taken.getByRole("article", { name: readyStory });
      const keptStart = launchGroup(takenStoryCard).getByRole("button", {
        name: "Start execution",
      });
      await expect(storyCardSessions(takenStoryCard)).toHaveCount(1);
      await expectStartNote(
        takenStoryCard,
        "Start execution",
        "Started here, no session yet",
      );
      await expect(keptStart).toBeDisabled();
      await expect(keptStart).toHaveAccessibleDescription(
        openSessionDescription,
      );
      await expectOffered(notRefinedStory);
    });

    await test.step("a Start dialog opened before another page launched answers with the session-open refusal", async () => {
      // Clear the Taken kept start and open session so Backlog Starts return.
      const storeDir = path.join(dashboard.home, ".open-dough", "dashboard");
      writeFileSync(
        path.join(storeDir, "execution-starts.json"),
        JSON.stringify({ "open-dough": {} }),
      );
      writeFileSync(
        path.join(storeDir, "agent-launches.json"),
        JSON.stringify({ "open-dough": [] }),
      );
      await show(columnsJourney.queued);
      await expectMembership(page, queued);
      await page.reload();
      await settled();
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expectOffered(readyStory);

      await action(readyStory, "Execution").click();
      const dialog = page.getByRole("dialog", {
        name: "Start execution in Claude Code",
      });
      await expect(dialog).toBeVisible();

      const other = await page.context().newPage();
      await other.goto("/");
      const otherCard = parts(other).backlog.getByRole("article", {
        name: readyStory,
      });
      await expectSettledPage(other);
      await otherCard.getByRole("button", { name: "Start execution" }).click();
      await other
        .getByRole("dialog", { name: "Start execution in Claude Code" })
        .getByRole("button", { name: "Start" })
        .click();
      await expect(storyCardSessions(otherCard)).toHaveCount(1);
      const launchesBefore = dashboard.claudeLaunchCalls().length;

      await dialog.getByRole("button", { name: "Start" }).click();
      await expect(dialog).toBeHidden();
      await expect(card(readyStory)).toContainText(
        `Launch failed: ${sessionOpenExplanation}`,
      );
      await expect(action(readyStory, "Execution")).toBeDisabled();
      await expect(action(readyStory, "Execution")).toHaveAccessibleDescription(
        openSessionDescription,
      );
      expect(dashboard.claudeLaunchCalls()).toHaveLength(launchesBefore);
      await other.close();
    });
  });
});
