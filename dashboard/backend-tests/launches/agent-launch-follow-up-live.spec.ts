// A second dashboard server sees the machine's active follow-up attempt even
// after the source session expires.

import { keptAttempts, settledOutcome } from "../../tests/acceptedAttempts.ts";
import { accept, attempts } from "../../tests/agentLaunchBoundary.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import { followUpOf } from "../../tests/support/followUpSources.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { reported, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

test("repeating a follow-up active on another server answers with the running attempt after source expiry", async ({
  dashboard,
  origin,
}) => {
  const other = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
  });
  try {
    const source = reported(dashboard.home);
    keepLaunchRecords(dashboard, [source]);
    const followUp = {
      ...request,
      instruction: "Check the cache again",
      followUp: followUpOf(source),
    };
    dashboard.claudeScenario("held");
    expect(JSON.parse((await accept(dashboard, followUp)).body)).toMatchObject({
      kind: "accepted",
    });
    const [started] = keptAttempts(dashboard);
    if (started === undefined) throw new Error("Missing active attempt");
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(await attempts(other)).toEqual([
      expect.objectContaining({ id: started.id, owned: false, running: true }),
    ]);
    keepLaunchRecords(dashboard, []);

    const repeated = await accept(other, followUp);
    expect(repeated.status, repeated.body).toBe(200);
    expect(JSON.parse(repeated.body)).toMatchObject({
      kind: "uncertain",
      reason: "unconfirmed",
      explanation:
        "This start is already running on this machine. Wait for its result; nothing new was started.",
    });
    expect(keptAttempts(other).map(({ id }) => id)).toEqual([started.id]);
    expect(other.claudeLaunchCalls()).toHaveLength(1);

    dashboard.releaseHeldClaude();
    expect(await settledOutcome(dashboard, started.id)).toMatchObject({
      kind: "launched",
    });
  } finally {
    dashboard.releaseHeldClaude();
    await other.close();
  }
});
