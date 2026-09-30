// An uncertain or interrupted execution start is kept and resumed
// (../server/executionStart.ts, ../server/startStore.ts), over raw HTTP
// against the real installed `execution-start.mjs` and a real bare origin
// (./support/startOrigin.ts) whose `pre-receive` hook makes a push slow or
// refuses it once: the start wait expiring answers "Launch uncertain" naming
// workspace and branch and leaves the script to finish, its result recorded
// by the still-running attempt; a stop that carries `recovery` keeps its SHAs;
// and pressing Start again resumes the kept start in the same workspace with
// one claim on origin, never a second workspace.

import {
  readFileSync,
  readdirSync,
  writeFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
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

  const hook = () => path.join(origin.origin, "hooks", "pre-receive");
  const keptStarts = () =>
    path.join(
      origin.machine,
      "home/.open-dough/dashboard/execution-starts.json",
    );
  const keptStart = () =>
    (
      JSON.parse(readFileSync(keptStarts(), "utf8")) as {
        "open-dough"?: Record<string, Record<string, unknown>>;
      }
    )["open-dough"]?.[queuedIdentity];

  function installHook(body: string): void {
    writeFileSync(hook(), `#!/bin/sh\n${body}`);
    chmodSync(hook(), 0o755);
  }

  test("a push slower than the start wait is uncertain, finishes, and Start again resumes it with one claim", async () => {
    await serve(1000);
    installHook("sleep 3\n");
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
    expect(keptStart()).toMatchObject({
      identity: queuedIdentity,
      workspace: path.join(origin.project, ".worktrees", slug),
      branch: `claude/${slug}`,
    });
    expect(keptStart()?.["start"]).toBeUndefined();

    // The script was left to finish, and its result is recorded.
    await expect
      .poll(() => keptStart()?.["start"], { timeout: 20_000 })
      .toMatchObject({
        identity: queuedIdentity,
        branch: `claude/${slug}`,
      });
    rmSync(hook());

    const second = JSON.parse((await launch(server, request)).body) as {
      kind: string;
      record: { start?: { workspace: string; publishedSha: string } };
    };
    expect(second.kind).toBe("launched");
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
    expect(keptStart()).toBeUndefined();
  });

  test("a stop that carries recovery keeps its SHAs and Start again resumes with them", async () => {
    await serve(60_000);
    installHook("echo refused >&2\nexit 1\n");
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
    const kept = keptStart();
    expect(kept?.["candidateSha"]).toMatch(/^[0-9a-f]{40}$/);
    expect(kept?.["startingRevision"]).toMatch(/^[0-9a-f]{40}$/);

    rmSync(hook());
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
    expect(keptStart()).toBeUndefined();
  });
});
