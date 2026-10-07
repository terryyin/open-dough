// A claim published without a session offers Start on its Taken card
// (../server/agentLaunches.ts, ../src/CardLaunches.tsx), reached through a
// refused first launch (./keptStartJourney.ts). That Taken card offers Start
// execution with "Started here, no session yet", and no other Taken card
// does. Start there opens the session in the same workspace, never a second
// claim, and the offer goes.

import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { keptStarts, launch, launchRequest } from "./agentLaunchBoundary.ts";
import { expect } from "./dashboardTest.ts";
import { expectStartNote } from "./cardControls.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  reachKeptStart,
  startAction,
  test,
  workspaceShown,
} from "./keptStartJourney.ts";

test("a Taken card offers Start with the words while this machine keeps a start with no session, and Start opens the session in the same workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  const { takenCard, otherTakenCard, workspace } = await reachKeptStart(
    page,
    dashboard,
    origin,
  );
  await expectStartNote(
    takenCard,
    "Start execution",
    "Started here, no session yet",
  );
  await expect(startAction(takenCard)).toBeVisible();
  await expect(startAction(otherTakenCard)).toHaveCount(0);
  await expect(otherTakenCard).not.toContainText("Started here");

  // Start there opens the session in the same workspace, with no second claim.
  dashboard.claudeScenario("launched");
  await startAction(takenCard).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(dialog).toContainText(
    "This story's Take is already published on origin, so Start publishes no second Take.",
  );
  await expect(dialog).toContainText(`in workspace ${workspaceShown}`);
  await expect(dialog).not.toContainText("Start also publishes");
  await dialog.getByRole("button", { name: "Start" }).click();
  await expect(takenCard.getByRole("list", { name: "Sessions" })).toContainText(
    `Workspace ${workspaceShown}`,
    { timeout: launchWaitMs },
  );
  await expect(startAction(takenCard)).toHaveCount(0);
  await expect(takenCard).not.toContainText("Started here");

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
  const kept = JSON.parse(
    readFileSync(
      path.join(
        origin.machine,
        "home/.open-dough/dashboard/agent-launches.json",
      ),
      "utf8",
    ),
  ) as Record<string, { start?: { workspace: string } }[]>;
  expect(kept["open-dough"]?.[0]?.start?.workspace).toBe(workspace);
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
  await page.reload();
  await expect(takenCard).toBeVisible();
  await expect(startAction(takenCard)).toHaveCount(0);
});

test("a refused session launch after a published claim answers the Agent and workspace, the machine names the kept start until a session starts", async ({
  dashboard,
  origin,
}) => {
  const request = {
    ...launchRequest,
    identity: queuedIdentity,
    title: "Story A",
  };
  expect(await keptStarts(dashboard)).toEqual([]);
  dashboard.claudeScenario("refused");
  const failed = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
    reason: string;
    explanation: string;
  };
  const agent = String(
    (await origin.takenProfiles()).find(
      (each) => each["identity"] === queuedIdentity,
    )?.["agent"],
  );
  expect(failed).toMatchObject({ kind: "failed", reason: "refused" });
  expect(failed.explanation).toMatch(
    new RegExp(
      `^Claude Code refused to start a session in ${workspaceShown}\\..* Taken by ${agent}; no session started\\. Workspace ${workspaceShown}\\.$`,
    ),
  );
  expect(await keptStarts(dashboard)).toEqual([
    {
      host: "claude",
      workflow: "execution",
      source: "open-dough",
      identity: queuedIdentity,
      workspace: workspaceShown,
      agent,
    },
  ]);

  dashboard.claudeScenario("launched");
  const second = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
  };
  expect(second.kind).toBe("launched");
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toHaveLength(1);
});
