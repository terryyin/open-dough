// The project row's Start session offers where the session runs (Workspace)
// beside After checks, with the story dialogs' words and no Tracking. With a
// real bare origin (./support/startOrigin.ts), the installed start recorded
// as it runs (./support/startSessionLanding.ts), and the synthetic `claude`:
// Isolated workspace has the installed one-shot start, with no identity,
// create one worktree under `.worktrees/` at fetched trunk on the host's
// branch namespace; the session opens there with its "Established session"
// block, the reporting context, then the developer's text; nothing is
// published, taken, or assigned; and the sidebar names the worktree. Existing
// changes in default main are not asked about and stay untouched, and a
// session with no text works in `.worktrees/session`. Raw requests, slug
// numbering, an installation that cannot establish a session, and Codex are
// in ./agent-launch-start-session-isolated-boundary.spec.ts.

import { realpathSync, rmSync } from "node:fs";
import type { LaunchWithState } from "../src/launchRecord.ts";
import { attempts, keptStarts, recordsOf } from "./agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
  startedSession,
} from "./launchStoryCardPage.ts";
import {
  dirty,
  existingChangesHeading as heading,
  status,
} from "./support/defaultCheckoutChanges.ts";
import { parts } from "./dashboardPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  established,
  git,
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "./support/startSessionLanding.ts";

const inNew = "The session runs in a new workspace under .worktrees/";
const carries =
  "Its first message carries the established session: workspace, workspace role, branch, remote, target, landing, and the starting revision on fetched trunk.";
const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";

// The records kept so far, the last being the launch just made.
async function records(dashboard: DashboardServer, count: number) {
  await expect
    .poll(() => recordsOf(dashboard, "open-dough"))
    .toHaveLength(count);
  return (await recordsOf(dashboard, "open-dough")) as LaunchWithState[];
}

const isolated = (landing: "review" | "auto-land") => ({
  workspace: "isolated",
  landing,
});

test("Isolated workspace creates one worktree at fetched trunk on the host's namespace, opens the session there with its block, and publishes nothing", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");

  // The Session group offers Workspace and After checks from the defaults,
  // with the story dialogs' words, and no Tracking.
  await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
  await expect(dialog.getByRole("group", { name: "Tracking" })).toHaveCount(0);
  await expect(
    dialog.getByRole("group", { name: "Workspace" }).getByRole("radio"),
  ).toHaveCount(2);
  await expect(radio(dialog, "Workspace", "Default main")).toBeChecked();
  await expect(radio(dialog, "After checks", "Wait for review")).toBeChecked();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await expect(start).toHaveAccessibleDescription(
    `Isolated workspace · Wait for review ${inNew}; nothing is published.`,
  );
  await expect(dialog).toContainText(
    "Claude Code starts a background session on this machine, in a new workspace of this project, with no story or skill.",
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

  // The installed start ran once, from the project folder, with the project
  // as its integration checkout and no identity or publisher; it created the
  // one worktree, at fetched trunk, on the host's branch.
  expect(starts()).toEqual([
    {
      argv: isolatedStart(origin.project, slug, "review"),
      cwd: realpathSync(origin.project),
    },
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(established(origin.project, slug)).toEqual({
    branch: `claude/${slug}`,
    revision: before,
  });
  const session = isolatedSession(origin.project, slug, "review", before);
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({
    workflow: "ad-hoc",
    instruction: text,
    policy: isolated("review"),
  });
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);

  // The session opened in the worktree; its first message is the block, the
  // reporting context, then the developer's text.
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  const sent = call?.argv.slice(3) ?? [];
  expect(sent).toHaveLength(1);
  const [block, reporting, ...developer] = (sent[0] ?? "").split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record.request, dashboard);
  expect(developer).toEqual([text]);

  // The sidebar and the terminal's saved workspace name the worktree.
  await expect(entry).toContainText(
    `Workspace ~/git/open-dough/.worktrees/${slug}`,
  );
  expect(record.shownWorkspace).toBe(`~/git/open-dough/.worktrees/${slug}`);
  expect(record.workspaceState).toEqual({ kind: "available" });

  // Nothing was published, taken, assigned, or kept as a start, and the
  // default checkout holds no change.
  expect(await originHeads(origin)).toBe(heads);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(
    (await attempts(dashboard)).map(({ publication }) => publication),
  ).toEqual([{ kind: "none" }]);
  expect(git(origin.project, "branch", "--show-current")).toBe("main");
  expect(status(origin.project)).toBe("");

  // The session opened in the page's terminal, whose toolbar names the
  // session and no workspace. Once the worktree is gone, the entry says its
  // saved workspace is missing and the final report names that worktree.
  const terminal = page.getByRole("region", { name: "Terminal" });
  await expect(terminal).toContainText(text);
  await expect(terminal).toContainText("Ad hoc session");
  await expect(terminal).not.toContainText(".worktrees");
  await terminal.getByRole("button", { name: "Close", exact: true }).click();
  rmSync(session.workspace, { recursive: true });
  await page.reload();
  const kept = parts(page).taken.locator(".session-entry");
  await expect(kept).toContainText("saved workspace is missing");
  await kept.getByRole("button", { name: "Read final report" }).click();
  await expect(
    page.getByRole("region", { name: "Final report" }),
  ).toContainText(`Saved workspace ${session.workspace}`);
});

test("with existing changes in default main, Isolated workspace · Automatically land starts at once with no text, in `.worktrees/session`, and leaves the changes untouched", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
  dirty(origin.project);
  const changes = status(origin.project);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await radio(dialog, "After checks", "Automatically land").check();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toHaveAccessibleDescription(
    `Isolated workspace · Automatically land ${inNew}; verified results land on origin without another review. Pressing Start authorizes that push.`,
  );

  // No confirmation: the session does not run in the default checkout.
  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  const [record] = await records(dashboard, 1);
  if (record === undefined) throw new Error("Missing launch record.");

  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, "session", "auto-land"),
  ]);
  expect(established(origin.project, "session")).toEqual({
    branch: "claude/session",
    revision: before,
  });
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    before,
  );
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({ policy: isolated("auto-land") });
  expect(record.request).not.toHaveProperty("instruction");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, "session")));
  const [block, reporting, ...extra] = (call?.argv.at(-1) ?? "").split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expect(extra).toEqual([]);
  expectReportingBlock(reporting, record.request, dashboard);

  // The default checkout's changes are as they were; nothing was published.
  expect(status(origin.project)).toBe(changes);
  expect(status(worktree(origin.project, "session"))).toBe("");
  expect(await originHeads(origin)).toBe(heads);
  expect(await origin.takenProfiles()).toEqual([]);
});
