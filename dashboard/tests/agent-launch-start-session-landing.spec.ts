// The project row's Start session offers what follows the checks of what the
// session later verifies (After checks), with the story dialogs' words and no
// Tracking or Workspace choice. With a real bare origin
// (./support/startOrigin.ts), the installed start recorded as it runs
// (./support/startSessionLanding.ts), and the synthetic `claude`:
// Automatically land runs the installed one-shot start with no identity in
// the project folder and hands the session its "Established session" block,
// then the reporting context, even with no text; the line beside Start names
// the push Start authorizes; and existing changes in default main are
// confirmed with the landing still selected. Wait for review with no text
// runs nothing and stays a blank launch. The launch record keeps the policy
// and what the start established, never the confirmation. Raw requests are
// in ./agent-launch-start-session-landing-boundary.spec.ts.

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { attempts, keptStarts, recordsOf } from "./agentLaunchBoundary.ts";
import { startSession, startSessionDialog } from "./launchCardPage.ts";
import {
  dirty,
  existingChangesHeading as heading,
  status,
} from "./support/defaultCheckoutChanges.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  defaultMainSession,
  defaultMainStart,
  recordStarts,
  sessionBlock,
} from "./support/startSessionLanding.ts";

const where =
  "The session runs in this project's folder on default main, with its existing changes;";
const autoLand = { workspace: "default-checkout", landing: "auto-land" };

const worktrees = (project: string) =>
  execFileSync("git", ["-C", project, "worktree", "list", "--porcelain"], {
    encoding: "utf8",
  });

// The one session started in the project folder, with what it was sent and
// the record kept.
async function startedSession(dashboard: DashboardServer, project: string) {
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(project));
  expect(call?.argv.slice(0, 2)).toEqual(["--bg", "--name"]);
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  if (record === undefined) throw new Error("Missing launch record.");
  return { sent: call?.argv.slice(3) ?? [], record };
}

test("Automatically land with no text names the push beside Start, runs the installed start in the project folder, and hands the session its landing intent", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  const before = await originMain(origin);
  const places = worktrees(origin.project);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");

  // The Session group offers After checks alone, from the default.
  await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
  for (const absent of ["Tracking", "Workspace"])
    await expect(dialog.getByRole("group", { name: absent })).toHaveCount(0);
  await expect(
    dialog.getByRole("group", { name: "After checks" }).getByRole("radio"),
  ).toHaveCount(2);
  await expect(radio(dialog, "After checks", "Wait for review")).toBeChecked();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toHaveAccessibleDescription(
    `Default main · Wait for review ${where} nothing is published.`,
  );
  await radio(dialog, "After checks", "Automatically land").check();
  await expect(start).toHaveAccessibleDescription(
    `Default main · Automatically land ${where} verified results land on origin without another review. Pressing Start authorizes that push.`,
  );
  await expect(
    dialog.getByText(
      "Its first message carries the established session: workspace, workspace role, branch, remote, target, landing, starting revision, and fetched trunk.",
    ),
  ).toBeAttached();

  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  const { sent, record } = await startedSession(dashboard, origin.project);

  // The installed start ran once, in the project folder, with no identity,
  // publisher, or workspace of its own.
  expect(starts()).toEqual([
    {
      argv: defaultMainStart(origin.project, "auto-land"),
      cwd: realpathSync(origin.project),
    },
  ]);
  // The first message is the block, then the reporting context, and nothing
  // of the developer's.
  const session = defaultMainSession(origin.project, "auto-land", before);
  expect(sent).toHaveLength(1);
  const [block, reporting, ...extra] = (sent[0] ?? "").split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expect(extra).toEqual([]);
  expectReportingBlock(reporting, record.request, dashboard);

  // Local evidence keeps the policy and what the start established.
  expect(record.request).toMatchObject({
    workflow: "ad-hoc",
    policy: autoLand,
  });
  expect(record.request).not.toHaveProperty("instruction");
  expect(record.establishedSession).toEqual(session);
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);
  for (const kept of [record, ...(await attempts(dashboard))])
    expect(JSON.stringify(kept)).not.toContain("existingChanges");

  // Nothing was published, taken, assigned, or created at start.
  expect(await originMain(origin)).toBe(before);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(worktrees(origin.project)).toBe(places);
  expect(status(origin.project)).toBe("");
});

test("Wait for review with no text runs nothing and stays a blank launch", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await expect(radio(dialog, "After checks", "Wait for review")).toBeChecked();
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  const { sent, record } = await startedSession(dashboard, origin.project);
  expect(sent).toEqual([]);
  expect(starts()).toEqual([]);
  for (const absent of ["policy", "instruction", "reporting"])
    expect(record.request).not.toHaveProperty(absent);
  expect(record).not.toHaveProperty("establishedSession");
});

test("existing changes are confirmed with Automatically land still selected, and Continue starts with that landing and the changes untouched", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  const before = await originMain(origin);
  dirty(origin.project);
  const changes = status(origin.project);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  const chosen = radio(dialog, "After checks", "Automatically land");
  await chosen.check();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await start.click();

  // The confirmation names the landing that stays selected; nothing started.
  const warning = dialog.getByRole("heading", { name: heading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText(
    "Automatically land remains selected; verified changes may land without another review.",
  );
  await expect(dialog).not.toContainText("Wait for review remains selected.");
  expect(starts()).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  // Back returns to the choice as made.
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(start).toBeFocused();
  await expect(chosen).toBeChecked();
  await start.click();
  await expect(warning).toBeFocused();

  dashboard.claudeScenario("launched");
  await dialog
    .getByRole("button", { name: "Continue with existing changes" })
    .click();
  await expect(dialog).toBeHidden();
  const { sent, record } = await startedSession(dashboard, origin.project);
  const session = defaultMainSession(origin.project, "auto-land", before);
  expect(sent[0]?.split("\n\n")[0]).toBe(sessionBlock(session));
  expect(starts().map(({ argv }) => argv)).toEqual([
    defaultMainStart(origin.project, "auto-land"),
  ]);
  expect(record.request).toMatchObject({ policy: autoLand });
  expect(record.establishedSession).toEqual(session);
  expect(JSON.stringify(record)).not.toContain("existingChanges");
  expect(status(origin.project)).toBe(changes);
  expect(await originMain(origin)).toBe(before);
});
