// Two dashboard servers on this machine accepting one story at once start
// one: the conflict check runs inside the attempt store's locked
// read-modify-write, so a second accept waits for the lock, reads the first
// attempt, and is answered already-starting. Accepts for different stories
// from the two servers are both accepted. Proven over raw HTTP with
// serverOn("development") and serverOn("production"), two boundary servers in
// the two project environments, sharing one start-origin machine.
// The held-lock case observes the second accept reach the locked write through
// a loader that marks the server's first refused lock acquisition.

import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import { keptAttempts as keptOfMachine } from "../acceptedAttempts.ts";
import { accept } from "../agentLaunchBoundary.ts";
import { answerOf, openSessionRequest } from "./openStorySessionAcceptance.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import {
  otherQueuedIdentity,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "../support/startOrigin.ts";
import { fsPromisesHook } from "../support/serverFsHook.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

const request = openSessionRequest;
const otherRequest = {
  ...request,
  identity: otherQueuedIdentity,
  title: "Story B",
};

test.describe("cross-server accept of one story", () => {
  let origin: StartOrigin;
  let push: PushHold;
  const servers: DashboardServer[] = [];

  async function serverOn(
    environment: ProjectEnvironment,
    extraEnv: Readonly<Record<string, string>> = {},
  ): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode: "boundary",
      environment,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
      extraEnv,
    });
    servers.push(server);
    return server;
  }

  test.beforeEach(async () => {
    origin = await startOrigin();
    push = origin.holdPushes();
  });

  test.afterEach(async () => {
    push.release();
    await Promise.all(servers.splice(0).map((server) => server.close()));
    origin.cleanup();
  });

  // The machine's attempts file, known before its servers start so a loader
  // can name its lock.
  const attemptsFile = () =>
    path.join(
      origin.machine,
      "home",
      ".open-dough",
      "dashboard",
      "launch-attempts.json",
    );

  const attemptsLock = () => `${attemptsFile()}.lock`;

  // Loaded into the server: marks `waited` once a lock acquisition finds the
  // attempts lock held, the only place the store retries `mkdir` of it.
  const lockWait = (lock: string, waited: string) =>
    fsPromisesHook(
      path.join(origin.machine, "lock-wait.mjs"),
      "mkdir",
      `async (directory, ...args) => {
 try { return await original(directory, ...args); }
 catch (error) {
  if (error?.code === 'EEXIST' && String(directory) === ${JSON.stringify(lock)}) fs.writeFileSync(${JSON.stringify(waited)}, 'waited');
  throw error;
 }
}`,
    );

  test("while the attempt lock is held, a second server waits, then refuses after the first attempt is written", async () => {
    test.setTimeout(120_000);
    const waited = path.join(origin.machine, "lock-waited");
    const production = await serverOn(
      "production",
      lockWait(attemptsLock(), waited),
    );
    production.claudeScenario("held");

    mkdirSync(path.dirname(attemptsFile()), { recursive: true });
    mkdirSync(attemptsLock());

    const pending = accept(production, request);
    // The accept waits on the held lock, past its unlocked reads, before A's
    // attempt is visible.
    await expect.poll(() => existsSync(waited)).toBe(true);

    const first: LaunchAttemptRecord = {
      id: "aaaaaaaa-0000-4000-8000-0000000000aa",
      request: {
        source: request.source,
        identity: request.identity,
        title: request.title,
        workflow: "refinement",
        host: "claude",
      },
      acceptedAt: new Date().toISOString(),
      publication: { kind: "unknown" },
    };
    writeFileSync(
      attemptsFile(),
      `${JSON.stringify({ "open-dough": [first] }, null, 2)}\n`,
    );
    rmSync(attemptsLock(), { recursive: true });

    expect(await answerOf(pending)).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(keptOfMachine(production)).toEqual([first]);
    expect(production.claudeCalls()).toEqual([]);
    expect(push.isHeld()).toBe(false);
  });

  test("simultaneous accepts from two servers start one story once", async () => {
    test.setTimeout(120_000);
    const development = await serverOn("development");
    const production = await serverOn("production");
    development.claudeScenario("held");
    production.claudeScenario("held");

    const sameStory = await Promise.all([
      answerOf(accept(development, request)),
      answerOf(accept(production, { ...request, workflow: "refinement" })),
    ]);
    expect(
      sameStory.filter((answer) => answer.kind === "accepted"),
    ).toHaveLength(1);
    expect(
      sameStory.filter(
        (answer) =>
          answer.kind === "failed" && answer.reason === "already-starting",
      ),
    ).toHaveLength(1);
    expect(keptOfMachine(development)).toHaveLength(1);
    const kept = keptOfMachine(development)[0]?.request;
    expect(kept && "identity" in kept ? kept.identity : undefined).toBe(
      request.identity,
    );
  });

  test("simultaneous accepts for different stories from two servers are both accepted", async () => {
    test.setTimeout(120_000);
    const development = await serverOn("development");
    const production = await serverOn("production");
    development.claudeScenario("held");
    production.claudeScenario("held");

    const differentStories = await Promise.all([
      answerOf(accept(development, request)),
      answerOf(accept(production, otherRequest)),
    ]);
    expect(
      differentStories.filter((answer) => answer.kind === "accepted"),
    ).toHaveLength(2);
    const identities = keptOfMachine(development)
      .map((attempt) =>
        "identity" in attempt.request ? attempt.request.identity : undefined,
      )
      .sort();
    expect(identities).toEqual([request.identity, otherQueuedIdentity].sort());
  });
});
