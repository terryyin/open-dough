// A development notification case starts its server through the session-alert
// journey's own dev fixture, so the outer proof
// (runtime/test-preparation-dev-notifications.spec.ts) observes what serving
// from source prepares.
import { expect, test } from "../../dashboardTest.ts";
import { dashboardServedIn } from "../../support/sessionAlertServers.ts";

test.use({ dashboard: dashboardServedIn.dev });

test("a development notification server serves the Vite client", async ({
  dashboard,
  request,
}) => {
  const client = await request.get(`${dashboard.origin}/@vite/client`);
  expect(client.ok()).toBe(true);
});
