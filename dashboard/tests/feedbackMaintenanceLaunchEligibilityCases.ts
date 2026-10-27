// Cases registered by ./feedback-maintenance-launch.spec.ts.

import { launch, markDone } from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import { noConnection, publishMovingOrigin } from "./publishedOrigin.ts";

import { rawRequest } from "./support/rawHttp.ts";
import { diagnosticsUrl } from "./support/readDiagnostics.ts";

import { afterFurtherListings } from "./support/sessionAlerts.ts";
import { startOrigin } from "./support/startOrigin.ts";
import { dayFromToday } from "./support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  invocation,
  maintenanceRecords,
  pushWatchList,
  refReads,
  serverOn,
  turnOff,
  turnOn,
  watchListDue,
} from "./support/feedbackMaintenanceServer.ts";

test("not yet due, turned off, no due block, or a failed read starts nothing and notifies nothing; the failed read shows in the read diagnostics", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    // An unrelated open session neither blocks the check nor counts as one.
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: "Why is CI slow on main?",
        })
      ).status,
    ).toBe(200);
    turnOn(origin);
    // The ref read fails.
    const failed = moving.answerWith("main", noConnection);
    pushWatchList(moving, watchListDue(dayFromToday(-1)));
    await afterFurtherChecks(moving);
    const diagnostics = await rawRequest({
      url: diagnosticsUrl(server),
      headers: { Origin: server.origin },
    });
    expect(
      (JSON.parse(diagnostics.body) as { failures: { category: string }[] })
        .failures,
    ).toContainEqual(expect.objectContaining({ category: "ref" }));
    failed();

    pushWatchList(moving, watchListDue(dayFromToday(1)));
    await afterFurtherChecks(moving);
    pushWatchList(moving, "# Near-term watch list\n\nNo block yet.\n");
    await afterFurtherChecks(moving);
    pushWatchList(moving);
    await afterFurtherChecks(moving);

    // Off: the due list starts nothing and GitHub is not asked.
    turnOff(origin);
    pushWatchList(moving, watchListDue(dayFromToday(-1)));
    // A check that read the setting before it was removed may still ask.
    await afterFurtherListings(server);
    const asked = refReads(moving);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(refReads(moving)).toBe(asked);

    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(
      (await maintenanceRecords(server)).map(({ request }) => request.title),
    ).toEqual(["Why is CI slow on main?"]);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("a developer's open session with the cycle's invocation is the machine's feedback maintenance session: nothing more starts while it is open", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  pushWatchList(moving, watchListDue(dayFromToday(-1)));
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: invocation,
        })
      ).status,
    ).toBe(200);
    const [manual] = await maintenanceRecords(server);
    expect(manual?.request.title).toBe(invocation);
    turnOn(origin);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(refReads(moving)).toBe(0);
    expect(server.claudeLaunchCalls()).toHaveLength(1);

    // A page cannot mark its own launch as the automatic one.
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: invocation,
          maintenance: { due: dayFromToday(-1) },
        })
      ).status,
    ).toBe(400);

    // Once the developer marks it done, the due date is launched once.
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: manual?.session.sessionId,
        })
      ).status,
    ).toBe(200);
    await expect.poll(() => server.claudeLaunchCalls().length).toBe(2);
    await afterFurtherListings(server);
    expect(server.claudeLaunchCalls()).toHaveLength(2);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
