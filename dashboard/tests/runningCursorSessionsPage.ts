// The Sessions sidebar's Running Cursor sessions section, and the setup its
// specs share: one session the Cursor runner holds, launched as the page
// would, and the page showing the published Open Dough project. The held
// client and the cursor-agent are the fixture ./support/cursorStart.ts uses.
import type { Locator, Page, Request } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { box, expectInside } from "./pageLayout.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { expect } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { FakeCursor } from "./support/fakeCursor.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";

export const instruction = "hold this session";

// Launches an ad hoc Cursor session the runner holds; returns its client's
// process.
export async function holdSession(
  dashboard: DashboardServer,
  cursor: FakeCursor,
): Promise<number> {
  const launched = await launch(dashboard, {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "cursor",
    instruction,
  });
  expect(launched.status).toBe(200);
  expect(JSON.parse(launched.body)).toMatchObject({ kind: "launched" });
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  return cursor.attaches()[0]?.pid ?? 0;
}

export async function showPage(page: Page, origin: StartOrigin): Promise<void> {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Start session in Open Dough" }),
  ).toBeVisible();
}

export function runningCursorParts(page: Page) {
  const { sidebar, button, entries } = sidebarParts(page);
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  return {
    sidebar,
    button,
    entries,
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    region,
    header: region.getByRole("button", { name: "Running Cursor sessions" }),
    // The two areas that scroll on their own.
    list: sidebar.locator(".sidebar-sessions"),
    body: region.locator(".running-cursor-body"),
    // The edge between them, while expanded.
    edge: sidebar.getByRole("separator", {
      name: "Resize Running Cursor sessions",
    }),
  };
}

// Opens the sidebar and expands Running Cursor sessions.
export async function openRunningList(page: Page) {
  const shown = runningCursorParts(page);
  await shown.button.click();
  await shown.header.click();
  return shown;
}

// Requests other than reads: a launch, an attach, a done mark, a delete, or
// a runner control.
export function changesAsked(page: Page): readonly string[] {
  const asked: string[] = [];
  page.on("request", (request: Request) => {
    if (request.method() !== "GET") asked.push(request.url());
  });
  return asked;
}

// How many entries each crowded list holds beyond its room.
export const crowd = 30;

// Each list's usable floor (8rem), in CSS px.
export const listFloor = 8 * 16;

// Many saved sessions beside the held one, for the session list to overflow.
export async function keepCrowd(
  dashboard: DashboardServer,
  held: LaunchRecord,
) {
  const now = Date.now();
  const saved = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const name = `Crowded session ${String(index + 1)}`;
    const launchedAt = new Date(now - (index + 1) * 60_000).toISOString();
    const sessionId = dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: Date.parse(launchedAt),
    });
    return {
      request: {
        source: "open-dough",
        workflow: "ad-hoc",
        title: name,
        host: "claude",
      },
      session: {
        host: "claude",
        sessionId,
        shortId: sessionId.slice(0, 8),
        name,
      },
      launchedAt,
    };
  });
  await keepLaunchRecords(dashboard, [held, ...saved]);
}

// The runner answers with as many held sessions, for its list to overflow.
// The answer is a precondition only; the held client is the one session's.
export async function answerCrowd(page: Page, held: LaunchRecord) {
  const sessions = Array.from(Array(crowd).keys(), (index) => ({
    record: {
      ...held,
      session: {
        ...held.session,
        sessionId: `6f1e8c2a-9b34-4d5e-8f70-${String(index).padStart(12, "0")}`,
      },
    },
    label: "working",
  }));
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    (route) => route.fulfill({ json: { runner: "running", sessions } }),
  );
}

export const scrollTopOf = (area: Locator) =>
  area.evaluate((at) => at.scrollTop);

// Scrolls the area with the mouse wheel until it can scroll no further.
export async function wheelToEnd(page: Page, area: Locator) {
  const at = await box(area);
  await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2);
  await expect
    .poll(async () => {
      await page.mouse.wheel(0, 600);
      return area.evaluate(
        (element) =>
          element.scrollTop + element.clientHeight >= element.scrollHeight - 1,
      );
    })
    .toBe(true);
}

// Each area's last entry is in reach, inside its area and the window, by the
// area's and the sidebar's own scrolling.
export async function expectLastInReach(
  areas: readonly (readonly [area: Locator, last: Locator])[],
) {
  for (const [area, last] of areas) {
    await area.evaluate((element) => {
      element.scrollTo(0, element.scrollHeight);
    });
    await last.scrollIntoViewIfNeeded();
    await expectInside(last, area);
    await expect(last).toBeInViewport();
  }
}
