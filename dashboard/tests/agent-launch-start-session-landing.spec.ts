// The project row's Start session offers what follows the checks of what the
// session later verifies (After checks), with the story dialogs' words and no
// Tracking choice; where it runs (Workspace) is
// ./agent-launch-start-session-isolated.spec.ts's. With a real bare origin
// (./support/startOrigin.ts), the installed start recorded as it runs
// (./support/startSessionLanding.ts), and the synthetic `claude`:
// Automatically land runs the installed one-shot start with no identity in
// the project folder and hands the session its "Established session" block,
// then the reporting context, even with no text; the line beside Start names
// the push Start authorizes. Change confirmation belongs to
// ./agent-launch-start-session-existing-changes.spec.ts; default no-start
// belongs to ./agent-launch-ad-hoc.spec.ts. The launch record keeps the
// policy and what the start established, never the confirmation. Raw requests are
// in ./boundary/agent-launch-start-session-landing-boundary.spec.ts.

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { attempts, keptStarts, recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import { startSession, startSessionDialog } from "./launchStoryCardPage.ts";
import { status } from "./support/defaultCheckoutChanges.ts";
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
import { expectLandingHandoff } from "./support/startSessionLandingCapture.ts";

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

  // The Session group offers After checks from the default, with no
  // Tracking; Workspace stays Default main.
  await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "Tracking" })).toHaveCount(0);
  await expect(radio(dialog, "Workspace", "Default main")).toBeChecked();
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
  expectLandingHandoff(record, sent[0] ?? "", dashboard, origin.project);
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);
  // The session's entry names the default checkout it was established in.
  await expect(parts(page).taken.locator(".session-entry")).toContainText(
    "Workspace ~/git/open-dough (default main)",
  );
  for (const kept of [record, ...(await attempts(dashboard))])
    expect(JSON.stringify(kept)).not.toContain("existingChanges");

  // Nothing was published, taken, assigned, or created at start.
  expect(await originMain(origin)).toBe(before);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(worktrees(origin.project)).toBe(places);
  expect(status(origin.project)).toBe("");
});
