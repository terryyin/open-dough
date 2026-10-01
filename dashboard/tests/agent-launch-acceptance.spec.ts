// A launch's acceptance by the local launch owner (../server/agentLaunches.ts),
// over raw HTTP against the real installed `execution-start.mjs` and a real
// bare origin (./support/startOrigin.ts) whose `pre-receive` hook holds the
// Take, with the synthetic `claude` holding the session launch: acceptance
// answers before publication with the exact request kept on this machine;
// the launch settles after its caller is gone, its publication receipt and
// outcome observable through the machine's sessions and its kept attempt.
// While it is unsettled no workflow's launch of the story is accepted. An
// acceptance that cannot be kept starts nothing, and a failure after
// acceptance is the owner's kept outcome rather than a crashed server.

import { chmodSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { AttemptObservation } from "../src/agentLaunch.ts";
import {
  accept,
  alreadyStarting,
  attempts,
  keptStarts,
  launch,
  launchRequest,
  recordsOf,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import { keptAttempts as keptOfMachine } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type PushHold,
  type StartOrigin,
} from "./support/startOrigin.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
  instruction: "Keep this exact instruction.",
};

type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  attempt?: AttemptObservation;
};

test.describe("an accepted launch", () => {
  let origin: StartOrigin;
  let server: DashboardServer;
  let push: PushHold;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 30_000,
    });
    push = origin.holdPushes();
  });

  test.afterEach(async () => {
    if (existsSync(machineStore())) chmodSync(machineStore(), 0o755);
    push.release();
    await server.close();
    origin.cleanup();
  });

  const answerOf = async (
    pending: ReturnType<typeof launch>,
  ): Promise<Answer> => JSON.parse((await pending).body) as Answer;

  const machineStore = () => path.join(server.home, ".open-dough", "dashboard");

  const keptAttempts = () => keptOfMachine(server);

  const workspaces = (): string[] => {
    const folder = path.join(origin.project, ".worktrees");
    return existsSync(folder) ? readdirSync(folder) : [];
  };

  test("is kept before publication and settles after its caller is gone, one start across workflows", async () => {
    test.setTimeout(120_000);
    server.claudeScenario("held");

    const answered = await answerOf(accept(server, request));
    expect(answered).toMatchObject({
      kind: "accepted",
      attempt: { request, publication: { kind: "unknown" }, owned: true },
    });
    const id = answered.attempt?.id;
    // Kept with its exact request before the start published anything.
    expect(keptAttempts()).toEqual([
      {
        id,
        request,
        acceptedAt: answered.attempt?.acceptedAt,
        publication: { kind: "unknown" },
      },
    ]);
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
    expect(await origin.takenProfiles()).toEqual([]);
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: true },
    ]);

    // No workflow's launch of the story is accepted while it is unsettled.
    const refinement = { ...request, workflow: "refinement" };
    expect(await answerOf(accept(server, refinement))).toEqual(alreadyStarting);
    expect(await answerOf(accept(server, request))).toEqual(alreadyStarting);
    expect(server.claudeCalls()).toEqual([]);
    expect(workspaces()).toHaveLength(1);
    expect(await attempts(server)).toHaveLength(1);

    // The Take is published; the session launch is still held.
    push.release();
    await expect
      .poll(async () => (await attempts(server))[0]?.publication.kind, {
        timeout: 30_000,
      })
      .toBe("published");
    const revision = (await origin.originGit("rev-parse", "main")).trim();
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: true },
    ]);
    expect(keptAttempts()[0]?.publication).toEqual({
      kind: "published",
      revision,
    });
    expect(keptAttempts()[0]?.outcome).toBeUndefined();
    expect(await answerOf(accept(server, refinement))).toEqual(alreadyStarting);

    server.releaseHeldClaude();
    await expect
      .poll(async () => (await attempts(server))[0]?.outcome?.kind, {
        timeout: 30_000,
      })
      .toBe("launched");
    const [record] = (await recordsOf(server, "open-dough")) as {
      session: { host: string; sessionId: string };
    }[];
    expect(keptAttempts()[0]).toMatchObject({
      id,
      request,
      outcome: {
        kind: "launched",
        session: { host: "claude", sessionId: record?.session.sessionId },
      },
    });
    expect(await attempts(server)).toEqual([
      { ...keptAttempts()[0], owned: false },
    ]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(workspaces()).toHaveLength(1);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(await runningStarts(server)).toEqual([]);
    expect(await keptStarts(server)).toEqual([]);
  });

  test("that cannot be kept starts nothing", async () => {
    mkdirSync(machineStore(), { recursive: true });
    chmodSync(machineStore(), 0o555);
    server.claudeScenario("launched");

    expect(await answerOf(accept(server, request))).toEqual({
      kind: "failed",
      reason: "unrecorded",
      explanation:
        "This machine's launch evidence could not be written, so the launch was not accepted. Nothing was started or launched.",
    });
    expect(push.isHeld()).toBe(false);
    expect(await origin.takenProfiles()).toEqual([]);
    expect(workspaces()).toEqual([]);
    expect(server.claudeCalls()).toEqual([]);
    expect(await runningStarts(server)).toEqual([]);
    expect(await keptStarts(server)).toEqual([]);
    expect(await attempts(server)).toEqual([]);
  });

  test("whose run fails after acceptance keeps that outcome with its owner while the server goes on", async () => {
    test.setTimeout(120_000);
    server.claudeScenario("launched");
    const answered = await answerOf(accept(server, request));
    expect(answered.kind).toBe("accepted");
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);

    // The machine's store cannot be written once the Take is published.
    chmodSync(machineStore(), 0o555);
    push.release();
    await expect
      .poll(async () => (await attempts(server))[0]?.outcome, {
        timeout: 30_000,
      })
      .toMatchObject({
        kind: "uncertain",
        reason: "unconfirmed",
        explanation: expect.stringContaining("The launch ended unexpectedly"),
      });
    expect((await attempts(server))[0]).toMatchObject({
      id: answered.attempt?.id,
      owned: false,
    });
    // What was kept stays as it was written before the failure: unsettled,
    // its publication not yet known, to be reconciled.
    expect(keptAttempts()).toEqual([
      {
        id: answered.attempt?.id,
        request,
        acceptedAt: answered.attempt?.acceptedAt,
        publication: { kind: "unknown" },
      },
    ]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(await runningStarts(server)).toEqual([]);
  });
});
