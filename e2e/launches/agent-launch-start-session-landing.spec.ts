// The project row's Start session offers what follows the checks of what the
// session later verifies (After checks), with the story dialogs' words and no
// Tracking choice; where it runs (Workspace) is
// ./agent-launch-start-session-isolated.spec.ts's. With a real bare origin
// (../../dashboard/test-support/support/startOrigin.ts), the installed start recorded as it runs
// (../../dashboard/test-support/support/startSessionLanding.ts), and the synthetic `claude`:
// Automatically land retains the execution checkout policy and admits its
// story from a separate claim checkout. The blank terminal leaves first
// input to the developer while the installed publisher can find the story's
// landing context. Raw requests are
// in ../../dashboard/backend-tests/launches/agent-launch-start-session-landing-boundary.spec.ts.

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  attempts,
  keptStarts,
  recordsOf,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { status } from "../../dashboard/test-support/support/executionCheckoutChanges.ts";
import {
  commit,
  git,
} from "../../dashboard/test-support/support/launchLanding.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { terminalPanel } from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  openBacklog,
  originMain,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  executionCheckoutSession,
  recordStarts,
} from "../../dashboard/test-support/support/startSessionLanding.ts";
import {
  land,
  landingHandoff,
} from "../../dashboard/test-support/support/startSessionLandingContext.ts";
import { admittedStory } from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import {
  expectBorrowedStarts,
  launchStoryIdentity,
} from "../../dashboard/test-support/support/unattachedLaunchAssertions.ts";

const where =
  "The session runs in this project's execution checkout, with its existing changes;";
const autoLand = { workspace: "default-checkout", landing: "auto-land" };

const worktrees = (project: string) =>
  execFileSync("git", ["-C", project, "worktree", "list", "--porcelain"], {
    encoding: "utf8",
  });

// The one session started in the execution checkout, with what it was sent and
// the record kept.
async function startedSession(dashboard: DashboardServer, project: string) {
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
    .toHaveLength(1);
  const [started] = dashboard.claudeLaunches();
  expect(started?.cwd).toBe(realpathSync(project));
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  if (record === undefined) throw new Error("Missing launch record.");
  return { sent: started?.instruction, record };
}

test("blank Automatically land Start opens a blank terminal and keeps the publisher's story authority", async ({
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
  // Tracking; Workspace stays Execution checkout.
  await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "Tracking" })).toHaveCount(0);
  await expect(radio(dialog, "Workspace", "Execution checkout")).toBeChecked();
  await expect(
    dialog.getByRole("group", { name: "After checks" }).getByRole("radio"),
  ).toHaveCount(2);
  await expect(radio(dialog, "After checks", "Wait for review")).toBeChecked();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toHaveAccessibleDescription(
    `Execution checkout · Wait for review Start publishes a Taken story before the session opens. ${where} the work waits for review.`,
  );
  await radio(dialog, "After checks", "Automatically land").check();
  await expect(start).toHaveAccessibleDescription(
    `Execution checkout · Automatically land Start publishes a Taken story before the session opens. ${where} verified results land on origin without another review. Pressing Start authorizes that push.`,
  );
  await expect(
    dialog.getByText(
      "If Start sends a first message, it carries the established session: workspace, workspace role, branch, remote, target, landing, starting revision, and fetched trunk.",
    ),
  ).toBeAttached();

  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  const { sent, record } = await startedSession(dashboard, origin.project);

  expectBorrowedStarts(
    starts,
    origin.project,
    "auto-land",
    record,
    dashboard.home,
  );
  const session = executionCheckoutSession(origin.project, "auto-land", before);
  expect(sent).toBeUndefined();
  await expect(terminalPanel(page)).toBeVisible();

  // Local evidence keeps the policy and what the start established.
  expect(record.request).toMatchObject({
    workflow: "ad-hoc",
    policy: autoLand,
  });
  expect(record.request).not.toHaveProperty("instruction");
  expect(record.establishedSession).toEqual(session);
  const { context } = landingHandoff(record);
  expect(context).toMatchObject({
    identity: launchStoryIdentity(record),
    remote: session.remote,
    target: `refs/heads/${session.target}`,
  });
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);
  // The session's entry names the execution checkout it was established in.
  await expect(sessionEntriesIn(parts(page).taken)).toContainText(
    "Workspace ~/git/open-dough (execution checkout)",
  );
  for (const kept of [record, ...(await attempts(dashboard))])
    expect(JSON.stringify(kept)).not.toContain("existingChanges");

  expect(await admittedStory(origin, record.request.title)).toMatchObject({
    identity: launchStoryIdentity(record),
  });
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(worktrees(origin.project)).toContain(places);
  expect(status(origin.project)).toBe("");

  // After the blank startup, make a result on the admitted trunk. The
  // installed publisher discovers the first-landing context on its own.
  const base = await originMain(origin);
  git(origin.project, "fetch", "origin");
  git(origin.project, "merge", "--ff-only", base);
  const revision = commit(origin.project, "blank-start-result.txt");
  const { result, before: beforePush } = land(record, origin, dashboard.home, {
    discover: true,
    previouslyPublishedBase: base,
  });
  const comparison = { identity: launchStoryIdentity(record), base, revision };
  expect(beforePush).toMatchObject({ trunk: base, preparations: [comparison] });
  expect(result.landing.receipt).toMatchObject(comparison);
  expect(await originMain(origin)).toBe(revision);
});
