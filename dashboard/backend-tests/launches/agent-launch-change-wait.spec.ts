// A wait for an accepted attempt's change (../../server/launchAttemptChanges.ts),
// over raw HTTP with the synthetic `claude` holding the session launch: the
// wait names how many changes its asker's observation counted, so a change
// told while nothing waited -- here the worker's move from the start to the
// session launch -- is answered at once instead of being missed until the
// attempt settles, and a wait naming the current count answers at the next
// change. A non-owner that has nothing new to tell consumes the configured
// change bound (`DOUGH_CHANGE_WAIT_MS`, production default 30 seconds) instead
// of waking at once, while an unsettled attempt this server's own process
// works on is answered without that bound even before the server holds it.
// What the page says from those answers is
// ../../frontend-tests/launches/story-card-startup.spec.ts and
// ../../../e2e/launches/agent-launch-second-server.spec.ts.

import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  agentChangedEndpoint,
  type AttemptObservation,
} from "../../src/agentLaunch.ts";
import { accept, attempts } from "../../test-support/agentLaunchBoundary.ts";
import { keepMoreAttemptsBesideServer } from "../../test-support/acceptedAttempts.ts";
import { request } from "../../test-support/keptExecutionStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { startOrigin } from "../../test-support/support/startOrigin.ts";
import { queuedExecution } from "../support/installedClaudeLaunch.ts";

async function changedBody(server: DashboardServer, id: string, seen?: number) {
  const query =
    seen === undefined ? `attempt=${id}` : `attempt=${id}&seen=${String(seen)}`;
  const response = await rawRequest({
    url: `${server.baseURL}${agentChangedEndpoint}?${query}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return JSON.parse(response.body) as {
    changed: boolean;
    attempt?: AttemptObservation;
  };
}

async function workerStep(server: DashboardServer, id: string) {
  return (await attempts(server)).find((attempt) => attempt.id === id)?.worker
    ?.step;
}

test("a wait naming the changes its asker saw answers at once a change told while nothing waited, and otherwise at the next change", async () => {
  const server = await startDashboardServer({
    mode: "boundary",
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
  });
  try {
    server.claudeScenario("held");
    const { attempt: accepted } = JSON.parse(
      (await accept(server, queuedExecution)).body,
    ) as { attempt?: AttemptObservation };
    if (accepted === undefined) throw new Error("The launch was not accepted");
    expect(accepted).toMatchObject({ changes: 0, worker: { step: "start" } });
    const counted = (attempt: AttemptObservation | undefined): number => {
      if (attempt?.changes === undefined) throw new Error("No change count");
      return attempt.changes;
    };

    // Nothing waits while the server moves on to the session launch.
    await expect
      .poll(() => workerStep(server, accepted.id), { timeout: 30_000 })
      .toBe("launch");

    const missed = await changedBody(server, accepted.id, counted(accepted));
    expect(missed).toMatchObject({
      changed: true,
      attempt: { worker: { step: "launch" }, running: true },
    });
    expect(missed.attempt?.outcome).toBeUndefined();
    expect(counted(missed.attempt)).toBeGreaterThan(0);

    // Nothing changed since that answer, so this wait lasts until the held
    // session launch is released and the attempt settles.
    const next = changedBody(server, accepted.id, counted(missed.attempt));
    server.releaseHeldClaude();
    expect((await next).attempt?.outcome).toBeDefined();
  } finally {
    await server.close();
  }
});

// Observe the bound without waiting out production's 30 seconds: the server
// under test shortens `DOUGH_CHANGE_WAIT_MS` the same way other dashboard
// timeouts are shortened for tests.
const observedChangeWaitMs = 500;

test("a non-owner with nothing new to tell consumes the configured change bound", async () => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const push = origin.holdPushes();
  let owner: DashboardServer | undefined;
  let observer: DashboardServer | undefined;
  try {
    owner = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 60_000,
      extraEnv: {
        DOUGH_START_TIMEOUT_MS: "10000",
        DOUGH_CHANGE_WAIT_MS: String(observedChangeWaitMs),
      },
    });
    owner.claudeScenario("held");
    const { attempt: accepted } = JSON.parse(
      (await accept(owner, request)).body,
    ) as { attempt?: AttemptObservation };
    if (accepted === undefined) throw new Error("The launch was not accepted");
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
    observer = await startDashboardServer({
      mode: "boundary",
      liveServer: "separate process",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 60_000,
      extraEnv: {
        DOUGH_START_TIMEOUT_MS: "10000",
        DOUGH_CHANGE_WAIT_MS: String(observedChangeWaitMs),
      },
    });
    const [live] = await attempts(observer);
    expect(live).toMatchObject({
      id: accepted.id,
      owned: false,
      running: true,
      worker: { step: "start", pid: expect.any(Number) },
    });
    const began = Date.now();
    expect(await changedBody(observer, accepted.id)).toMatchObject({
      changed: false,
    });
    expect(Date.now() - began).toBeGreaterThanOrEqual(observedChangeWaitMs);

    // The held start outlives its server, so it ends here, its push through,
    // before its origin is removed.
    push.release();
    const starter = owner;
    await expect
      .poll(() => workerStep(starter, accepted.id), { timeout: 30_000 })
      .toBe("launch");
  } finally {
    push.release();
    await observer?.close();
    await owner?.close();
    origin.cleanup();
  }
});

// Admission keeps an attempt with this server's worker before it holds the
// attempt in memory; a wait asked in between must not take the non-owner
// bound for a change this server is about to tell.
test("an unsettled attempt this server's own process works on is answered without the non-owner bound", async () => {
  const nonOwnerBoundMs = 20_000;
  const server = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    projectFolders: ["open-dough"],
    extraEnv: { DOUGH_CHANGE_WAIT_MS: String(nonOwnerBoundMs) },
  });
  try {
    const id = "00000000-0000-4000-8000-0000000000c1";
    await keepMoreAttemptsBesideServer(server, [
      makeMe.anAcceptedAttempt
        .withId(id)
        .requesting(queuedExecution)
        .workedBy({
          pid: server.pid,
          serverPid: server.pid,
          step: "start",
          notedAt: new Date().toISOString(),
        })
        .please(),
    ]);
    const [kept] = await attempts(server);
    expect(kept).toMatchObject({ id, owned: false, running: true });
    const began = Date.now();
    expect(await changedBody(server, id)).toMatchObject({ changed: true });
    expect(Date.now() - began).toBeLessThan(nonOwnerBoundMs);
  } finally {
    await server.close();
  }
});
