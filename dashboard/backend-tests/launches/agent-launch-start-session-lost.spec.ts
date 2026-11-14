// An unattached Start session whose start is lost with its server, before or
// after it made its workspace (../../server/sessionStartStore.ts), with a real
// bare origin (../../tests/support/startOrigin.ts), the installed start held
// as the case needs (../../tests/support/keptSessionStart.ts), and the
// synthetic `claude`: Continue on the restarted server runs the installed
// start again for the kept workspace and branch, which makes it or takes it
// as it is, opens the session there, and leaves default main's existing
// changes unasked. A start that outlasts its wait and Continue on the page:
// ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.

import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
} from "../../tests/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { dirty, status } from "../../tests/support/defaultCheckoutChanges.ts";
import {
  holdStarts,
  keptSessionStarts,
  keptWords,
} from "../../tests/support/keptSessionStart.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { originMain } from "../../tests/support/sessionDialog.ts";
import {
  isolatedSession,
  isolatedStart,
  recordStarts,
  worktree,
  worktrees,
} from "../../tests/support/startSessionLanding.ts";

// Every start here is held past this wait, however long the machine takes.
test.use({ startTimeoutMs: 500 });

for (const when of ["before", "after"] as const) {
  const made = when === "after";
  test(`a start lost with its server ${made ? "after" : "before"} it made its workspace is resumed by Continue in the kept workspace, existing changes in default main unasked`, async ({
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
