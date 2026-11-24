// An unattached Start session whose start outlasts its wait is kept with its
// launch attempt (../../dashboard/server/sessionStartStore.ts), with a real bare origin
// (../../dashboard/test-support/support/startOrigin.ts), the installed start recorded and held as the
// case needs (../../dashboard/test-support/support/keptSessionStart.ts), and the synthetic `claude`: the
// answer beside Start session and Startup recovery name the worktree and
// branch that start goes on in and report unresolved admission; Continue is
// refused while that start still runs, then resumes the same workspace and
// branch, opens the session there with its block, and runs no second start or
// workspace selection. A start lost with its server:
// ../../dashboard/backend-tests/launches/agent-launch-start-session-lost.spec.ts.
// Execution checkout, a refused start, and a conversation whose first input is
// unconfirmed: ../../dashboard/backend-tests/launches/agent-launch-start-session-kept.spec.ts.

import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import { storyCardSessions } from "../../dashboard/test-support/dashboardPage.ts";
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../dashboard/src/launchRecord.ts";
import {
  attempts,
  recordsOf,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { recoveryOf } from "../../dashboard/test-support/responsiveRecovery.ts";
import {
  holdStarts,
  keptSessionStarts,
  stillRunning,
} from "../../dashboard/test-support/support/keptSessionStart.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  openBacklog,
  originMain,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  isolatedSession,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "../../dashboard/test-support/support/startSessionLanding.ts";

const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";
const continueLabel = "Continue session start of Ad hoc session";

// Every start here is held past this wait, however long the machine takes.
test.use({ startTimeoutMs: 500 });

test("an Isolated workspace start that outlasts its wait names its worktree and branch, and Continue resumes it there without a second workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const hold = holdStarts(origin, "after");
  await openBacklog(page, origin, true);
  const before = await originMain(origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("uncertain");
  const [uncertain] = await attempts(dashboard);
  const id = uncertain?.id ?? "";
  expect(uncertain?.publication).toEqual({ kind: "unknown" });

  // Beside Start session and under Startup recovery: the worktree and branch
  // the start goes on in, and that admission is unresolved.
  const kept = `The start was kept and goes on in workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}, where it can be resumed.`;
  await expect(page.locator(".start-session-answer")).toContainText(kept);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Claude Code",
  );
  await expect(recovery).toContainText("Startup needs reconciliation");
  await expect(recovery).toContainText(
    "Whether it published its assignment is not known.",
  );
  await expect(recovery).toContainText(kept);
  await expect(page.getByRole("main")).not.toContainText(
    /creates another workspace/,
  );
  // Kept ahead of the start's answer, with where it goes on.
  expect(keptSessionStarts(origin)).toEqual({
    [id]: expect.objectContaining({
      workspace: worktree(origin.project, slug),
      branch: `claude/${slug}`,
    }),
  });
  expect(keptSessionStarts(origin)[id]).not.toHaveProperty("session");

  // The start still runs: its continuation is refused, the attempt kept.
  await expect.poll(hold.reached, { timeout: 30_000 }).toBe(true);
  const admitted = await admittedStory(origin, text);
  expect(admitted.revision).not.toEqual(before);
  expect(admitted.source).toContain(admitted.identity);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  await recovery.getByRole("button", { name: continueLabel }).click();
  await expect(recovery.locator(".launch-problem")).toContainText(stillRunning);
  expect(await attempts(dashboard)).toEqual([uncertain]);
  expect(starts()).toHaveLength(1);

  // It ends after its wait did, and what it established is kept.
  hold.release();
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    admitted.revision,
  );
  await expect
    .poll(() => keptSessionStarts(origin)[id]?.["session"], {
      timeout: 30_000,
    })
    .toEqual(session);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  // Continue opens the session in that workspace on that branch, with its
  // block, the reporting context, then the text; no start runs again.
  dashboard.claudeScenario("launched");
  await recovery.getByRole("button", { name: continueLabel }).click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("launched");
  await expect(recoveryOf(page)).toHaveCount(0);
  const [record] = (await recordsOf(
    dashboard,
    "open-dough",
  )) as LaunchWithState[];
  if (record === undefined) throw new Error("Missing launch record.");
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({ storyIdentity: admitted.identity });
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  const [block, reporting, ...developer] = (call?.argv.at(-1) ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record.request, dashboard);
  expect(developer).toEqual([`Taken story: ${admitted.identity}`, text]);
  const card = parts(page).taken.getByRole("article", { name: text });
  const entries = storyCardSessions(card);
  await expect(entries).toHaveCount(1);
  await expect(entries).toContainText(
    `Workspace ~/git/open-dough/.worktrees/${slug}`,
  );

  // One start, one worktree, the same attempt, one claim retained through Continue.
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, slug)),
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      id,
      acceptedAt: uncertain?.acceptedAt,
      publication: {
        kind: "published",
        identity: admitted.identity,
        revision: admitted.revision,
      },
    }),
  ]);
  expect(await originMain(origin)).toBe(admitted.revision);
});
