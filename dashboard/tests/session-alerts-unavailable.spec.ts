// The Sessions sidebar says when the server cannot raise its macOS alerts
// (./session-alerts.spec.ts is the alerts themselves): the open sidebar shows
// "Alerts unavailable" with a fixed setup explanation while the latest
// probe or notification of the Open Dough notification sender did not work,
// says nothing while it does, and loses the note at the next read of the
// machine's sessions after a notification worked again. A closed sidebar
// shows no note and the Sessions button is as before. The synthetic `claude`
// (./fixtures/fake-claude) and the sender (./fixtures/fake-terminal-notifier)
// are all the server reaches; a real notification is never raised.

import type { Page } from "@playwright/test";
import { expect, test as base } from "./support/pageTest.ts";
import {
  launch,
  launchRequest,
  machineSessions,
} from "./agentLaunchBoundary.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { FakeClaudeOptions } from "./support/fakeClaude.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { afterFurtherListings, becomes } from "./support/sessionAlerts.ts";

const test = base.extend<{
  notifier: FakeClaudeOptions["notifier"];
  server: DashboardServer;
}>({
  notifier: [undefined, { option: true }],
  server: async ({ notifier }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      projectFolders: ["open-dough"],
      alertCheckMs: 100,
      notifier,
    });
    await use(server);
    await server.close();
  },
});

const notFound =
  "The Open Dough notification sender is not set up. Run npm run setup-notifier:dashboard -- --test, allow Open Dough when macOS asks, then restart the dashboard.";
const refused =
  "Open Dough did not accept the notification. Turn on Allow notifications in System Settings → Notifications → Open Dough, or run npm run setup-notifier:dashboard -- --test and choose Allow when macOS asks.";

const noteOf = (page: Page) => page.getByText(/Alerts unavailable/);

// Opens the page with the sidebar open, after the server has probed.
async function openSidebar(server: DashboardServer, page: Page) {
  await page.goto(server.baseURL);
  const { sidebar, button } = sessionsSidebarParts(page);
  await button.click();
  await expect(sidebar).toBeVisible();
  return { sidebar, button };
}

// The `alerts` field of the machine's sessions answer.
async function alertsAnswered(server: DashboardServer): Promise<unknown> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  return (JSON.parse(response.body) as { alerts: unknown }).alerts;
}

test.describe("a working notifier", () => {
  test("leaves the open sidebar without a note", async ({ server, page }) => {
    await expect.poll(() => server.notifierProbes().length).toBe(2);
    expect(await alertsAnswered(server)).toEqual({ available: true });
    const { sidebar } = await openSidebar(server, page);
    await expect(
      sidebar.getByRole("heading", { name: "Sessions" }),
    ).toBeVisible();
    await expect(noteOf(page)).toHaveCount(0);
  });
});

test.describe("no Open Dough sender set up, only terminal-notifier on PATH", () => {
  test.use({ notifier: "absent" });

  test("the open sidebar says Alerts unavailable and why, and still lists sessions; closed, the note is not on the page", async ({
    server,
    page,
  }) => {
    await launch(server, launchRequest);
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: false, reason: notFound });
    // The helper on PATH is not the sender: it was never run.
    expect(server.notifierProbes()).toEqual([]);

    await page.goto(server.baseURL);
    const { sidebar, button } = sessionsSidebarParts(page);
    await expect(button).toHaveAccessibleName(/^Sessions/);
    await expect(noteOf(page)).toHaveCount(0);
    const closedName = await button.textContent();

    await button.click();
    await expect(sidebar).toBeVisible();
    await expect(
      sidebar.getByText(`Alerts unavailable: ${notFound}`),
    ).toBeVisible();
    await expect(sidebar.getByRole("listitem")).toHaveCount(1);
    await expect(
      sidebar.getByRole("heading", { name: launchRequest.title }),
    ).toBeVisible();

    await button.click();
    await expect(sidebar).toBeHidden();
    await expect(noteOf(page)).toHaveCount(0);
    expect(await button.textContent()).toBe(closedName);
  });
});

test.describe("a notifier that refuses", () => {
  test.use({ notifier: "failing" });

  test("the note gives the refusal, and goes at the next read after a notification worked", async ({
    server,
    page,
  }) => {
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: false, reason: refused });
    const { sidebar } = await openSidebar(server, page);
    await expect(
      sidebar.getByText(`Alerts unavailable: ${refused}`),
    ).toBeVisible();

    server.notifierBecomes("working");
    const response = await launch(server, launchRequest);
    const session = (
      JSON.parse(response.body) as {
        record: { session: { sessionId: string } };
      }
    ).record.session.sessionId;
    expect(await machineSessions(server)).toHaveLength(1);
    server.claudeSessionBecomes(session, "blocked", "Which database?");
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    expect(await alertsAnswered(server)).toEqual({ available: true });

    await page.reload();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("listitem")).toHaveCount(1);
    await expect(noteOf(page)).toHaveCount(0);
  });
});

for (const mode of ["older", "unknown-version"] as const) {
  test.describe(`a ${mode} helper`, () => {
    test.use({ notifier: mode });
    test("does not treat an existing executable or a successful unknown option as alert availability", async ({
      server,
      page,
    }) => {
      const reason =
        "Alerts need terminal-notifier 3.1 or newer. Update it separately, run npm run setup-notifier:dashboard again, then restart the dashboard.";
      await expect
        .poll(() => alertsAnswered(server))
        .toEqual({ available: false, reason });
      expect(server.notifierProbes()).toEqual([{ argv: ["-version"] }]);
      expect(server.notifierCalls()).toEqual([]);
      const { sidebar } = await openSidebar(server, page);
      await expect(
        sidebar.getByText(`Alerts unavailable: ${reason}`),
      ).toBeVisible();
    });
  });
}

test.describe("a notification refused after successful diagnostics", () => {
  test.use({ notifier: "send-failing" });
  test("explains refusal without raw stderr and recovers on the next transition", async ({
    server,
  }) => {
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: true });
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
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: true });
    expect(server.notifierProbes()).toHaveLength(4);
  });
});
