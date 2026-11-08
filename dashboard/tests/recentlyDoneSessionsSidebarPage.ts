// The Sessions sidebar's Recently done sessions section and the shared
// three-list room its journeys observe with the open list and Running Cursor
// sessions. Seeds use the real machine store; destinations reuse PageFrame.
import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  agentLaunchEndpoint,
  recentlyDoneSessionsInitialLimit,
} from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sessionsAudienceParameter } from "../src/machineSessionsRevision.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { chooseProject, parts } from "./dashboardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { describedBacklog } from "./describedRevisions.ts";
import { publishOnePygardonStory } from "./pygardonProject.ts";
import { box } from "./pageLayout.ts";
import {
  answerCrowd,
  changesAsked,
  crowd,
  holdSession,
  keepCrowd,
  runningCursorParts,
  showPage,
} from "./runningCursorSessionsPage.ts";
import { sessionsSidebarParts } from "./sessionsSidebarPage.ts";
import { expect, keptRecord } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import { keepMoreLaunchRecords } from "./support/launchStore.ts";
import type { StartOrigin } from "./support/startOrigin.ts";

export const recentlyDoneHeightKey =
  "open-dough.sessionsSidebar.recentlyDoneHeight";

export function recentlyDoneParts(page: Page) {
  const { sidebar, button, entries: openEntries } = sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Recently done sessions",
  });
  const entries = region.locator("li.sessions-sidebar-session-entry");
  return {
    sidebar,
    button,
    // Open-list entries only (scoped in sessionsSidebarPage).
    openEntries,
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    region,
    header: region.getByRole("button", { name: "Recently done sessions" }),
    list: sidebar.locator(".sessions-sidebar-sessions"),
    body: region.locator(".recently-done-sessions-body"),
    entries,
    // A row's Select control, named by its title, and its separate Open
    // control, named by the access it opens and described by the title.
    entry: (title: string) => region.getByRole("button", { name: title }),
    open: (title: string) =>
      entries
        .filter({ has: page.getByRole("button", { name: title }) })
        .getByRole("button", { name: /^(Open terminal|Read final report)$/ }),
    divider: sidebar.getByRole("separator", {
      name: "Recently done sessions divider",
      exact: true,
    }),
    running: runningCursorParts(page),
  };
}

// Resolves on the page's sessions read that shows `held` reopened. Only the
// attach's admission signal, which follows first paint, makes the page read
// the reopen; a Close before it arrives leaves the Done row until the next
// sessions check. Arm it before the attach so no answer is missed.
export function pageReadReopened(page: Page, held: LaunchRecord) {
  return page.waitForResponse(async (response) => {
    const url = new URL(response.url());
    if (
      url.pathname !== agentLaunchEndpoint ||
      url.searchParams.has(sessionsAudienceParameter) ||
      response.request().method() !== "GET" ||
      !response.ok()
    )
      return false;
    const answer = (await response.json().catch(() => undefined)) as
      { readonly records?: readonly LaunchRecord[] } | undefined;
    return (
      answer?.records?.some(
        (record) =>
          sessionKey(record.session) === sessionKey(held.session) &&
          record.doneAt === undefined,
      ) === true
    );
  });
}

// Publishes Doughnut and Pygardon, each queuing one story, beside the Open
// Dough origin already shown.
export async function publishSiblingProjects(page: Page) {
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  doughnut.push(
    "d4".repeat(20),
    describedBacklog(
      makeMe.aRepository
        .withRevision("published", {
          backlog: {
            queued: [
              makeMe.aBacklogEntry
                .with({
                  identity: "SEED-401#s",
                  title: "A Doughnut story",
                  href: "seeds/SEED-401.md#s",
                })
                .please(),
            ],
          },
        })
        .please(),
    ),
  );
  await publishOnePygardonStory(page);
}

export async function showThreeProjectPage(page: Page, origin: StartOrigin) {
  await publishSiblingProjects(page);
  await showPage(page, origin);
  await chooseProject(page, "Pygardon");
  await expect(parts(page).backlog).toContainText("A Pygardon story");
}

export const heightOf = async (area: Locator) => (await box(area)).height;

export const roomOfThree = async (shown: {
  list: Locator;
  body: Locator;
  running: { body: Locator };
}) =>
  (await heightOf(shown.list)) +
  (await heightOf(shown.body)) +
  (await heightOf(shown.running.body));

// Crowded open list, crowded Running Cursor rows, and many Done rows so all
// three lists overflow while both optional sections are expanded.
export async function expandThreeCrowded(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  cursor: FakeCursor,
) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const pid = await holdSession(dashboard, cursor);
  const held = keptRecord(dashboard.home);
  keepCrowd(dashboard, held);
  const now = Date.now();
  const done = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const title = `Done crowded ${String(index + 1)}`;
    const sessionId = dashboard.claudeListsSession({
      name: title,
      cwd: dashboard.home,
      startedAt: now - (index + 1) * 120_000,
    });
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title })
      .inClaudeSession({ sessionId })
      .launchedAt(new Date(now - (index + 1) * 120_000).toISOString())
      .markedDoneAt(new Date(now - (index + 1) * 60_000).toISOString())
      .please();
  });
  keepMoreLaunchRecords(dashboard, done);
  const asked = changesAsked(page);
  await showPage(page, origin);
  await answerCrowd(page, held);
  const calls = cursor.calls().length;
  const shown = recentlyDoneParts(page);
  const heldRows = shown.running.region.getByRole("button", {
    name: /Open Dough/,
  });
  await shown.button.click();
  await shown.header.click();
  await shown.running.header.click();
  await expect(shown.openEntries).toHaveCount(crowd + 1);
  await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  await expect(heldRows).toHaveCount(crowd);
  const expectNothingChanged = () => {
    expect(asked).toEqual([]);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
  };
  return { shown, heldRows, expectNothingChanged, done };
}
