// Running Cursor sessions, opened from the Sessions sidebar without a
// terminal already open. The list names a session the runner holds. Choosing
// that row opens the terminal on that same client. A runner that is not
// running, or cannot be reached, says so, lists nothing, and starts no agent.
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { expect, test as cursorTest } from "./support/cursorStart.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

const instruction = "hold this session";

type Screen = "working" | "waiting" | "trust";

function withCursor(options?: {
  readonly screen?: Screen;
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

function withScreen(screen: Screen) {
  return withCursor({ screen });
}

async function holdSession(
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

async function showPage(page: Page, origin: StartOrigin): Promise<void> {
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
  await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(1);
}

async function openRunningList(page: Page) {
  const { sidebar, button } = sidebarParts(page);
  await button.click();
  const region = sidebar.getByRole("region", {
    name: "Running Cursor sessions",
  });
  await region.getByRole("button", { name: "Running Cursor sessions" }).click();
  return { sidebar, region };
}

const held = [
  {
    screen: "working" as const,
    label: "working",
    terminal: "ctrl+c to stop",
  },
  {
    screen: "waiting" as const,
    label: "waiting for an answer",
    terminal: "Clarifying Questions",
  },
  {
    screen: "trust" as const,
    label: "waiting for an answer",
    terminal: "Do you trust this workspace?",
  },
];

for (const { screen, label, terminal } of held) {
  const test = withScreen(screen);
  test(`a ${screen} screen is listed as ${label}, and choosing it opens that client`, async ({
    page,
    dashboard,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    const pid = await holdSession(dashboard, cursor);
    await showPage(page, origin);
    const terminalPanel = page.getByRole("region", { name: "Terminal" });
    await expect(terminalPanel).toHaveCount(0);
    const { sidebar, region } = await openRunningList(page);
    await expect(terminalPanel).toHaveCount(0);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("Ad hoc");
    await expect(row).toContainText(label);
    await expect(terminalPanel).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();
    await expect(
      region.getByRole("button", { name: /stop|restart|start/i }),
    ).toHaveCount(0);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
    expect(cursor.attaches()).toHaveLength(1);

    await row.click();
    await expect(terminalPanel.locator(".xterm-rows")).toContainText(terminal);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  });
}

const followUp = withCursor({ screen: "working", becomeReady: true });
followUp(
  "the follow-up prompt is listed on the client the runner still holds",
  async ({ page, dashboard, origin, cursor }) => {
    followUp.setTimeout(120_000);
    // Working keeps the client. The ordinary prompt is what that same client
    // becomes, and the runner keeps holding that screen.
    const pid = await holdSession(dashboard, cursor);
    await showPage(page, origin);
    const terminalPanel = page.getByRole("region", { name: "Terminal" });
    await expect(terminalPanel).toHaveCount(0);
    const { region } = await openRunningList(page);
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("Ad hoc");
    await expect(row).toContainText("working");
    await expect(terminalPanel).toHaveCount(0);
    cursor.showReady();
    await expect(row).toContainText("at the follow-up prompt");
    await expect(terminalPanel).toHaveCount(0);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  },
);

const refused = cursorTest;

refused(
  "a runner that is not running lists nothing and starts no agent",
  async ({ page, dashboard, origin, cursor }) => {
    refused.setTimeout(120_000);
    await holdSession(dashboard, cursor);
    await showPage(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const terminalPanel = page.getByRole("region", { name: "Terminal" });
    const { region } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is not running.");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(region.getByRole("button")).toHaveCount(1);
    await expect(terminalPanel).toHaveCount(0);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);
    await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(1);
  },
);

refused(
  "a runner that cannot be reached lists nothing and starts no agent",
  async ({ page, dashboard, origin, cursor }) => {
    refused.setTimeout(120_000);
    await holdSession(dashboard, cursor);
    await showPage(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const release = await occupyRunner(dashboard.home);
    try {
      const terminalPanel = page.getByRole("region", { name: "Terminal" });
      const { region } = await openRunningList(page);
      await expect(region).toContainText(
        "The Cursor runner cannot be reached.",
      );
      await expect(region.getByRole("listitem")).toHaveCount(0);
      await expect(region.getByRole("button")).toHaveCount(1);
      await expect(terminalPanel).toHaveCount(0);
      expect(cursor.calls()).toHaveLength(calls);
      expect(cursor.attaches()).toHaveLength(attaches);
    } finally {
      await release();
    }
  },
);
