// Slow execution starts keep running through their warning threshold and launch
// automatically; real installed commands against a bare origin prove recovery.
import { rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  attempts,
  continued,
  continueAttempt,
  launch,
} from "./agentLaunchBoundary.ts";
import { settledAttempt } from "./settledAttempt.ts";
import {
  answerOf,
  expectOneClaim,
  installHook,
  keptStartOf,
  loseServerAfterClaimCommit,
  removeHook,
  request,
  slug,
  workspaceOf,
  type Launched,
  type Problem,
} from "./keptExecutionStart.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

test.describe("a kept execution start", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
  });

  async function serve(startWaitMs: number): Promise<void> {
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv: { DOUGH_START_TIMEOUT_MS: String(startWaitMs) },
    });
    server.claudeScenario("launched");
  }

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
  });

  const latest = async () => (await attempts(server)).at(-1)?.id ?? "";
  test("a push slower than the warning threshold keeps running and launches automatically with one claim", async () => {
    await serve(3000);
    const push = origin.holdPushes();
    const launching = answerOf<Launched>(launch(server, request));
    await expect.poll(() => push.isHeld(), { timeout: 20_000 }).toBe(true);
    await expect
      .poll(async () => (await attempts(server))[0]?.slowSince, {
        timeout: 20_000,
      })
      .toBeDefined();
    const [slow] = await attempts(server);
    expect(slow).toMatchObject({
      owned: true,
      publication: { kind: "unknown" },
    });
    expect(slow?.outcome).toBeUndefined();
    expect(slow?.settledAt).toBeUndefined();
    expect(push.isHeld()).toBe(true);
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(keptStartOf(origin)).toMatchObject({
      identity: queuedIdentity,
      workspace: workspaceOf(origin),
      branch: `claude/${slug}`,
    });
    expect(keptStartOf(origin)?.["start"]).toBeUndefined();
    expect(await answerOf<Problem>(launch(server, request))).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(
      await answerOf<Problem>(
        launch(server, { ...request, workflow: "refinement" }),
      ),
    ).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(
      await answerOf<Problem>(continueAttempt(server, slow?.id ?? "")),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    // Recording the warning can change its timestamp and observation count.
    expect(await attempts(server)).toEqual([
      {
        ...slow,
        slowSince: expect.any(String),
        changes: expect.any(Number) as unknown,
      },
    ]);
    push.release();
    const launched = await launching;
    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    await expectOneClaim(origin);
    expect(launched.record.start?.workspace).toBe(workspaceOf(origin));
    expect(launched.record.start?.publishedSha).toBe(
      (await origin.originGit("rev-parse", "main")).trim(),
    );
    await settledAttempt(server, {
      id: slow?.id,
      outcome: { kind: "launched" },
    });
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(keptStartOf(origin)).toBeUndefined();
  });

  test("a refusal after the warning threshold settles normally and starts no session", async () => {
    await serve(3000);
    const held = path.join(origin.machine, "script-held");
    writeFileSync(held, "");
    // The installed-command boundary supplies only a delayed refusal, never
    // publication or a session; the dashboard must interpret its late answer.
    const script = path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
    );
    writeFileSync(
      script,
      `import { existsSync } from "node:fs";
while (existsSync(${JSON.stringify(held)})) await new Promise(resolve => setTimeout(resolve, 20));
console.log(JSON.stringify({ok:false,status:"story-left-queue"}));
`,
    );
    const launching = answerOf<Problem>(launch(server, request));
    await expect
      .poll(async () => (await attempts(server))[0]?.slowSince, {
        timeout: 20_000,
      })
      .toBeDefined();
    const [slow] = await attempts(server);
    expect(slow?.outcome).toBeUndefined();
    rmSync(held);
    const refused = await launching;
    expect(refused).toMatchObject({ kind: "failed", reason: "start-refused" });
    expect(refused.explanation).toContain(
      "The start stopped (story-left-queue).",
    );
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await origin.takenProfiles()).toEqual([]);
    expect(keptStartOf(origin)).toBeUndefined();
    await settledAttempt(server, {
      publication: { kind: "none" },
      outcome: refused,
    });
  });

  test("a stop that carries recovery keeps its SHAs and its continuation resumes with them", async () => {
    await serve(60_000);
    installHook(origin, "echo refused >&2\nexit 1\n");
    const first = await answerOf<Problem>(launch(server, request));
    expect(first).toMatchObject({ kind: "failed", reason: "start-refused" });
    expect(first.explanation).toContain(
      `Workspace ${workspaceOf(origin)} on branch claude/${slug}.`,
    );
    expect(first.explanation).toContain(
      "The start was kept and can be resumed. Nothing was launched.",
    );
    expect(await origin.takenProfiles()).toEqual([]);
    const kept = keptStartOf(origin);
    expect(kept?.["candidateSha"]).toMatch(/^[0-9a-f]{40}$/);
    expect(kept?.["startingRevision"]).toMatch(/^[0-9a-f]{40}$/);

    removeHook(origin);
    const second = await answerOf<Launched>(continued(server, await latest()));
    expect(second.kind).toBe("launched");
    expect(second.record.start).toMatchObject({
      candidateSha: kept?.["candidateSha"],
      workspace: workspaceOf(origin),
    });
    await expectOneClaim(origin);
    expect(await origin.originGit("rev-parse", "main")).toContain(
      String(kept?.["candidateSha"]),
    );
    expect(keptStartOf(origin)).toBeUndefined();
  });

  const loseServer = () =>
    loseServerAfterClaimCommit(origin, async () => {
      await serve(60_000);
      return server;
    });

  test("a start lost with the server is resumed by its continuation from its workspace with one claim", async () => {
    const interrupted = await loseServer();
    const head = execFileSync(
      "git",
      ["-C", workspaceOf(origin), "rev-parse", "HEAD"],
      {
        encoding: "utf8",
      },
    ).trim();
    const second = await answerOf<Launched>(continued(server, interrupted));
    expect(second.kind).toBe("launched");
    expect(second.record.start).toMatchObject({
      candidateSha: head,
      workspace: workspaceOf(origin),
    });
    await expectOneClaim(origin);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(head);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(keptStartOf(origin)).toBeUndefined();
  });

  test("a lost start whose workspace is not the isolated claim stops its continuation with the script's reason", async () => {
    const interrupted = await loseServer();
    execFileSync("git", [
      "-C",
      workspaceOf(origin),
      "-c",
      "user.name=T",
      "-c",
      "user.email=t@example.test",
      "commit",
      "--allow-empty",
      "-m",
      "more work",
    ]);
    const answer = await answerOf<Problem>(continued(server, interrupted));
    expect(answer).toMatchObject({ kind: "failed", reason: "start-refused" });
    expect(answer.explanation).toContain(
      "The workspace could not be set up: retained candidate or workspace is not the isolated owned claim.",
    );
    expect(server.claudeCalls()).toEqual([]);
    expect(await origin.takenProfiles()).toEqual([]);
  });
});
