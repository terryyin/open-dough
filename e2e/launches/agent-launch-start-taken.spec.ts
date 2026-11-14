// A claim published without a session offers Start on its Taken card
// (../../dashboard/server/agentLaunches.ts, ../../dashboard/src/StoryCardLaunches.tsx), reached through a
// refused first launch (../../dashboard/tests/keptStartJourney.ts). That Taken card offers Start
// execution with "Started here, no session yet", and no other Taken card
// does. Start there opens the session in the same workspace, never a second
// claim, and the offer goes. The refused launch's answer and kept start at
// the boundary: ../../dashboard/backend-tests/launches/agent-launch-start-taken-refused.spec.ts.

import { readFileSync, realpathSync } from "node:fs";
import { keptLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { machineHome } from "../../dashboard/tests/machineLaunchRecords.ts";
import path from "node:path";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import { expectStartNote } from "../../dashboard/tests/storyCardControls.ts";
import { launchWaitMs } from "../../dashboard/tests/support/launchWait.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import {
  reachKeptStart,
  startAction,
  test,
  workspaceShown,
} from "../../dashboard/tests/keptStartJourney.ts";
import {
  reloadUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/tests/pageRequestNotes.ts";
import { expectSettledPage } from "../../dashboard/tests/dashboardPage.ts";
import { nextAcceptedAttemptId } from "../../dashboard/tests/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/tests/acceptedAttempts.ts";

test("a Taken card offers Start with the words while this machine keeps a start with no session, and Start opens the session in the same workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  const { takenStoryCard, otherTakenCard, workspace } = await reachKeptStart(
    page,
    dashboard,
    origin,
  );
  await expectSettledPage(page);
  await expectStartNote(
    takenStoryCard,
    "Start execution",
    "Started here, no session yet",
  );
  await expect(startAction(takenStoryCard)).toBeVisible();
  await expect(startAction(otherTakenCard)).toHaveCount(0);
  await expect(otherTakenCard).not.toContainText("Started here");

  // Start there opens the session in the same workspace, with no second claim.
  dashboard.claudeScenario("launched");
  await startAction(takenStoryCard).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(dialog).toContainText(
    "This story's Take is already published on origin, so Start publishes no second Take.",
  );
  await expect(dialog).toContainText(`in workspace ${workspaceShown}`);
  await expect(dialog).not.toContainText("Start also publishes");
  const acceptance = nextAcceptedAttemptId(page);
  await dialog.getByRole("button", { name: "Start" }).click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);
  await expect(
    takenStoryCard.getByRole("list", { name: "Sessions" }),
  ).toContainText(`Workspace ${workspaceShown}`, { timeout: launchWaitMs });
  await expect(startAction(takenStoryCard)).toHaveCount(0);
  await expect(takenStoryCard).not.toContainText("Started here");

  const launches = dashboard.claudeLaunchCalls();
  expect(launches).toHaveLength(2);
  expect(launches[1]?.cwd).toBe(realpathSync(workspace));
  expect(launches[1]?.cwd).toBe(launches[0]?.cwd);
  expect(launches[1]?.argv.at(-1)).toContain(`- workspace: ${workspace}`);
  const claims = (await origin.takenProfiles()).filter(
    (each) => each["identity"] === queuedIdentity,
  );
  expect(claims).toHaveLength(1);
  // The record keeps the start; the kept start is removed.
  const [record] = keptLaunchRecords(machineHome(origin.machine));
  if (record && !("session" in record))
    throw new Error("Expected a kept launch");
  expect(record?.start?.workspace).toBe(workspace);
  const starts = JSON.parse(
    readFileSync(
      path.join(
        origin.machine,
        "home/.open-dough/dashboard/execution-starts.json",
      ),
      "utf8",
    ),
  ) as Record<string, Record<string, unknown>>;
  expect(starts["open-dough"]?.[queuedIdentity]).toBeUndefined();

  // Still gone after another reload.
  await reloadUntilRead(page);
  await expectSettledPage(page);
  await expect(takenStoryCard).toBeVisible();
  await expect(startAction(takenStoryCard)).toHaveCount(0);
});
