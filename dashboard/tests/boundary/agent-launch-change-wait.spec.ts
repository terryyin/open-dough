// A wait for an accepted attempt's change (../../server/launchAttemptChanges.ts),
// over raw HTTP with the synthetic `claude` holding the session launch: the
// wait names how many changes its asker's observation counted, so a change
// told while nothing waited -- here the worker's move from the start to the
// session launch -- is answered at once instead of being missed until the
// attempt settles, and a wait naming the current count answers at the next
// change. What the page says from those answers is
// ../agent-launch-start-story-card.spec.ts.

import { expect, test } from "../support/pageTest.ts";
import {
  agentChangedEndpoint,
  type AttemptObservation,
} from "../../src/agentLaunch.ts";
import { accept, attempts, launchRequest } from "../agentLaunchBoundary.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { rawRequest } from "../support/rawHttp.ts";

test("a wait naming the changes its asker saw answers at once a change told while nothing waited, and otherwise at the next change", async () => {
  test.setTimeout(120_000);
  const server = await startDashboardServer({
    mode: "boundary",
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
  });
  try {
    server.claudeScenario("held");
    const changedSince = async (id: string, seen: number) => {
      const response = await rawRequest({
        url: `${server.baseURL}${agentChangedEndpoint}?attempt=${id}&seen=${String(seen)}`,
        headers: { Origin: server.origin },
      });
      expect(response.status).toBe(200);
      return JSON.parse(response.body) as {
        changed: boolean;
        attempt?: AttemptObservation;
      };
    };

    const { attempt: accepted } = JSON.parse(
      (await accept(server, launchRequest)).body,
    ) as { attempt?: AttemptObservation };
    if (accepted === undefined) throw new Error("The launch was not accepted");
    expect(accepted).toMatchObject({ changes: 0, worker: { step: "start" } });
    const counted = (attempt: AttemptObservation | undefined): number => {
      if (attempt?.changes === undefined) throw new Error("No change count");
      return attempt.changes;
    };

    // Nothing waits while the server moves on to the session launch.
    await expect
      .poll(
        async () =>
          (await attempts(server)).find(({ id }) => id === accepted.id)?.worker
            ?.step,
        { timeout: 30_000 },
      )
      .toBe("launch");

    const missed = await changedSince(accepted.id, counted(accepted));
    expect(missed).toMatchObject({
      changed: true,
      attempt: { worker: { step: "launch" }, running: true },
    });
    expect(missed.attempt?.outcome).toBeUndefined();
    expect(counted(missed.attempt)).toBeGreaterThan(0);

    // Nothing changed since that answer, so this wait lasts until the held
    // session launch is released and the attempt settles.
    const next = changedSince(accepted.id, counted(missed.attempt));
    server.releaseHeldClaude();
    expect((await next).attempt?.outcome).toBeDefined();
  } finally {
    await server.close();
  }
});
