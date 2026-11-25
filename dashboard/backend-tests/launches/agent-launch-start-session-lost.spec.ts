import { isolatedAdmissionFlags } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
// An unattached Start session whose start is lost with its server, before or
// after it made its workspace (../../server/sessionStartStore.ts), with a real
// bare origin (../../test-support/support/startOrigin.ts), the installed start held
// as the case needs (../../test-support/support/keptSessionStart.ts), and the
// synthetic `claude`: Continue on the restarted server runs the installed
// start again for the kept workspace and branch, which makes it or takes it
// as it is, opens the session there, and leaves execution checkout's existing
// changes unasked. A start that outlasts its wait and Continue on the page:
// ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.

import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  dirty,
  status,
} from "../../test-support/support/executionCheckoutChanges.ts";
import {
  holdStarts,
  keptSessionStarts,
} from "../../test-support/support/keptSessionStart.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  isolatedSession,
  recordStarts,
  worktree,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

// Every start here is held past this wait, however long the machine takes.
test.use({ startTimeoutMs: 500 });

for (const when of ["before", "after"] as const) {
  const made = when === "after";
  test(`a start lost with its server ${made ? "after" : "before"} it made its workspace is resumed by Continue in the kept workspace, existing changes in the execution checkout unasked`, async ({
    dashboard,
    origin,
    github,
  }) => {
    const starts = recordStarts(origin);
    const hold = holdStarts(origin, when);
    const before = await originMain(origin);
    const request = makeMe.aLaunchRequest
      .adHoc()
      .withPolicy({ workspace: "isolated", landing: "review" })
      .please();
    expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
      explanation: expect.stringContaining("story admission is unresolved"),
    });
    await expect.poll(hold.reached, { timeout: 30_000 }).toBe(true);
    expect(worktrees(origin.project)).toEqual(made ? ["session"] : []);
    // Crash the server while the worker is still held. Teardown then reaps
    // the worker before it can give the old server a result.
    process.kill(dashboard.pid, "SIGKILL");
    await dashboard.close();
    hold.release();
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
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
      // An isolated recovery is not asked about execution checkout's changes.
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
      const startsForWorkspace = isolatedAdmissionFlags(
        origin.project,
        "session",
      );
      const revision = await originMain(origin);
      expect(revision).not.toBe(before);
      expect(starts().map(({ argv }) => argv)).toEqual([
        expect.arrayContaining(startsForWorkspace),
        expect.arrayContaining(
          made
            ? [...startsForWorkspace, "--candidate-sha", revision]
            : startsForWorkspace,
        ),
      ]);
      expect(worktrees(origin.project)).toEqual(["session"]);
      expect(answer.record?.establishedSession).toEqual(
        isolatedSession(origin.project, "session", "review", revision),
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
