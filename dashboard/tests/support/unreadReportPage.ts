// The page and boundary of the unread report journeys
// (../session-unread-report*.spec.ts): a real start origin, published to the
// page, with sessions that report through ./reportedLaunch.ts, and what the
// fake `claude` and the store say of them.

import type { Page } from "@playwright/test";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { test as base } from "../dashboardTest.ts";
import { sidebarParts } from "../sessionSidebarPage.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";

export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin();
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

export const titleA = "Story A";
export const unreadWords = "Unread report: Completed with attention";
export const newerMessage =
  "Retirement is held. Resolve ownership before continuing.";

// Publishes the origin's main to the page, which follows it.
export async function publishOrigin(
  page: Page,
  origin: StartOrigin,
): Promise<void> {
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
}

export const takenCard = (page: Page, title: string) =>
  parts(page).taken.getByRole("article", { name: title, exact: true });

export const sidebarRow = (page: Page, title: string) =>
  sidebarParts(page).sidebar.getByRole("listitem").filter({ hasText: title });

// The session's listed name and short id, as Claude Code lists them.
const listedOf = (dashboard: DashboardServer, sessionId: string) => {
  const listed = dashboard
    .claudeListing()
    .find((session) => session["sessionId"] === sessionId);
  if (listed === undefined) throw new Error(`${sessionId} is not listed`);
  return listed;
};
export const doneNameOf = (dashboard: DashboardServer, sessionId: string) =>
  `done-${String(listedOf(dashboard, sessionId)["name"])}`;
export const shortIdOf = (dashboard: DashboardServer, sessionId: string) =>
  String(listedOf(dashboard, sessionId)["id"]);

// Every `claude stop` the dashboard has asked for.
export const stopsOf = (dashboard: DashboardServer) =>
  dashboard.claudeCalls().filter((call) => call.argv[0] === "stop");

// The session's stored record.
export async function recordOf(
  dashboard: DashboardServer,
  sessionId: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === sessionId,
  );
}
