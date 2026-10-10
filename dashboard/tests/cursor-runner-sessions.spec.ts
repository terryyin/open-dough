// Running Cursor sessions, opened from the Sessions sidebar without a
// terminal already open. The list names a session the runner holds. Choosing
// that row opens the terminal on that same client. A runner that is not
// running, or cannot be reached, says so, lists nothing, and starts no agent.
// While expanded, the list says it is reading until a read answers, then
// follows each later read, recovering its rows when one succeeds.
import type { Page } from "@playwright/test";
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import { parts } from "./dashboardPage.ts";
import {
  holdSession,
  instruction,
  openRunningList,
  showPage as showProject,
} from "./runningCursorSessionsPage.ts";
import { expect, test as cursorTest } from "./support/cursorStart.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";

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

// The page also lists the held session as the project's local Taken entry.
async function showPage(page: Page, origin: StartOrigin): Promise<void> {
  await showProject(page, origin);
  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
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
    await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
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

const feedback = withScreen("working");
feedback(
  "while expanded, the list says it is reading, then follows each later read: unreachable, restored, and running with no held sessions",
  async ({ page, dashboard, origin, cursor }) => {
    feedback.setTimeout(120_000);
    const pid = await holdSession(dashboard, cursor);
    // The runner's own answer for the held session; the replies below are
    // what the page's reads are given, preconditions only.
    const answered = await page.request.get(
      `${dashboard.baseURL}${cursorRunnerSessionsEndpoint}`,
      { headers: { Origin: dashboard.baseURL } },
    );
    expect(answered.ok()).toBe(true);
    const held: unknown = await answered.json();
    expect(held).toMatchObject({ runner: "running" });
    const replies = {
      held,
      unreachable: { runner: "unreachable", sessions: [] },
      empty: { runner: "running", sessions: [] },
    };
    let reply: keyof typeof replies = "held";
    let release: () => void = () => undefined;
    const reading = new Promise<void>((resolve) => {
      release = resolve;
    });
    await showPage(page, origin);
    const calls = cursor.calls().length;
    await page.route(
      (url) => url.pathname === cursorRunnerSessionsEndpoint,
      async (route) => {
        await reading;
        await route.fulfill({ json: replies[reply] });
      },
    );
    try {
      const terminalPanel = page.getByRole("region", { name: "Terminal" });
      const { sidebar, region } = await openRunningList(page);
      const row = region.getByRole("button", { name: /Open Dough/ });
      await expect(region).toContainText("Reading the Cursor runner…");
      await expect(region.getByRole("listitem")).toHaveCount(0);
      release();
      await expect(region).toContainText("The Cursor runner is running.");
      await expect(row).toContainText("working");

      reply = "unreachable";
      await expect(region).toContainText(
        "The Cursor runner cannot be reached.",
      );
      await expect(region.getByRole("listitem")).toHaveCount(0);
      // The session list stays as it was.
      await expect(
        sidebar.getByRole("button", { name: instruction, exact: true }),
      ).toBeVisible();

      reply = "held";
      await expect(region).toContainText("The Cursor runner is running.");
      await expect(row).toContainText("working");

      reply = "empty";
      await expect(region.getByRole("listitem")).toHaveCount(0);
      await expect(region).toContainText("The Cursor runner is running.");
      await expect(region).not.toContainText("cannot be reached");

      await expect(terminalPanel).toHaveCount(0);
      expect(cursor.calls()).toHaveLength(calls);
      expect(cursor.attaches()).toHaveLength(1);
      expect(cursor.attaches()[0]?.pid).toBe(pid);
    } finally {
      release();
    }
  },
);
