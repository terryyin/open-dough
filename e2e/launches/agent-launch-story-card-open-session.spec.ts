import { askToDeleteRecord } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
// Open-session cards disable both Starts and explain why. Mark as done and
// Cursor Delete record return them without reload; another card stays usable.
// Taken kept starts and already-open launch dialogs enforce the same refusal.
// Uses the committed columns origin and synthetic Claude, without a real host.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";
import {
  queuedRepositoryWithRoughStory,
  roughStoryC,
  storyA,
  storyB,
  takeRevision,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { integrationDeveloper } from "../../Distribution/tests/support/repository-fixture.mjs";
import {
  storyCardSessionOf,
  storyCardSessions,
  expectMembership,
  expectSettledPage,
  parts,
  sessionNamedBy,
} from "../../dashboard/test-support/dashboardPage.ts";
import { sessionOpenExplanation } from "../../dashboard/src/launchOutcome.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectStartsBlocked,
  describedBy,
} from "../../dashboard/test-support/storyCardSessionListing.ts";
import {
  installedStoryBoard,
  openInstalledStoryBoard,
} from "../../dashboard/test-support/installedStoryCardPage.ts";
import {
  expectStartNote,
  launchGroup,
} from "../../dashboard/test-support/storyCardControls.ts";
import { identityB } from "../../Distribution/tests/skills/dough-execute-plan/workspace-publication-fixtures.mjs";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";

// What every blocked Start says while its card has an open session.
const openSessionNote =
  "This story has an open session. Mark it done or delete its record to start another.";

test.use({
  projectFolders: ["open-dough"],
  extraEnv: briefDoneRenameWait,
  originRepository: queuedRepositoryWithRoughStory(roughStoryC).please(),
});

test.describe("a story's card while its session is open", () => {
  test("disables both Starts until Mark as done or Delete record, keeps another story's Starts, blocks a Taken kept start, and refuses a dialog opened beforehand", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("launched");
    const board = await openInstalledStoryBoard(page, origin);
    const { card, action, settled } = board;
    const { taken } = parts(page);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    const expectOffered = async (title: string) => {
      await expect(action(title, "Execution")).toBeEnabled();
      await expect(action(title, "Refinement")).toBeEnabled();
    };

    await test.step("an open session disables both Starts and leaves another story's Starts", async () => {
      const launch = await board.open(readyStory, "Execution");
      await launch.chooseOneShot();
      await launch.submit();
      await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
      await expectStartsBlocked(action, [readyStory], openSessionNote);
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
      keepLaunchStore(dashboard, {
        "open-dough": [
          makeMe.aLaunchRecord
            .executing({ identity: identityB, title: readyStory })
            .inCursorSession({
              sessionId: cursorSession,
              continuation: {
                workspace: "/tmp",
                args: ["agent", "--resume", cursorSession],
              },
            })
            .please(),
        ],
      });
      await page.reload();
      await settled();
      await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
      await expectStartsBlocked(action, [readyStory], openSessionNote);
      const entry = storyCardSessions(card(readyStory)).first();
      await (await askToDeleteRecord(entry)).confirm.click();
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
      keepLaunchStore(dashboard, {
        "open-dough": [
          makeMe.aLaunchRecord
            .refining({ identity: identityB, title: readyStory })
            .inClaudeSession({
              sessionId: "dddddddd-0000-4000-8000-0000000000d1",
            })
            .please(),
        ],
      });
      await origin.publishRevision(
        takeRevision({
          story: storyB,
          queued: [storyA, roughStoryC],
          agent: "Akiho",
          committer: integrationDeveloper,
        }),
      );
      await page.reload();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory, notRefinedStory],
      });
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
        describedBy(openSessionNote),
      );
      await expectOffered(notRefinedStory);
    });

    await test.step("a Start dialog opened before another page launched answers with the session-open refusal", async () => {
      // Story A is still independently queued after Story B's Take.
      await expect(storyCardSessions(card(takenStory))).toHaveCount(0);
      await expectOffered(takenStory);
      const dialog = await board.open(takenStory, "Execution");
      await expect(dialog.dialog).toBeVisible();

      const other = await page.context().newPage();
      await other.goto("/");
      await expectSettledPage(other);
      const otherBoard = installedStoryBoard(other);
      const competing = await otherBoard.open(takenStory, "Execution");
      await competing.chooseOneShot();
      await competing.submit();
      await expect(storyCardSessions(otherBoard.card(takenStory))).toHaveCount(
        1,
      );
      const launchesBefore = dashboard.claudeLaunchCalls().length;

      await dialog.submit();
      await expect(dialog.dialog).toBeHidden();
      await expect(card(takenStory)).toContainText(
        `Launch failed: ${sessionOpenExplanation}`,
      );
      await expect(action(takenStory, "Execution")).toBeDisabled();
      await expect(action(takenStory, "Execution")).toHaveAccessibleDescription(
        describedBy(openSessionNote),
      );
      expect(dashboard.claudeLaunchCalls()).toHaveLength(launchesBefore);
      await other.close();
    });
  });
});
