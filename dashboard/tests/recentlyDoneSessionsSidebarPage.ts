// The Sessions sidebar's Recently done sessions section and the shared
// three-list room its journeys observe with the open list and Running Cursor
// sessions. Seeds use the real machine store; destinations reuse PageFrame.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { recentlyDoneSessionsInitialLimit } from "../src/agentLaunch.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { parts } from "./dashboardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
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
import type { StartOrigin } from "./support/startOrigin.ts";

export const recentlyDoneHeightKey =
  "open-dough.sessionsSidebar.recentlyDoneHeight";

export function recentlyDoneParts(page: Page) {
  const { sidebar, button, entries } = sessionsSidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Recently done sessions",
  });
  return {
    sidebar,
    button,
    // Open-list entries only (scoped in sessionsSidebarPage).
    openEntries: entries,
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    region,
    header: region.getByRole("button", { name: "Recently done sessions" }),
    list: sidebar.locator(".sessions-sidebar-sessions"),
    body: region.locator(".recently-done-sessions-body"),
    entries: region.locator("li.sessions-sidebar-session-entry"),
    entry: (title: string) => region.getByRole("button", { name: title }),
    divider: sidebar.getByRole("separator", {
      name: "Recently done sessions divider",
      exact: true,
    }),
    running: runningCursorParts(page),
  };
}

// Keeps launch records for every configured project in the machine store.
export async function keepProjectLaunchRecords(
  dashboard: DashboardServer,
  byProject: Readonly<Record<string, readonly LaunchRecord[]>>,
) {
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  await mkdir(path.dirname(store), { recursive: true });
  await writeFile(store, JSON.stringify(byProject));
}

export function doneRecord(options: {
  readonly source: string;
  readonly title: string;
  readonly sessionId: string;
  readonly launchedAt: string;
  readonly doneAt: string;
  readonly host?: "claude" | "codex" | "cursor";
  readonly workflow?: LaunchRecord["request"]["workflow"];
  readonly identity?: string;
}): LaunchRecord {
  const host = options.host ?? "claude";
  const workflow = options.workflow ?? "ad-hoc";
  const name = options.title;
  // Fixture builder: host/workflow unions are narrowed at call sites.
  return {
    request: {
      source: options.source,
      workflow,
      title: options.title,
      host,
      ...(options.identity === undefined ? {} : { identity: options.identity }),
    },
    session: {
      host,
      sessionId: options.sessionId,
      ...(host === "claude"
        ? { shortId: options.sessionId.slice(0, 8), name }
        : { name }),
      ...(host === "cursor"
        ? {
            continuation: {
              workspace: "/tmp",
              args: ["agent", "--resume", options.sessionId],
            },
          }
        : {}),
    },
    launchedAt: options.launchedAt,
    doneAt: options.doneAt,
  } as LaunchRecord;
}

export function openRecord(options: {
  readonly source: string;
  readonly title: string;
  readonly sessionId: string;
  readonly launchedAt: string;
  readonly host?: "claude";
}): LaunchRecord {
  const host = options.host ?? "claude";
  return {
    request: {
      source: options.source,
      workflow: "ad-hoc",
      title: options.title,
      host,
    },
    session: {
      host,
      sessionId: options.sessionId,
      shortId: options.sessionId.slice(0, 8),
      name: options.title,
    },
    launchedAt: options.launchedAt,
  };
}

// Publishes Doughnut and Pygardon beside the Open Dough origin already shown.
export async function publishSiblingProjects(page: Page) {
  const doughnut = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  doughnut.push(
    "d4".repeat(20),
    `# Product backlog

## Taken

## Backlog list

- [A Doughnut story](seeds/SEED-401.md#s) — SEED-401#s
`,
  );
  const pygardon = await publishMovingOrigin(page, "terryyin/pygardon");
  pygardon.push(
    "e6".repeat(20),
    `# Product backlog

## Taken

## Backlog list

- [A Pygardon story](seeds/SEED-301.md#s) — SEED-301#s
`,
  );
  return { doughnut, pygardon };
}

export async function showThreeProjectPage(page: Page, origin: StartOrigin) {
  await publishSiblingProjects(page);
  await showPage(page, origin);
  await parts(page).project.getByRole("radio", { name: "Pygardon" }).check();
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
  await keepCrowd(dashboard, held);
  const now = Date.now();
  const done = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const title = `Done crowded ${String(index + 1)}`;
    const sessionId = dashboard.claudeListsSession({
      name: title,
      cwd: dashboard.home,
      startedAt: now - (index + 1) * 120_000,
    });
    return doneRecord({
      source: "open-dough",
      title,
      sessionId,
      launchedAt: new Date(now - (index + 1) * 120_000).toISOString(),
      doneAt: new Date(now - (index + 1) * 60_000).toISOString(),
    });
  });
  const store = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const current = JSON.parse(await readFile(store, "utf8")) as Record<
    string,
    LaunchRecord[]
  >;
  await keepProjectLaunchRecords(dashboard, {
    ...current,
    "open-dough": [...(current["open-dough"] ?? []), ...done],
  });
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
