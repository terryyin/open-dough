// Two dashboard servers on this machine accepting one story at once start
// one: the conflict check runs inside the attempt store's locked
// read-modify-write, so a second accept waits for the lock, reads the first
// attempt, and is answered already-starting. Accepts for different stories
// from the two servers are both accepted. Proven over raw HTTP with
// serverOn("dev") and serverOn("preview") sharing one start-origin machine.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import { keptAttempts as keptOfMachine } from "./acceptedAttempts.ts";
import { accept } from "./agentLaunchBoundary.ts";
import { answerOf, openSessionRequest } from "./openStorySessionAcceptance.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  otherQueuedIdentity,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "./support/startOrigin.ts";

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

  async function serverOn(mode: "dev" | "preview"): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode,
      prebuilt: mode === "preview" ? builtDashboardDir : undefined,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
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

  const attemptsFile = (server: DashboardServer) =>
    path.join(server.home, ".open-dough", "dashboard", "launch-attempts.json");

  const attemptsLock = (server: DashboardServer) =>
    `${attemptsFile(server)}.lock`;

  test("while the attempt lock is held, a second server waits, then refuses after the first attempt is written", async () => {
    test.setTimeout(120_000);
    const preview = await serverOn("preview");
    preview.claudeScenario("held");

    const folder = path.dirname(attemptsFile(preview));
    mkdirSync(folder, { recursive: true });
    mkdirSync(attemptsLock(preview));

    const pending = accept(preview, request);
    // The accept must reach the locked write before A's attempt is visible.
    await new Promise((resolve) => setTimeout(resolve, 250));

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
      attemptsFile(preview),
      `${JSON.stringify({ "open-dough": [first] }, null, 2)}\n`,
    );
    rmSync(attemptsLock(preview), { recursive: true });

    expect(await answerOf(pending)).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(keptOfMachine(preview)).toEqual([first]);
    expect(preview.claudeCalls()).toEqual([]);
    expect(push.isHeld()).toBe(false);
  });

  test("simultaneous accepts from two servers start one story once", async () => {
    test.setTimeout(120_000);
    const dev = await serverOn("dev");
    const preview = await serverOn("preview");
    dev.claudeScenario("held");
    preview.claudeScenario("held");

    const sameStory = await Promise.all([
      answerOf(accept(dev, request)),
      answerOf(accept(preview, { ...request, workflow: "refinement" })),
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
    expect(keptOfMachine(dev)).toHaveLength(1);
    const kept = keptOfMachine(dev)[0]?.request;
    expect(kept && "identity" in kept ? kept.identity : undefined).toBe(
      request.identity,
    );
  });

  test("simultaneous accepts for different stories from two servers are both accepted", async () => {
    test.setTimeout(120_000);
    const dev = await serverOn("dev");
    const preview = await serverOn("preview");
    dev.claudeScenario("held");
    preview.claudeScenario("held");

    const differentStories = await Promise.all([
      answerOf(accept(dev, request)),
      answerOf(accept(preview, otherRequest)),
    ]);
    expect(
      differentStories.filter((answer) => answer.kind === "accepted"),
    ).toHaveLength(2);
    const identities = keptOfMachine(dev)
      .map((attempt) =>
        "identity" in attempt.request ? attempt.request.identity : undefined,
      )
      .sort();
    expect(identities).toEqual([request.identity, otherQueuedIdentity].sort());
  });
});
