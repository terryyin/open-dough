import { expect, test } from "../support/pageTest.ts";
import {
  accept,
  continueAttempt,
  launchRequest,
  recordsOf,
} from "../agentLaunchBoundary.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import {
  startOrigin,
  queuedIdentity,
  queuedTitle,
} from "../support/startOrigin.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { settledOutcome } from "../acceptedAttempts.ts";

test("update drain closes admission and waits through published execution start and durable native confirmation", async () => {
  test.setTimeout(90_000);
  const origin = await startOrigin();
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
  });
  const push = origin.holdPushes();
  server.claudeScenario("held");
  try {
    const request = {
      ...launchRequest,
      identity: queuedIdentity,
      title: queuedTitle,
    };
    const accepted = JSON.parse((await accept(server, request)).body) as {
      attempt: { id: string };
    };
    await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
    let drained = false;
    const drain = rawRequest({
      url: `${server.baseURL}/__agent-launch/drain`,
      method: "POST",
      headers: { Origin: server.origin },
    }).then((answer) => {
      drained = true;
      return answer;
    });
    await expect
      .poll(async () => (await accept(server, request)).status)
      .toBe(503);
    expect((await continueAttempt(server, accepted.attempt.id)).status).toBe(
      503,
    );
    expect(drained).toBe(false);
    push.release();
    await expect
      .poll(() => server.claudeLaunchCalls().length, { timeout: 30_000 })
      .toBe(1);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(drained).toBe(false);
    server.releaseHeldClaude();
    expect(await drain).toMatchObject({
      status: 200,
      body: JSON.stringify({ drained: true }),
    });
    expect(await settledOutcome(server, accepted.attempt.id)).toMatchObject({
      kind: "launched",
    });
    expect(await recordsOf(server, "open-dough")).toHaveLength(1);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    push.release();
    server.releaseHeldClaude();
    await server.close();
    origin.cleanup();
  }
});
