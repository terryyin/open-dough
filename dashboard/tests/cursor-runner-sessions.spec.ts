// Running Cursor sessions opens from the Sessions sidebar without a terminal.
// Choosing a listed row opens that same client. An absent/unreachable runner
// lists nothing and starts no agent. Expanded reading follows each later answer,
// showing reading until answered and restoring rows after a successful read.
// Bounded slow-answer demand lives in ./cursor-runner-sessions-demand.spec.ts.
import { cursorRunnerSessionsEndpoint } from "../src/cursorRunnerSessions.ts";
import { parts } from "./dashboardPage.ts";
import {
  heldSessionsAnswer,
  holdSession,
  instruction,
  openRunningList,
  showPageWithTaken,
  withRunningCursor,
} from "./runningCursorSessionsPage.ts";
import { expect, test as cursorTest } from "./support/cursorStart.ts";
import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";

type Screen = "working" | "waiting" | "trust";

function withScreen(screen: Screen) {
  return withRunningCursor({ screen });
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
    terminal: "Which color do you prefer, Red or Blue?",
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
    await showPageWithTaken(page, origin);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    await expect(shownTerminal).toHaveCount(0);
    const { sidebar, region } = await openRunningList(page);
    await expect(shownTerminal).toHaveCount(0);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("Ad hoc");
    await expect(row).toContainText(label);
    await expect(shownTerminal).toHaveCount(0);
    await expect(
      sidebar.getByRole("button", { name: instruction, exact: true }),
    ).toBeVisible();
    await expect(
      region.getByRole("button", { name: /stop|restart|start/i }),
    ).toHaveCount(0);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
    expect(cursor.attaches()).toHaveLength(1);

    await row.click();
    await expect(shownTerminal.locator(".xterm-rows")).toContainText(terminal);
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  });
}

const followUp = withRunningCursor({ screen: "working", becomeReady: true });
followUp(
  "the follow-up prompt is listed on the client the runner still holds",
  async ({ page, dashboard, origin, cursor }) => {
    followUp.setTimeout(120_000);
    // Working keeps the client. The ordinary prompt is what that same client
    // becomes, and the runner keeps holding that screen.
    const pid = await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    await expect(shownTerminal).toHaveCount(0);
    const { region } = await openRunningList(page);
    const row = region.getByRole("button", { name: /Open Dough/ });
    await expect(row).toContainText("Ad hoc");
    await expect(row).toContainText("working");
    await expect(shownTerminal).toHaveCount(0);
    cursor.showReady();
    await expect(row).toContainText("at the follow-up prompt");
    await expect(shownTerminal).toHaveCount(0);
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
    await showPageWithTaken(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const shownTerminal = page.getByRole("region", { name: "Terminal" });
    const { region } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is not running.");
    await expect(region.getByRole("listitem")).toHaveCount(0);
    await expect(region.getByRole("button")).toHaveCount(1);
    await expect(shownTerminal).toHaveCount(0);
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
    await showPageWithTaken(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const release = await occupyRunner(dashboard.home);
    try {
      const shownTerminal = page.getByRole("region", { name: "Terminal" });
      const { region } = await openRunningList(page);
      await expect(region).toContainText(
        "The Cursor runner cannot be reached.",
      );
      await expect(region.getByRole("listitem")).toHaveCount(0);
      await expect(region.getByRole("button")).toHaveCount(1);
      await expect(shownTerminal).toHaveCount(0);
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
    const held = await heldSessionsAnswer(page, dashboard);
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
    await showPageWithTaken(page, origin);
    const calls = cursor.calls().length;
    await page.route(
      (url) => url.pathname === cursorRunnerSessionsEndpoint,
      async (route) => {
        await reading;
        await route.fulfill({ json: replies[reply] });
      },
    );
    try {
      const shownTerminal = page.getByRole("region", { name: "Terminal" });
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

      await expect(shownTerminal).toHaveCount(0);
      expect(cursor.calls()).toHaveLength(calls);
      expect(cursor.attaches()).toHaveLength(1);
      expect(cursor.attaches()[0]?.pid).toBe(pid);
    } finally {
      release();
    }
  },
);
