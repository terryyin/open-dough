// The Sessions sidebar's Recently done sessions section and the shared
// three-list room its journeys observe with the open list and Running Cursor
// sessions. Seeds use the real machine store; destinations reuse PageFrame.
import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
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
import { heightOf, showCrowded } from "./cursorSessionsSidebarResizePage.ts";
import { openRunningList, runningCursorParts } from "./runningCursorList.ts";
import { crowd, showPage } from "./runningCursorSessionsPage.ts";
import {
  openSessionsSidebar,
  sessionsSidebarParts,
  sessionsSidebarSessionEntryTooltipOf,
} from "./sessionsSidebarPage.ts";
import { expect } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { sessionEntryAccessControl } from "./sessionEntryAccess.ts";

export const recentlyDoneHeightKey =
  "open-dough.sessionsSidebar.recentlyDoneHeight";

export function recentlyDoneParts(page: Page) {
  const {
    sidebar,
    button,
    heading,
    list,
    entries: openEntries,
  } = sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Recently done sessions",
  });
  const body = region.locator(".recently-done-sessions-body");
  const entries = region.locator("li.sessions-sidebar-session-entry");
  const row = (title: string) =>
    entries.filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
  return {
    sidebar,
    button,
    // Open-list entries only (scoped in sessionsSidebarPage).
    openEntries,
    heading,
    region,
    header: region.getByRole("button", { name: "Recently done sessions" }),
    list,
    body,
    // Scrolls the body to its end, where the section reveals older rows.
    revealOlder: () =>
      body.evaluate((element) => {
        const scrolled = element;
        scrolled.scrollTop = scrolled.scrollHeight;
        scrolled.dispatchEvent(new Event("scroll", { bubbles: true }));
      }),
    entries,
    // Their titles, in the order the section shows them.
    titles: entries.getByRole("heading", { level: 3 }),
    // The row with exactly this title, and the review cue it shows.
    row,
    reviewCue: (title: string) => sessionReviewCue(row(title)),
    // A row's Select control, named by its title: it selects the session or
    // its done story and opens nothing. Its separate Open control is named by
    // the access it opens (Open terminal or Read final report), described by
    // the title.
    select: (title: string) => region.getByRole("button", { name: title }),
    open: (title: string) =>
      sessionEntryAccessControl(row(title), {
        name: /^(Open terminal|Read final report)$/,
      }),
    divider: sidebar.getByRole("separator", {
      name: "Recently done sessions divider",
      exact: true,
    }),
    running: runningCursorParts(page),
  };
}

export type RecentlyDoneParts = ReturnType<typeof recentlyDoneParts>;

// Opens the Sessions sidebar and expands Recently done sessions, pressing
// Sessions and the section header only where either is still closed.
export async function showRecentlyDone(page: Page): Promise<RecentlyDoneParts> {
  const shown = recentlyDoneParts(page);
  await openSessionsSidebar(page);
  if ((await shown.header.getAttribute("aria-expanded")) !== "true")
    await shown.header.click();
  await expectRecentlyDone(shown, "expanded");
  return shown;
}

// The section is expanded, showing its body, or collapsed without one, and
// its header says the same.
export async function expectRecentlyDone(
  shown: RecentlyDoneParts,
  expected: "expanded" | "collapsed",
): Promise<void> {
  await expect(shown.header).toHaveAttribute(
    "aria-expanded",
    String(expected === "expanded"),
  );
  await (expected === "expanded"
    ? expect(shown.body).toBeVisible()
    : expect(shown.body).toHaveCount(0));
}

const sessionReviewCue = (row: Locator) =>
  row.getByText("Needs review", { exact: true });

export async function expectSessionReviewCue(row: Locator, needed: boolean) {
  const cue = sessionReviewCue(row);
  if (needed) {
    await expect(cue).toBeVisible();
    await expect(
      sessionsSidebarSessionEntryTooltipOf(row),
    ).toHaveAccessibleDescription(
      /Needs review.*not been marked reviewed on this machine/,
    );
  } else {
    await expect(cue).toHaveCount(0);
    await expect(
      sessionsSidebarSessionEntryTooltipOf(row),
    ).not.toHaveAccessibleDescription(/Reviewed|Needs review/);
  }
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
  let done: LaunchRecord[] = [];
  const keepDone = () => {
    const now = Date.now();
    done = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
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
    return done;
  };
  const { heldRows, expectNothingChanged } = await showCrowded(
    page,
    dashboard,
    origin,
    cursor,
    keepDone,
  );
  const shown = await showRecentlyDone(page);
  await openRunningList(page);
  await expect(shown.entries).toHaveCount(recentlyDoneSessionsInitialLimit);
  await expect(heldRows).toHaveCount(crowd);
  return { shown, heldRows, expectNothingChanged, done };
}
