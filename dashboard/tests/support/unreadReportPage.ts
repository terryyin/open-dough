// The page and boundary of the unread report journeys
// (../session-unread-report*.spec.ts): a real start origin, published to the
// page (./startOriginTest.ts), with sessions that report through
// ./reportedLaunch.ts, and what the store says of them.

import type { Page } from "@playwright/test";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { parts } from "../dashboardPage.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { launchWaitMs } from "./launchWait.ts";
import { publishOrigin, test as base } from "./startOriginTest.ts";

export { doneNameOf, shortIdOf } from "./reportedLaunch.ts";
export { publishOrigin };
// Option defaults here, not a module-level test.use, which would reach only
// the first file a worker loads this module for. A file's test.use still wins.
export const test = base.extend({
  projectFolders: ["open-dough"],
  launchTimeoutMs: launchWaitMs,
});

export const titleA = "Story A";
export const unreadWords = "Unread report: Completed with attention";
export const newerMessage =
  "Retirement is held. Resolve ownership before continuing.";

export const takenStoryCard = (page: Page, title: string) =>
  parts(page).taken.getByRole("article", { name: title, exact: true });

// The session's stored record.
export async function recordOf(
  dashboard: DashboardServer,
  sessionId: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === sessionId,
  );
}
