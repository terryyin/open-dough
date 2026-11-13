// The page and boundary of the unread report journeys
// (../../../e2e/sessions/session-unread-report.spec.ts,
// ../sessions/session-unread-report-message.spec.ts): a real start origin,
// published to the page (./startOriginTest.ts), with sessions that report
// through ./reportedLaunch.ts, how their Sessions sidebar rows and cards show
// that, and what the store says of them.

import { expect, type Locator, type Page } from "@playwright/test";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { parts } from "../dashboardPage.ts";
import {
  expectTooltipLine,
  sessionsSidebarParts,
} from "../sessionsSidebarPage.ts";
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

export const sidebarRow = (page: Page, title: string) =>
  sessionsSidebarParts(page)
    .sidebar.getByRole("listitem")
    .filter({ hasText: title });

// The Sessions sidebar's session titles, top to bottom.
export const sidebarTitles = (page: Page) =>
  sessionsSidebarParts(page).entries.locator("h3").allTextContents();

// An unread report adds a named mark to its row, a matching tooltip line and
// a tint distinct from the `unmarked` row's.
export async function expectMarked(
  row: Locator,
  unmarked: Locator,
): Promise<void> {
  await expect(row.getByRole("img", { name: unreadWords })).toBeVisible();
  await expectTooltipLine(row, unreadWords);
  const background = (entry: Locator) =>
    entry.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(await background(row)).not.toBe(await background(unmarked));
}

// The Sessions sidebar's badge and the story's card each count one session
// needing attention.
export async function expectOneNeedingAttention(page: Page, card: Locator) {
  const { badge } = sessionsSidebarParts(page);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await expect(card.locator(".story-card-attention")).toHaveText(
    "1 session needs attention",
  );
}

// The session's stored record.
export async function recordOf(
  dashboard: DashboardServer,
  sessionId: string,
): Promise<LaunchRecord | undefined> {
  return ((await recordsOf(dashboard, "open-dough")) as LaunchRecord[]).find(
    (record) => record.session.sessionId === sessionId,
  );
}
