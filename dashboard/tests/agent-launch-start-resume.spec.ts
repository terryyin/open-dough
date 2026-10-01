// An uncertain or interrupted execution start is kept and resumed
// (../server/executionStart.ts, ../server/startStore.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts) whose `pre-receive` hook makes a push slow or
// refuses it once: the start wait expiring answers "Launch uncertain" naming
// workspace and branch and leaves the script to finish, its result recorded
// by the still-running attempt; a stop that carries `recovery` keeps its SHAs;
// and pressing Start again resumes the kept start in the same workspace with
// one claim on origin, never a second workspace. A start lost with the server
// (no result, no `recovery`) is resumed from its workspace: the retry derives
// the SHAs from the workspace HEAD and its parent, and a workspace that is not
// the isolated claim stops with the script's own reason.

import { readdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
import { keptExecutionStart } from "./support/keptExecutionStart.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
};
const slug = "prepare-the-queued-start";
const keptFacts = "~/git/open-dough/.worktrees/prepare-the-queued-start";

test.describe("a kept execution start", () => {
  let origin: StartOrigin;
  let server: DashboardServer;
  let start: ReturnType<typeof keptExecutionStart>;

  test.beforeEach(async () => {
    origin = await startOrigin();
    start = keptExecutionStart(origin);
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

  test("a push slower than the start wait is uncertain, finishes, and Start again resumes it with one claim", async () => {
    // The wait bounds real Git work on both requests. Hold the first push
    // until its wait expires, without making the ordinary resume race a
    // one-second deadline when other tests are running.
    await serve(5000);
    const held = path.join(origin.machine, "push-held");
    writeFileSync(held, "");
    start.installHook(`while [ -e "${held}" ]; do sleep 0.2; done\n`);
    const first = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      reason: string;
      explanation: string;
    };
    expect(first).toMatchObject({ kind: "uncertain", reason: "timed-out" });
    expect(first.explanation).toContain(
      `workspace ${keptFacts} on branch claude/${slug}`,
    );
    expect(first.explanation).toContain("pressing Start again resumes it");
    expect(server.claudeCalls()).toEqual([]);
    // Written ahead of the script, before any result.
    expect(start.read()).toMatchObject({
      identity: queuedIdentity,
      workspace: path.join(origin.project, ".worktrees", slug),
      branch: `claude/${slug}`,
    });
    expect(start.read()?.["start"]).toBeUndefined();

    // The script was left to finish, and its result is recorded.
    rmSync(held);
    await expect
      .poll(() => start.read()?.["start"], { timeout: 20_000 })
      .toMatchObject({
        identity: queuedIdentity,
        branch: `claude/${slug}`,
      });
    start.removeHook();

    const second = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      record: { start?: { workspace: string; publishedSha: string } };
    };
    expect(second.kind, JSON.stringify(second)).toBe("launched");
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      slug,
    ]);
    const workspace = path.join(origin.project, ".worktrees", slug);
    expect(second.record.start?.workspace).toBe(workspace);
    expect(second.record.start?.publishedSha).toBe(
      (await origin.originGit("rev-parse", "main")).trim(),
    );
    // The session carries the start now.
    expect(start.read()).toBeUndefined();
  });

  test("a stop that carries recovery keeps its SHAs and Start again resumes with them", async () => {
    await serve(60_000);
    start.installHook("echo refused >&2\nexit 1\n");
    const first = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      reason: string;
      explanation: string;
    };
    expect(first).toMatchObject({ kind: "failed", reason: "start-refused" });
    expect(first.explanation).toContain(
      `Workspace ${path.join(origin.project, ".worktrees", slug)} on branch claude/${slug}.`,
    );
    expect(first.explanation).toContain(
      "The start was kept; pressing Start again resumes it. Nothing was launched.",
    );
    expect(await origin.takenProfiles()).toEqual([]);
    const kept = start.read();
    expect(kept?.["candidateSha"]).toMatch(/^[0-9a-f]{40}$/);
    expect(kept?.["startingRevision"]).toMatch(/^[0-9a-f]{40}$/);

    start.removeHook();
    const second = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      record: { start?: { candidateSha?: string; workspace: string } };
    };
    expect(second.kind).toBe("launched");
    expect(second.record.start).toMatchObject({
      candidateSha: kept?.["candidateSha"],
      workspace: path.join(origin.project, ".worktrees", slug),
    });
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(await origin.originGit("rev-parse", "main")).toContain(
      String(kept?.["candidateSha"]),
    );
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      slug,
    ]);
    expect(start.read()).toBeUndefined();
  });

  // The server dies with the start's push held after the claim commit, so no
  // result and no `recovery` was recorded; a new server runs on the same
  // machine state.
  async function loseServerAfterClaimCommit(): Promise<void> {
    const held = path.join(origin.machine, "push-held");
    await serve(60_000);
    start.installHook(
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
    start.removeHook();
    expect(start.read()?.["start"]).toBeUndefined();
    expect(start.read()?.["candidateSha"]).toBeUndefined();
    expect(await origin.takenProfiles()).toEqual([]);
    await serve(60_000);
  }

  test("a start lost with the server is resumed from its workspace with one claim", async () => {
    await loseServerAfterClaimCommit();
    const workspace = path.join(origin.project, ".worktrees", slug);
    const head = execFileSync("git", ["-C", workspace, "rev-parse", "HEAD"], {
      encoding: "utf8",
    }).trim();
    const second = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      record: { start?: { candidateSha?: string; workspace: string } };
    };
    expect(second.kind).toBe("launched");
    expect(second.record.start).toMatchObject({
      candidateSha: head,
      workspace,
    });
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(head);
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      slug,
    ]);
    expect(
      server.claudeCalls().filter((call) => call.argv[0] === "--bg"),
    ).toHaveLength(1);
    expect(start.read()).toBeUndefined();
  });

  test("a lost start whose workspace is not the isolated claim stops with the script's reason", async () => {
    await loseServerAfterClaimCommit();
    const workspace = path.join(origin.project, ".worktrees", slug);
    execFileSync("git", [
      "-C",
      workspace,
      "-c",
      "user.name=T",
      "-c",
      "user.email=t@example.test",
      "commit",
      "--allow-empty",
      "-m",
      "more work",
    ]);
    const answer = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      reason: string;
      explanation: string;
    };
    expect(answer).toMatchObject({ kind: "failed", reason: "start-refused" });
    expect(answer.explanation).toContain(
      "The workspace could not be set up: retained candidate or workspace is not the isolated owned claim.",
    );
    expect(server.claudeCalls()).toEqual([]);
    expect(await origin.takenProfiles()).toEqual([]);
  });
});
