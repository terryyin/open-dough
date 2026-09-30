// A kept refinement preparation start is resumed by the next Start
// (../server/preparationStart.ts, ../server/startStore.ts), over raw HTTP
// against the real installed `preparation-assignment.mjs` and a real bare
// origin (./support/startOrigin.ts) whose `pre-receive` hook makes the
// announcement slow or refused: a start that outlasts the wait, an
// `unpublished` stop, and a `claude` refusal after the announcement each keep
// the start, and pressing Start again reruns the script in the same workspace
// and branch, which answers `continued`, opens the session there, and leaves
// exactly one preparation profile on origin and no kept start.

import {
  chmodSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { launch, launchRequest, runningStarts } from "./agentLaunchBoundary.ts";
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
  workflow: "refinement",
  identity: queuedIdentity,
  title: queuedTitle,
};
const slug = "prepare-the-queued-start";
const kept = `workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}`;

type Answer = { kind: string; reason?: string; explanation: string };

test.describe("a kept preparation start", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
  });

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
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
  }

  const hook = () => path.join(origin.origin, "hooks", "pre-receive");
  function installHook(body: string): void {
    writeFileSync(hook(), `#!/bin/sh\n${body}`);
    chmodSync(hook(), 0o755);
  }
  const keptStart = () =>
    (
      JSON.parse(
        readFileSync(
          path.join(
            origin.machine,
            "home/.open-dough/dashboard/refinement-starts.json",
          ),
          "utf8",
        ),
      ) as { "open-dough"?: Record<string, Record<string, unknown>> }
    )["open-dough"]?.[queuedIdentity];
  const preparing = async () =>
    (await origin.takenProfiles()).filter(
      (profile) => profile["activity"] === "preparation",
    );

  async function ask(): Promise<Answer> {
    return JSON.parse((await launch(server, request)).body) as Answer;
  }

  // The second Start: one session in the kept workspace, one preparation
  // profile, one workspace, and nothing kept.
  async function expectResumed(): Promise<void> {
    const second = await ask();
    expect(second.kind, second.explanation).toBe("launched");
    const workspace = path.join(origin.project, ".worktrees", slug);
    const [call] = server.claudeLaunchCalls().slice(-1);
    expect(call?.cwd).toContain(slug);
    const instruction = call?.argv.at(-1) ?? "";
    expect(instruction).toContain("Established preparation:");
    expect(instruction).toContain(`- workspace: ${workspace}`);
    expect(instruction).toContain(`- branch: claude/${slug}`);
    expect(await preparing()).toHaveLength(1);
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      slug,
    ]);
    expect(keptStart()).toBeUndefined();
  }

  test("a start that outlasts the wait is kept and Start again resumes it with one profile", async () => {
    await serve(1000);
    server.claudeScenario("launched");
    installHook("sleep 3\n");
    const first = await ask();
    expect(first).toMatchObject({ kind: "uncertain", reason: "timed-out" });
    expect(first.explanation).toContain(
      `The start was kept and goes on in ${kept}; pressing Start again resumes it.`,
    );
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(keptStart()).toMatchObject({
      identity: queuedIdentity,
      workspace: path.join(origin.project, ".worktrees", slug),
      branch: `claude/${slug}`,
    });
    // The script was left to finish; the announcement lands.
    await expect.poll(preparing, { timeout: 20_000 }).toHaveLength(1);
    // Start again is refused while the script still runs.
    await expect
      .poll(() => runningStarts(server), { timeout: 20_000 })
      .toEqual([]);
    rmSync(hook());
    await expectResumed();
  });

  test("an unpublished stop keeps the start and Start again settles it with one profile", async () => {
    await serve(60_000);
    server.claudeScenario("launched");
    installHook("echo refused >&2\nexit 1\n");
    const first = await ask();
    expect(first, first.explanation).toMatchObject({
      kind: "failed",
      reason: "start-refused",
    });
    expect(first.explanation).toContain(
      `Workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}. The start was kept; pressing Start again resumes it. Nothing was launched.`,
    );
    expect(server.claudeLaunchCalls()).toEqual([]);
    expect(await preparing()).toEqual([]);
    expect(keptStart()).toBeDefined();
    rmSync(hook());
    await expectResumed();
  });

  test("a claude refusal after the announcement keeps the start and Start again resumes with one assignment", async () => {
    await serve(60_000);
    server.claudeScenario("refused");
    const first = await ask();
    expect(first, first.explanation).toMatchObject({ kind: "failed" });
    expect(first.explanation).toMatch(
      new RegExp(
        `Preparing as [A-Za-z]+-chan; no session started\\. Workspace ~/git/open-dough/\\.worktrees/${slug}\\.$`,
      ),
    );
    expect(await preparing()).toHaveLength(1);
    expect(keptStart()).toMatchObject({ identity: queuedIdentity });
    server.claudeScenario("launched");
    await expectResumed();
  });
});
