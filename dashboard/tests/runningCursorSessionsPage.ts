// The setup Running Cursor sessions specs share: one session the Cursor runner
// holds, launched as the page would, and the page showing the published Open
// Dough project. The held client and the cursor-agent are the fixture
// ./support/cursorStart.ts uses. The section's parts are
// ./runningCursorList.ts's, re-exported here for setup-holding callers; its
// opening and collapsing come from there directly.
import type { Locator, Page, Request } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts, sessionEntriesIn } from "./dashboardPage.ts";
import { box, expectInside } from "./pageLayout.ts";
import { expect, test as cursorTest } from "./support/cursorStart.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { keepLaunchRecords } from "./support/launchStore.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export const instruction = "hold this session";

type CursorScreen = "working" | "waiting" | "trust";

// Cursor fixture for Running Cursor journeys; screen options match the
// labels the section shows for held clients.
export function withRunningCursor(options?: {
  readonly screen?: CursorScreen;
  readonly becomeReady?: boolean;
}) {
  return cursorTest.extend<{ cursor: FakeCursor }>({
    // eslint-disable-next-line no-empty-pattern
    cursor: async ({}, use) => {
      const cursor = installFakeCursor(options);
      await use(cursor);
      cursor.cleanup();
    },
  });
}

// Opens the published project and waits until the held session is also the
// project's local Taken entry.
export async function showPageWithTaken(
  page: Page,
  origin: StartOrigin,
): Promise<void> {
  await showPage(page, origin);
  await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
}

// The runner's own held-sessions answer, used as a route precondition.
export async function heldSessionsAnswer(
  page: Page,
  dashboard: DashboardServer,
): Promise<unknown> {
  const answered = await page.request.get(
    `${dashboard.baseURL}${cursorRunnerSessionsEndpoint}`,
    { headers: { Origin: dashboard.baseURL } },
  );
  expect(answered.ok()).toBe(true);
  const held: unknown = await answered.json();
  expect(held).toMatchObject({ runner: "running" });
  return held;
}

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
export function keepCrowd(dashboard: DashboardServer, held: LaunchRecord) {
  const now = Date.now();
  const saved = Array.from(Array(crowd).keys(), (index): LaunchRecord => {
    const name = `Crowded session ${String(index + 1)}`;
    const launchedAt = new Date(now - (index + 1) * 60_000).toISOString();
    const sessionId = dashboard.claudeListsSession({
      name,
      cwd: dashboard.home,
      startedAt: Date.parse(launchedAt),
    });
    return makeMe.aLaunchRecord
      .adHoc({ title: name })
      .inClaudeSession({ sessionId })
      .launchedAt(launchedAt)
      .please();
  });
  keepLaunchRecords(dashboard, [held, ...saved]);
}

// The runner answers with as many held sessions, for its list to overflow.
// The answer is a precondition only; the held client is the one session's.
// Each row is its own resumable Cursor conversation in the held session's
// workspace, and its saved command resumes that row's UUID.
export async function answerCrowd(page: Page, held: LaunchRecord) {
  if (held.session.host !== "cursor") {
    throw new Error("The crowd is answered beside a held Cursor session.");
  }
  const { workspace } = held.session.continuation;
  const sessions = Array.from(Array(crowd).keys(), (index) => ({
    record: {
      ...held,
      session: makeMe.aHostSession
        .cursor({
          sessionId: `6f1e8c2a-9b34-4d5e-8f70-${String(index).padStart(12, "0")}`,
          continuation: { workspace },
        })
        .named(held.session.name)
        .please(),
    },
    label: "working",
  }));
  // Before the list reads them: distinct rows, each resuming its own UUID.
  const rows = sessions.map(({ record: { session } }) => ({
    sessionId: session.sessionId,
    resumes: session.continuation.args.at(
      session.continuation.args.indexOf("--resume") + 1,
    ),
  }));
  expect(new Set(rows.map(({ sessionId }) => sessionId)).size).toBe(crowd);
  for (const row of rows) expect(row.resumes).toBe(row.sessionId);
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
