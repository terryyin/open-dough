// Update worktree and retry: apply the release updater to the kept launch
// worktree, then Continue-equivalent resume — or refuse without launching.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  attempts,
  continued,
  launch,
  updateWorktreeRetried,
} from "../agentLaunchBoundary.ts";
import {
  answerOf,
  installHook,
  keptStartOf,
  removeHook,
  request,
  slug,
  workspaceOf,
  type Problem,
} from "../keptExecutionStart.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "../support/startOrigin.ts";
import { settledOutcome } from "../acceptedAttempts.ts";
import {
  plantIncompleteInstall,
  scriptsOf,
} from "../support/incompleteReportingInstall.ts";
import { repoRoot } from "../support/repositoryRoot.ts";

test.setTimeout(120_000);

const fakeHelper = path.join(
  repoRoot,
  "dashboard/tests/support/fakeReleaseApply.sh",
);

test.describe("Update worktree and retry", () => {
  let origin: StartOrigin;
  let server: DashboardServer | undefined;

  test.beforeEach(async () => {
    origin = await startOrigin();
  });

  test.afterEach(async () => {
    await server?.close();
    origin.cleanup();
  });

  async function incompleteKeptStart(extraEnv: Record<string, string> = {}) {
    const dashboard = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv: { DOUGH_START_TIMEOUT_MS: "60000", ...extraEnv },
    });
    server = dashboard;
    dashboard.claudeScenario("launched");
    installHook(origin, "echo refused >&2\nexit 1\n");
    const first = await answerOf<Problem>(launch(dashboard, request));
    expect(first, first.explanation).toMatchObject({
      kind: "failed",
      reason: "start-refused",
    });
    const workspace = workspaceOf(origin);
    plantIncompleteInstall(workspace);
    removeHook(origin);
    const id = (await attempts(dashboard)).at(-1)?.id ?? "";
    const refused = await answerOf<Problem>(continued(dashboard, id));
    expect(refused).toMatchObject({
      kind: "failed",
      reason: "refused",
      worktreeUpdateNeeded: true,
    });
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    return { id, workspace, dashboard };
  }

  test("successful apply against the exact worktree then resumes the retained start once", async () => {
    const applyLog = path.join(origin.machine, "fake-apply.log");
    const { id, workspace, dashboard } = await incompleteKeptStart({
      OPEN_DOUGH_RELEASE_HELPER: fakeHelper,
      OPEN_DOUGH_FAKE_APPLY_LOG: applyLog,
    });
    expect(keptStartOf(origin)).toMatchObject({
      identity: queuedIdentity,
      workspace,
      branch: `claude/${slug}`,
    });
    expect(
      existsSync(
        path.join(scriptsOf(workspace), "first-landing-expectation.mjs"),
      ),
    ).toBe(false);

    const resumed = await answerOf<{
      kind: string;
      record?: { start?: { workspace?: string } };
    }>(updateWorktreeRetried(dashboard, id));
    expect(resumed.kind, JSON.stringify(resumed)).toBe("launched");
    expect(resumed.record?.start?.workspace).toBe(workspace);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(
      existsSync(
        path.join(scriptsOf(workspace), "first-landing-expectation.mjs"),
      ),
    ).toBe(true);
    expect(readFileSync(applyLog, "utf8")).toBe(
      `apply --target ${workspace} --platform claude\n`,
    );
    expect(readFileSync(applyLog, "utf8")).not.toContain("--force");
    expect(await settledOutcome(dashboard, id)).toMatchObject({
      kind: "launched",
    });
    // Same attempt and workspace; one assignment from this resume, not a
    // replacement claim or second worktree.
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(keptStartOf(origin)).toBeUndefined();
  });

  test("updater refusal leaves an actionable explanation and does not launch", async () => {
    const { id, workspace, dashboard } = await incompleteKeptStart();
    const refused = await answerOf<Problem>(
      updateWorktreeRetried(dashboard, id),
    );
    expect(refused).toMatchObject({
      kind: "failed",
      reason: "refused",
      worktreeUpdateNeeded: true,
    });
    expect(refused.explanation).toMatch(
      /refused|failed|unverifiable|preserved|Nothing was launched/i,
    );
    expect(refused.explanation).toContain("No forced reinstall was attempted");
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    expect(keptStartOf(origin)).toMatchObject({
      identity: queuedIdentity,
      workspace,
      branch: `claude/${slug}`,
    });
  });
});
