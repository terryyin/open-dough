// The Sessions sidebar says when the server cannot raise its macOS alerts
// (./session-alerts.spec.ts is the alerts themselves): the open sidebar shows
// "Alerts unavailable" with one of two fixed reasons while the latest
// `osascript` the server ran (a start probe, then each notification) did not
// work, says nothing while it does, and loses the note at the next read of the
// machine's sessions after a notification worked again. A closed sidebar
// shows no note and the Sessions button is as before. The synthetic `claude`
// (./fixtures/fake-claude) and `osascript` (./fixtures/fake-osascript) are all
// the server reaches; a real notification is never raised.

import { expect, test as base, type Page } from "@playwright/test";
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
import { sidebarParts } from "./sessionSidebarPage.ts";

const test = base.extend<{
  osascript: FakeClaudeOptions["osascript"];
  server: DashboardServer;
}>({
  osascript: [undefined, { option: true }],
  server: async ({ osascript }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      projectFolders: ["open-dough"],
      alertCheckMs: 100,
      osascript,
    });
    await use(server);
    await server.close();
  },
});

const notFound =
  "osascript was not found on this machine, so alerts need macOS";
const refused = "macOS did not accept the notification";

const noteOf = (page: Page) => page.getByText(/Alerts unavailable/);

// Opens the page with the sidebar open, after the server has probed.
async function openSidebar(server: DashboardServer, page: Page) {
  await page.goto(server.baseURL);
  const { sidebar, button } = sidebarParts(page);
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

test.describe("a working osascript", () => {
  test("leaves the open sidebar without a note", async ({ server, page }) => {
    await expect.poll(() => server.osascriptProbes().length).toBe(1);
    expect(await alertsAnswered(server)).toEqual({ available: true });
    const { sidebar } = await openSidebar(server, page);
    await expect(
      sidebar.getByRole("heading", { name: "Sessions" }),
    ).toBeVisible();
    await expect(noteOf(page)).toHaveCount(0);
  });
});

test.describe("no osascript on the machine", () => {
  test.use({ osascript: "absent" });

  test("the open sidebar says Alerts unavailable and why, and still lists sessions; closed, the note is not on the page", async ({
    server,
    page,
  }) => {
    await launch(server, launchRequest);
    await expect
      .poll(() => alertsAnswered(server))
      .toEqual({ available: false, reason: notFound });

    await page.goto(server.baseURL);
    const { sidebar, button } = sidebarParts(page);
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

test.describe("an osascript that refuses", () => {
  test.use({ osascript: "failing" });

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

    server.osascriptBecomes("working");
    const response = await launch(server, launchRequest);
    const session = (
      JSON.parse(response.body) as {
        record: { session: { sessionId: string } };
      }
    ).record.session.sessionId;
    expect(await machineSessions(server)).toHaveLength(1);
    server.claudeSessionBecomes(session, "blocked", "Which database?");
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
    expect(await alertsAnswered(server)).toEqual({ available: true });

    await page.reload();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("listitem")).toHaveCount(1);
    await expect(noteOf(page)).toHaveCount(0);
  });
});
