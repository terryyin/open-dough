import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import { readFinalReport } from "../../dashboard/test-support/finalReportPages.ts";
import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// Independent isolated launches admit a Taken story and open the native
// session in the owned worktree. The bare origin and synthetic host expose
// publication, handoff and working-directory evidence.
import { realpathSync, rmSync } from "node:fs";
import type { LaunchWithState } from "../../dashboard/src/launchRecord.ts";
import {
  attempts,
  recordsOf,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
  startedSession,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  dirty,
  existingChangesHeading as heading,
  status,
} from "../../dashboard/test-support/support/executionCheckoutChanges.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import {
  openBacklog,
  originMain,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  established,
  git,
  isolatedSession,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "../../dashboard/test-support/support/startSessionLanding.ts";
import { startedSessionTerminal } from "../../dashboard/test-support/support/startedSessionTerminal.ts";

const inNew = "The session runs in a new workspace under .worktrees/";
const carries =
  "Its first message carries the established session: workspace, workspace role, branch, remote, target, landing, and the starting revision after admission.";
const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";

// The records kept so far, the last being the launch just made, waited for
// as long as a start may take.
async function records(dashboard: DashboardServer, count: number) {
  await expect
    .poll(() => recordsOf(dashboard, "open-dough"), { timeout: launchWaitMs })
    .toHaveLength(count);
  return (await recordsOf(dashboard, "open-dough")) as LaunchWithState[];
}

test("Isolated workspace creates one worktree at fetched trunk on the host's namespace, publishes a Taken story, then opens the session there with its block", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin, true);
  const before = await originMain(origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");

  // The Session group offers Workspace and After checks from the defaults,
  // with the story dialogs' words, and no Tracking.
  await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "Tracking" })).toHaveCount(0);
  await expect(
    dialog.getByRole("group", { name: "Workspace" }).getByRole("radio"),
  ).toHaveCount(2);
  await expect(radio(dialog, "Workspace", "Execution checkout")).toBeChecked();
  await expect(radio(dialog, "After checks", "Wait for review")).toBeChecked();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await expect(start).toHaveAccessibleDescription(
    `Isolated workspace · Wait for review Start publishes a Taken story before the session opens. ${inNew}; the work waits for review.`,
  );
  await expect(dialog).toContainText(
    "Claude Code starts a background session on this machine, in a new workspace of this project, under its new Taken story.",
  );
  await dialog.locator("summary", { hasText: "Command details" }).click();
  await expect(
    dialog.getByText(`${inNew}. ${carries}`, { exact: true }),
  ).toBeVisible();
  await expect(dialog.locator("code")).toHaveCount(0);

  await startSessionField(dialog).fill(text);
  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  const entry = await startedSession(page);
  const [record] = await records(dashboard, 1);
  if (record === undefined) throw new Error("Missing launch record.");

  const admitted = await admittedStory(origin, text);
  expect(admitted.revision).not.toBe(before);
  expect(starts()).toEqual([
    {
      argv: expect.arrayContaining(
        isolatedAdmissionFlags(origin.project, slug),
      ),
      cwd: realpathSync(origin.project),
    },
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(established(origin.project, slug)).toEqual({
    branch: `claude/${slug}`,
    revision: admitted.revision,
  });
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    admitted.revision,
  );
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({
    workflow: "ad-hoc",
    instruction: text,
    storyIdentity: admitted.identity,
    policy: { workspace: "isolated", landing: "review" },
  });
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);

  // The session opened in the worktree; its first message is the block, the
  // reporting context, then the developer's text.
  const [started, ...others] = dashboard.claudeLaunches();
  expect(others).toEqual([]);
  expect(started?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  const [block, reporting, ...developer] = (started?.instruction ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record.request, dashboard);
  expect(developer).toEqual([`Taken story: ${admitted.identity}`, text]);

  // The sidebar and the terminal's saved workspace name the worktree.
  await expect(entry).toContainText(
    `Workspace ~/git/open-dough/.worktrees/${slug}`,
  );
  expect(record.shownWorkspace).toBe(`~/git/open-dough/.worktrees/${slug}`);
  expect(record.workspaceState).toEqual({ kind: "available" });

  expect(
    (await origin.takenProfiles()).filter(
      ({ identity }) => identity === admitted.identity,
    ),
  ).toHaveLength(1);
  expect(
    (await attempts(dashboard)).map(({ publication }) => publication),
  ).toEqual([
    {
      kind: "published",
      revision: admitted.revision,
      identity: admitted.identity,
    },
  ]);
  expect(git(origin.project, "branch", "--show-current")).toBe("main");
  expect(status(origin.project)).toBe("");

  // The session's terminal has a toolbar that names the session and no
  // workspace. Once the worktree is gone, the entry says its saved workspace
  // is missing and the final report names that worktree.
  const terminal = await startedSessionTerminal(page, entry);
  await expect(terminal).toContainText(text);
  await expect(terminal).toContainText("Ad hoc session");
  await expect(terminal).not.toContainText(".worktrees");
  await closeSidePanel(terminal);
  rmSync(session.workspace, { recursive: true });
  await page.reload();
  const kept = sessionEntriesIn(parts(page).taken);
  await expect(kept).toContainText("saved workspace is missing");
  const { panel } = await readFinalReport(kept);
  await expect(panel).toContainText(`Saved workspace ${session.workspace}`);
});

test("with existing changes in the execution checkout, Isolated workspace · Automatically land starts at once with no text, in `.worktrees/session`, and leaves the changes untouched", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin, true);
  const before = await originMain(origin);
  dirty(origin.project);
  const changes = status(origin.project);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await radio(dialog, "After checks", "Automatically land").check();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toHaveAccessibleDescription(
    `Isolated workspace · Automatically land Start publishes a Taken story before the session opens. ${inNew}; verified results land on origin without another review. Pressing Start authorizes that push.`,
  );

  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  const [record] = await records(dashboard, 1);
  if (record === undefined) throw new Error("Missing launch record.");

  const admitted = await admittedStory(origin, record.request.title);
  expect(record.request.title).toMatch(/^Ad hoc work — /);
  expect(admitted.revision).not.toBe(before);
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session")),
  ]);
  expect(established(origin.project, "session")).toEqual({
    branch: "claude/session",
    revision: admitted.revision,
  });
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    admitted.revision,
  );
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({
    policy: { workspace: "isolated", landing: "auto-land" },
  });
  expect(record.request).not.toHaveProperty("instruction");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, "session")));
  expect(call?.argv.at(-1)).not.toContain("Established session");
  expect(record.request).toMatchObject({ storyIdentity: admitted.identity });

  expect(status(origin.project)).toBe(changes);
  expect(status(worktree(origin.project, "session"))).toBe("");
  expect(await originMain(origin)).toBe(admitted.revision);
});
