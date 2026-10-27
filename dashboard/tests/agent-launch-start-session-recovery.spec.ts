// An unattached Start session whose start outlasts its wait is kept with its
// launch attempt (../server/sessionStartStore.ts), with a real bare origin
// (./support/startOrigin.ts), the installed start recorded and held as the
// case needs (./support/keptSessionStart.ts), and the synthetic `claude`: the
// answer beside Start session and Startup recovery name the worktree and
// branch that start goes on in and say it publishes nothing; Continue is
// refused while that start still runs, then resumes the same workspace and
// branch, opens the session there with its block, and runs no second start or
// workspace selection. A start lost with its server is resumed by running the
// installed start again for the kept workspace and branch, which makes it or
// takes it as it is. Default main, a refused start, and a conversation whose
// first input is unconfirmed: ./boundary/agent-launch-start-session-kept.spec.ts.

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { dirty, status } from "./support/defaultCheckoutChanges.ts";
import {
  holdStarts,
  keptSessionStarts,
  keptWords,
  stillRunning,
} from "./support/keptSessionStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "./support/startSessionLanding.ts";

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
  test.setTimeout(120_000);
  const starts = recordStarts(origin);
  const hold = holdStarts(origin, "after");
  await openBacklog(page, origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
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
  expect(uncertain?.publication).toEqual({ kind: "none" });

  // Beside Start session and under Startup recovery: the worktree and branch
  // the start goes on in, and that it publishes nothing.
  const kept = keptWords(
    `~/git/open-dough/.worktrees/${slug}`,
    `claude/${slug}`,
  );
  await expect(page.locator(".start-session-answer")).toContainText(kept);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Claude Code",
  );
  await expect(recovery).toContainText("Startup needs reconciliation");
  await expect(recovery).toContainText("It publishes no assignment.");
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
  await recovery.getByRole("button", { name: continueLabel }).click();
  await expect(recovery.locator(".launch-problem")).toContainText(stillRunning);
  expect(await attempts(dashboard)).toEqual([uncertain]);
  expect(starts()).toHaveLength(1);

  // It ends after its wait did, and what it established is kept.
  hold.release();
  const session = isolatedSession(origin.project, slug, "review", before);
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
  const [call, ...others] = dashboard.claudeLaunchCalls();
  expect(others).toEqual([]);
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  const [block, reporting, ...developer] = (call?.argv.at(-1) ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, record.request, dashboard);
  expect(developer).toEqual([text]);
  await expect(parts(page).taken.locator(".session-entry")).toContainText(
    `Workspace ~/git/open-dough/.worktrees/${slug}`,
  );

  // One start, one worktree, the same attempt, nothing kept or published.
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, slug, "review"),
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: uncertain?.acceptedAt }),
  ]);
  expect(await originHeads(origin)).toBe(heads);
});

for (const when of ["before", "after"] as const) {
  const made = when === "after";
  test(`a start lost with its server ${made ? "after" : "before"} it made its workspace is resumed by Continue in the kept workspace, existing changes in default main unasked`, async ({
    dashboard,
    origin,
    github,
  }) => {
    test.setTimeout(120_000);
    const starts = recordStarts(origin);
    const hold = holdStarts(origin, when);
    const before = await originMain(origin);
    const request = {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "claude",
      policy: { workspace: "isolated", landing: "review" },
    };
    expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
      explanation: keptWords(
        "~/git/open-dough/.worktrees/session",
        "claude/session",
      ),
    });
    await expect.poll(hold.reached, { timeout: 30_000 }).toBe(true);
    expect(worktrees(origin.project)).toEqual(made ? ["session"] : []);
    // The server ends and the held start dies with it, unanswered.
    const closing = dashboard.close();
    execFileSync("pkill", ["-f", origin.machine]);
    hold.release();
    await closing;
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 60_000,
      port: Number(new URL(dashboard.baseURL).port),
    });
    try {
      const [lost] = await attempts(restarted);
      const id = lost?.id ?? "";
      expect(lost).toMatchObject({ owned: false });
      expect(keptSessionStarts(origin)[id]).not.toHaveProperty("session");
      // An isolated recovery is not asked about default main's changes.
      dirty(origin.project);
      const changes = status(origin.project);

      restarted.claudeScenario("launched");
      const answer = JSON.parse((await continued(restarted, id)).body) as {
        kind: string;
        record?: LaunchWithState;
      };
      expect(answer.kind, JSON.stringify(answer)).toBe("launched");
      // The installed start ran again for the same workspace and branch, and
      // made it or took it as it was, handed an existing one as Git names it.
      const start = isolatedStart(origin.project, "session", "review");
      const kept = worktree(origin.project, "session");
      expect(starts().map(({ argv }) => argv)).toEqual([
        start,
        start.map((arg) => (made && arg === kept ? realpathSync(kept) : arg)),
      ]);
      expect(worktrees(origin.project)).toEqual(["session"]);
      expect(answer.record?.establishedSession).toEqual(
        isolatedSession(origin.project, "session", "review", before),
      );
      const [call, ...others] = restarted.claudeLaunchCalls();
      expect(others).toEqual([]);
      expect(call?.cwd).toBe(realpathSync(worktree(origin.project, "session")));
      expect(keptSessionStarts(origin)).toEqual({});
      expect(status(origin.project)).toBe(changes);
    } finally {
      await restarted.close();
    }
  });
}
