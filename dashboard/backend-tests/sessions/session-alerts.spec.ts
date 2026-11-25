// Closing the server ends a sender SessionAlerts started and stops reading
// the sessions. Reading and startup alert cases live in
// ./session-alerts-reading.spec.ts. Naming, sound and repeat across a page
// reload: ../../../e2e/sessions/session-alerts.spec.ts. The synthetic sender
// (../../test-support/fixtures/fake-terminal-notifier) is all the server
// reaches; a real notification is never raised.

import { expect } from "@playwright/test";
import { composeSession } from "../../test-support/agentTerminalBoundary.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import {
  afterFurtherListings,
  alertCheckMs,
  test,
} from "../../test-support/support/sessionAlerts.ts";

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
    const { sessionId: session } = await composeSession(server);
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
