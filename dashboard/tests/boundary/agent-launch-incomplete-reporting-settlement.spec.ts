// Start-Continue settlement refuses incomplete launch-workspace reporting
// support before native launch and preserves the kept start.
import { execFileSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { attempts, continued, launch } from "../agentLaunchBoundary.ts";
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
import { expectReportingBlock } from "../support/reportingInputAssertions.ts";
import { requestFor, startBoundary } from "../support/launchDashboard.ts";
import { settledOutcome } from "../acceptedAttempts.ts";
import type { RecordedLaunchRequest } from "../../src/agentLaunch.ts";
import {
  plantIncompleteInstall,
  scriptsOf,
} from "../support/incompleteReportingInstall.ts";

test.setTimeout(120_000);

test.describe("Start-Continue settlement with incomplete launch-workspace support", () => {
  let origin: StartOrigin;
  let server: DashboardServer | undefined;

  test.beforeEach(async () => {
    origin = await startOrigin();
  });

  test.afterEach(async () => {
    await server?.close();
    origin.cleanup();
  });

  test("Continue stops before native launch with a definite failure naming the missing helper", async () => {
    server = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv: { DOUGH_START_TIMEOUT_MS: "60000" },
    });
    server.claudeScenario("launched");
    installHook(origin, "echo refused >&2\nexit 1\n");
    const first = await answerOf<Problem>(launch(server, request));
    expect(first, first.explanation).toMatchObject({
      kind: "failed",
      reason: "start-refused",
    });
    expect(keptStartOf(origin)).toBeDefined();
    const workspace = workspaceOf(origin);
    const missingPath = plantIncompleteInstall(workspace);
    removeHook(origin);

    const id = (await attempts(server)).at(-1)?.id ?? "";
    const resumed = await answerOf<Problem>(continued(server, id));
    expect(resumed).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    expect(resumed.explanation).toContain("first-landing-expectation.mjs");
    expect(resumed.explanation).toContain(missingPath);
    expect(resumed.explanation).toContain("Update worktree and retry");
    expect(resumed).toMatchObject({ worktreeUpdateNeeded: true });
    expect(resumed.explanation).toContain(
      "The start was kept and can be resumed",
    );
    expect(resumed.explanation).toContain("Nothing was launched");
    expect(resumed.explanation).not.toMatch(/may or may not have started/i);
    expect(resumed.explanation).not.toContain("ENOENT");
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(keptStartOf(origin)).toMatchObject({
      identity: queuedIdentity,
      workspace,
      branch: `claude/${slug}`,
    });
    expect(await settledOutcome(server, id)).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation: expect.stringContaining("first-landing-expectation.mjs"),
    });
  });

  test("a fresh start whose worktree already lacks the sibling fails after Taken without claiming a session might have launched", async () => {
    // Commit an incomplete install so the new worktree inherits it.
    plantIncompleteInstall(origin.project);
    writeFileSync(
      path.join(origin.project, "note.txt"),
      "incomplete install marker\n",
    );
    execFileSync("git", ["add", "-A"], { cwd: origin.project });
    execFileSync("git", ["commit", "-m", "incomplete reporting helpers"], {
      cwd: origin.project,
    });
    execFileSync("git", ["push", "-q", "origin", "main"], {
      cwd: origin.project,
    });

    server = await startBoundary(origin);
    server.claudeScenario("launched");
    const answer = await answerOf<Problem>(
      launch(server, requestFor("execution")),
    );
    expect(answer).toMatchObject({
      kind: "failed",
      reason: "refused",
    });
    expect(answer.explanation).toContain("first-landing-expectation.mjs");
    expect(answer.explanation).toMatch(/Taken|no session started/i);
    expect(answer.explanation).not.toMatch(/may or may not have started/i);
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(keptStartOf(origin)).toBeDefined();
  });

  test("compatible older install without landing launches and prepares reporting", async () => {
    unlinkSync(path.join(scriptsOf(origin.project), "dashboard-landing.mjs"));
    unlinkSync(
      path.join(scriptsOf(origin.project), "first-landing-expectation.mjs"),
    );
    execFileSync("git", ["add", "-A"], { cwd: origin.project });
    execFileSync("git", ["commit", "-m", "older install without landing"], {
      cwd: origin.project,
    });
    execFileSync("git", ["push", "-q", "origin", "main"], {
      cwd: origin.project,
    });

    server = await startBoundary(origin);
    server.claudeScenario("launched");
    const response = await launch(server, requestFor("execution"));
    const answer = JSON.parse(response.body) as {
      kind: string;
      record?: { request: RecordedLaunchRequest };
    };
    expect(answer.kind, response.body).toBe("launched");
    const record = answer.record;
    if (record === undefined) throw new Error("Missing launched record.");
    const reporting = record.request.reporting;
    expect(reporting?.command).toContain("dashboard-completion.mjs");
    expect(reporting).not.toHaveProperty("landingContext");
    const instruction = server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
    const reportingBlock = instruction.split("\n\n")[2];
    expectReportingBlock(reportingBlock, record.request, server);
    expect(
      readFileSync(
        path.join(scriptsOf(workspaceOf(origin)), "dashboard-completion.mjs"),
        "utf8",
      ).length,
    ).toBeGreaterThan(0);
  });
});
