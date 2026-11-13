// The alerts-unavailable reading after a notification is refused
// (../../server/sessionAlerts.ts): the Open Dough notification sender passed
// its diagnostics, so the refusal is explained in a fixed sentence without
// its raw stderr, and the next transition's notification recovers it. The
// sidebar note that shows the reading:
// ../../../e2e/sessions/session-alerts-unavailable.spec.ts. The synthetic
// `claude` (../../tests/fixtures/fake-claude) and the sender
// (../../tests/fixtures/fake-terminal-notifier) are all the server reaches; a
// real notification is never raised.

import { expect, test as base } from "../../tests/support/pageTest.ts";
import {
  alertsAnswered,
  alertsSettled,
  launch,
  launchRequest,
} from "../../tests/agentLaunchBoundary.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import type { FakeClaudeOptions } from "../../tests/support/fakeClaude.ts";
import {
  afterFurtherListings,
  becomes,
} from "../../tests/support/sessionAlerts.ts";

const test = base.extend<{
  notifier: FakeClaudeOptions["notifier"];
  server: DashboardServer;
}>({
  notifier: [undefined, { option: true }],
  server: async ({ notifier }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      projectFolders: ["open-dough"],
      alertCheckMs: 100,
      notifier,
    });
    await use(server);
    await server.close();
  },
});

const refused =
  "Open Dough did not accept the notification. Turn on Allow notifications in System Settings → Notifications → Open Dough, or run npm run setup-notifier:dashboard -- --test and choose Allow when macOS asks.";

test.describe("a notification refused after successful diagnostics", () => {
  test.use({ notifier: "send-failing" });
  test("explains refusal without raw stderr and recovers on the next transition", async ({
    server,
  }) => {
    await alertsSettled(server);
    const response = await launch(server, launchRequest);
    const session = (
      JSON.parse(response.body) as {
        record: { session: { sessionId: string } };
      }
    ).record.session.sessionId;
    // Let the working baseline settle before the attention transition.
    await afterFurtherListings(server);
    server.claudeSessionBecomes(session, "blocked");
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: false, reason: refused });
    expect(server.notifierCalls()).toHaveLength(1);
    server.notifierBecomes("working");
    await becomes(server, session, "working");
    server.claudeSessionBecomes(session, "blocked");
    // The retry's diagnostics answer available before its notification ends.
    await expect.poll(() => server.notifierCalls().length).toBe(2);
    await alertsSettled(server);
    expect(server.notifierProbes()).toHaveLength(4);
  });
});
