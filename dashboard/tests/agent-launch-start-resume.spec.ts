// An uncertain or interrupted execution start is kept and resumed
// (../server/executionStart.ts, ../server/startStore.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts) whose `pre-receive` hook makes a push slow or
// refuses it once: the start wait expiring answers "Launch uncertain" naming
// workspace and branch and leaves the script to finish, its result recorded
// by the still-running attempt; a stop that carries `recovery` keeps its SHAs;
// and continuing that attempt resumes the kept start in the same workspace
// with one claim on origin, never a second workspace. A start lost with the server
// (no result, no `recovery`) refuses a fresh start of its story and is resumed
// from its workspace by its attempt's continuation: the retry derives
// the SHAs from the workspace HEAD and its parent, and a workspace that is not
// the isolated claim stops with the script's own reason.

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { attempts, continued, launch } from "./agentLaunchBoundary.ts";
import {
  answerOf,
  expectOneClaim,
  installHook,
  keptFacts,
  keptStartOf,
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

  // The dashboard server, its start wait as short or long as the case needs.
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

  // The story's latest attempt, which only its continuation resumes.
  const latest = async () => (await attempts(server)).at(-1)?.id ?? "";

  test("a push slower than the start wait is uncertain, finishes, and its continuation resumes it with one claim", async () => {
    // The wait bounds real Git work on both requests. Hold the first push
    // until its wait expires, without making the ordinary resume race a
    // one-second deadline when other tests are running.
    await serve(5000);
    const held = path.join(origin.machine, "push-held");
    writeFileSync(held, "");
    installHook(origin, `while [ -e "${held}" ]; do sleep 0.2; done\n`);
    const first = await answerOf<Problem>(launch(server, request));
    expect(first).toMatchObject({ kind: "uncertain", reason: "timed-out" });
    expect(first.explanation).toContain(
      `workspace ${keptFacts} on branch claude/${slug}`,
    );
    expect(first.explanation).toContain("where it can be resumed");
    expect(server.claudeCalls()).toEqual([]);
    // Written ahead of the script, before any result.
    expect(keptStartOf(origin)).toMatchObject({
      identity: queuedIdentity,
      workspace: workspaceOf(origin),
      branch: `claude/${slug}`,
    });
    expect(keptStartOf(origin)?.["start"]).toBeUndefined();

    // The script was left to finish, and its result is recorded.
    rmSync(held);
    await expect
      .poll(() => keptStartOf(origin)?.["start"], { timeout: 20_000 })
      .toMatchObject({
        identity: queuedIdentity,
        branch: `claude/${slug}`,
      });
    removeHook(origin);

    const second = await answerOf<Launched>(continued(server, await latest()));
    expect(second.kind, JSON.stringify(second)).toBe("launched");
    await expectOneClaim(origin);
    expect(second.record.start?.workspace).toBe(workspaceOf(origin));
    expect(second.record.start?.publishedSha).toBe(
      (await origin.originGit("rev-parse", "main")).trim(),
    );
    // The session carries the start now.
    expect(keptStartOf(origin)).toBeUndefined();
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

  // The server dies with the start's push held after the claim commit, so no
  // result and no `recovery` was recorded; a new server runs on the same
  // machine state.
  async function loseServerAfterClaimCommit(): Promise<string> {
    const held = path.join(origin.machine, "push-held");
    await serve(60_000);
    installHook(
      origin,
      `touch ${held}\nwhile [ -e ${held} ]; do sleep 0.2; done\nexit 1\n`,
    );
    void launch(server, request).catch(() => undefined);
    await expect.poll(() => existsSync(held), { timeout: 20_000 }).toBe(true);
    // The server ends and the script dies with it, its push never answered.
    const closing = server.close();
    try {
      execFileSync("pkill", ["-f", origin.machine]);
    } catch {
      // Nothing of the start was left running.
    }
    // Releases the held hook, which belongs to the server's process group.
    rmSync(held);
    await closing;
    removeHook(origin);
    expect(keptStartOf(origin)?.["start"]).toBeUndefined();
    expect(keptStartOf(origin)?.["candidateSha"]).toBeUndefined();
    expect(await origin.takenProfiles()).toEqual([]);
    await serve(60_000);
    // No server runs the attempt now and it never settled: only its own
    // continuation resumes it.
    const [interrupted] = await attempts(server);
    expect(interrupted).toMatchObject({ owned: false });
    expect(interrupted?.outcome).toBeUndefined();
    expect(await answerOf<Problem>(launch(server, request))).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    return interrupted?.id ?? "";
  }

  test("a start lost with the server is resumed by its continuation from its workspace with one claim", async () => {
    const interrupted = await loseServerAfterClaimCommit();
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
    expect(
      server.claudeCalls().filter((call) => call.argv[0] === "--bg"),
    ).toHaveLength(1);
    expect(keptStartOf(origin)).toBeUndefined();
  });

  test("a lost start whose workspace is not the isolated claim stops its continuation with the script's reason", async () => {
    const interrupted = await loseServerAfterClaimCommit();
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
