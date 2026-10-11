// Retention removes only the machine evidence of actually pruned attempts,
// after a real installed unattached start finishes; Git workspaces remain.
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { keptAttempts } from "./acceptedAttempts.ts";
import { launch } from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import {
  dropExpiredAttempts,
  landingRetentionClock,
} from "./support/landingRetentionClock.ts";
import { holdStarts, keptSessionStarts } from "./support/keptSessionStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import { originMain } from "./support/sessionDialog.ts";
import {
  git,
  isolatedSession,
  isolatedStart,
  recordStarts,
  worktree,
} from "./support/startSessionLanding.ts";

const request = { source: "open-dough", workflow: "ad-hoc", host: "claude" };
const isolated = { workspace: "isolated", landing: "review" };

test("a completed expired start loses only its pruned attempt's machine evidence, across projects, and keeps its Git workspace", async ({
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  await dashboard.close();
  const clock = landingRetentionClock(origin.machine);
  const receiver = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    extraEnv: { ...clock.env, DOUGH_START_TIMEOUT_MS: "500" },
  });
  const starts = recordStarts(origin);
  const hold = holdStarts(origin, "after");
  try {
    const before = await originMain(origin);
    const answer = await launch(receiver, { ...request, policy: isolated });
    expect(JSON.parse(answer.body)).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
    });
    const [attempt] = keptAttempts(receiver);
    if (attempt === undefined) throw new Error("No real held attempt");
    expect(attempt.settledAt).toBeDefined();
    await expect.poll(hold.reached, { timeout: 30_000 }).toBe(true);
    hold.release();
    const session = isolatedSession(
      origin.project,
      "session",
      "review",
      before,
    );
    await expect
      .poll(() => keptSessionStarts(origin)[attempt.id]?.["session"], {
        timeout: 30_000,
      })
      .toEqual(session);

    // Controls vary retention independently of the actual expired start.
    const currentId = randomUUID();
    const unsettledId = randomUUID();
    const otherExpiredId = randomUUID();
    const current = {
      ...attempt,
      id: currentId,
      settledAt: new Date(Date.now() + 31 * 86_400_000).toISOString(),
    };
    const unsettled = {
      ...attempt,
      id: unsettledId,
      settledAt: undefined,
      outcome: undefined,
    };
    const otherExpired = {
      ...attempt,
      id: otherExpiredId,
      request: { ...attempt.request, source: "other-project" },
    };
    const directory = path.join(receiver.home, ".open-dough/dashboard");
    writeFileSync(
      path.join(directory, "launch-attempts.json"),
      JSON.stringify({
        "open-dough": [attempt, current, unsettled],
        "other-project": [otherExpired],
      }),
    );
    const kept = keptSessionStarts(origin)[attempt.id];
    writeFileSync(
      path.join(directory, "session-starts.json"),
      JSON.stringify({
        "open-dough": {
          [attempt.id]: kept,
          [currentId]: kept,
          [unsettledId]: kept,
        },
        "other-project": {
          [otherExpiredId]: kept,
          // Same key in another project is unrelated evidence.
          [attempt.id]: kept,
        },
      }),
    );
    const gitBefore = git(origin.project, "worktree", "list", "--porcelain");
    const refsBefore = git(
      origin.project,
      "for-each-ref",
      "--format=%(refname) %(objectname)",
    );
    clock.advanceDays(31);
    await dropExpiredAttempts(receiver.home, { ...process.env, ...clock.env });
    expect(keptAttempts(receiver)).toEqual([
      current,
      {
        ...unsettled,
        settledAt: undefined,
        outcome: undefined,
      },
    ]);
    expect(keptSessionStarts(origin)).toEqual({
      [currentId]: kept,
      [unsettledId]: kept,
    });
    expect(keptSessionStarts(origin, "other-project")).toEqual({
      [attempt.id]: kept,
    });
    const attemptDocument = JSON.parse(
      readFileSync(path.join(directory, "launch-attempts.json"), "utf8"),
    ) as Record<string, unknown[]>;
    expect(attemptDocument["other-project"]).toEqual([]);
    expect(git(origin.project, "worktree", "list", "--porcelain")).toBe(
      gitBefore,
    );
    expect(
      git(origin.project, "for-each-ref", "--format=%(refname) %(objectname)"),
    ).toBe(refsBefore);
    expect(
      git(worktree(origin.project, "session"), "branch", "--show-current"),
    ).toBe("claude/session");
    expect(starts().map(({ argv }) => argv)).toEqual([
      isolatedStart(origin.project, "session", "review"),
    ]);
  } finally {
    hold.release();
    await receiver.close();
  }
});
