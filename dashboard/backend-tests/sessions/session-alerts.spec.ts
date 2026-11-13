// The macOS notification for a session that starts needing the developer,
// raised by the dashboard server itself (../../server/sessionAlerts.ts) with no
// page open: a session this dashboard recorded, not marked done, entering any
// reading other than Working raises one notification. It does not repeat
// after a server restart that finds it there, even through observation gaps,
// and raises nothing when the listing cannot be read. Only observed working
// rearms input; missed work and changed reasons stay quiet (full recovery
// journeys: ./session-alerts-input-continuity.spec.ts). A session marked done
// never alerts (a report's arrival: ./session-alerts-unread-report.spec.ts).
// Closing the server ends a sender it started. Its naming, sound and repeat
// across a page reload: ../../../e2e/sessions/session-alerts.spec.ts. The
// synthetic `claude` (../../tests/fixtures/fake-claude) and sender
// (../../tests/fixtures/fake-terminal-notifier) are all the server reaches; a
// real notification is never raised. The server reads the sessions every
// 100 ms here; "nothing more" is asserted only after the fake `claude` has
// logged further listings, never after a sleep.

import { expect } from "@playwright/test";
import { launchRequest, markDone } from "../../tests/agentLaunchBoundary.ts";
import { distinctStoryRequest } from "../../tests/openStorySessionSetup.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { waitUntil } from "../../tests/support/waitUntil.ts";
import { processRunning } from "../../tests/support/processGroup.ts";
import {
  afterFurtherListings,
  alertCheckMs,
  becomes,
  messages,
  start,
  test,
} from "../../tests/support/sessionAlerts.ts";

test.describe("a session that starts needing the developer raises one macOS notification", () => {
  test("raises one for each other reading: ready for review, failed, stopped, unavailable, and not recognized", async ({
    server,
  }) => {
    const changes = [
      "done-live",
      "failed",
      "stopped",
      "forgotten",
      "unrecognized",
    ] as const;
    const sessions: string[] = [];
    while (sessions.length < changes.length) {
      sessions.push(
        await start(
          server,
          distinctStoryRequest(
            `alert-${sessions.length}`,
            launchRequest,
            `Alert story ${sessions.length}`,
          ),
        ),
      );
    }
    await afterFurtherListings(server);
    for (const [index, change] of changes.entries()) {
      const id = sessions[index] ?? "?";
      server.claudeSessionBecomes(id, change);
    }
    await expect.poll(() => server.notifierCalls().length).toBe(5);
    await afterFurtherListings(server);
    expect(messages(server).sort()).toEqual([
      "Ready for review",
      "Session failed",
      "Session stopped",
      "Session unavailable",
      "State not recognized",
    ]);
  });

  test("raises nothing when Claude Code's listing cannot be read", async ({
    server,
  }) => {
    await start(server);
    await afterFurtherListings(server);
    server.claudeListingFails(true);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toEqual([]);
  });

  test("never raises one for a session marked done, even when it stops", async ({
    server,
  }) => {
    const session = await start(server);
    const response = await markDone(server, {
      source: "open-dough",
      session,
    });
    expect(response.status).toBe(200);
    await afterFurtherListings(server);
    await becomes(server, session, "stopped");
    expect(server.notifierCalls()).toEqual([]);
  });

  test("stays quiet for a session a restarted server finds already needing the developer, and raises one when it leaves and re-enters", async ({
    machine,
  }) => {
    const first = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      machine,
      projectFolders: ["open-dough"],
    });
    let session: string;
    try {
      session = await start(first);
      first.claudeSessionBecomes(session, "blocked", "Which database?");
    } finally {
      await first.close();
    }
    const second = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
    });
    try {
      await afterFurtherListings(second);
      expect(second.notifierCalls()).toEqual([]);
      second.claudeListingFails(true);
      await afterFurtherListings(second);
      second.claudeListingFails(false);
      await afterFurtherListings(second);
      expect(second.notifierCalls()).toEqual([]);
      await becomes(second, session, "working");
      second.claudeSessionBecomes(session, "blocked", "Which database?");
      await expect.poll(() => second.notifierCalls().length).toBe(1);
    } finally {
      await second.close();
    }
  });

  test("raises one for a session launched after the server started only once it needs the developer", async ({
    server,
  }) => {
    const session = await start(server);
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toEqual([]);
    server.claudeSessionBecomes(session, "blocked");
    await expect.poll(() => server.notifierCalls().length).toBe(1);
  });

  test("closing the server ends a notifier it started and stops reading the sessions", async ({
    machine,
  }) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
      notifier: "hang",
    });
    let held: number | undefined;
    try {
      const session = await start(server);
      await afterFurtherListings(server);
      server.claudeSessionBecomes(session, "blocked");
      expect(
        await waitUntil(() => server.heldNotifierPid() !== undefined, {
          timeoutMs: 10_000,
        }),
      ).toBe(true);
      held = server.heldNotifierPid();
      expect(processRunning(held)).toBe(true);
    } finally {
      await server.close();
    }
    expect(processRunning(held)).toBe(false);
    expect(server.heldNotifierEndedBy()).toBe("SIGTERM");
  });
});
