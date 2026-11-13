// Running Cursor sessions opens from the Sessions sidebar without a terminal.
// Choosing a listed row opens that same client. An absent/unreachable runner
// lists nothing and starts no agent. Expanded reading follows each later answer,
// showing reading until answered and restoring rows after a successful read.
// Bounded slow-answer demand and synthetic feedback UI live in
// dashboard/frontend-tests/cursor-runner-sessions-ui.spec.ts.
import { parts, sessionEntriesIn } from "../dashboardPage.ts";
import { openRunningList } from "../runningCursorList.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import {
  holdSession,
  instruction,
  showPageWithTaken,
  withRunningCursor,
} from "../runningCursorSessionsPage.ts";
import { expect, test as cursorTest } from "../support/cursorStart.ts";
import { occupyRunner } from "../support/cursorRunnerJourney.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";

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
    const pid = await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const shownTerminal = terminalPanel(page);
    await expect(shownTerminal).toHaveCount(0);
    const { sidebar, region, heldRows } = await openRunningList(page);
    await expect(shownTerminal).toHaveCount(0);
    await expect(region).toContainText("The Cursor runner is running.");
    const row = heldRows(/Open Dough/);
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
    await expect(terminalScreenParts(shownTerminal).rows).toContainText(
      terminal,
    );
    expect(cursor.attaches()).toHaveLength(1);
    expect(cursor.attaches()[0]?.pid).toBe(pid);
    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  });
}

const followUp = withRunningCursor({ screen: "working", becomeReady: true });
followUp(
  "the follow-up prompt is listed on the client the runner still holds",
  async ({ page, dashboard, origin, cursor }) => {
    // Working keeps the client. The ordinary prompt is what that same client
    // becomes, and the runner keeps holding that screen.
    const pid = await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const shownTerminal = terminalPanel(page);
    await expect(shownTerminal).toHaveCount(0);
    const { heldRows } = await openRunningList(page);
    const row = heldRows(/Open Dough/);
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
    await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const shownTerminal = terminalPanel(page);
    const { region, listed } = await openRunningList(page);
    await expect(region).toContainText("The Cursor runner is not running.");
    await expect(listed).toHaveCount(0);
    await expect(region.getByRole("button")).toHaveCount(1);
    await expect(shownTerminal).toHaveCount(0);
    expect(cursor.calls()).toHaveLength(calls);
    expect(cursor.attaches()).toHaveLength(attaches);
    await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
  },
);

refused(
  "a runner that cannot be reached lists nothing and starts no agent",
  async ({ page, dashboard, origin, cursor }) => {
    await holdSession(dashboard, cursor);
    await showPageWithTaken(page, origin);
    const calls = cursor.calls().length;
    const attaches = cursor.attaches().length;
    await stopCursorRunner(dashboard.home);
    const release = await occupyRunner(dashboard.home);
    try {
      const shownTerminal = terminalPanel(page);
      const { region, listed } = await openRunningList(page);
      await expect(region).toContainText(
        "The Cursor runner cannot be reached.",
      );
      await expect(listed).toHaveCount(0);
      await expect(region.getByRole("button")).toHaveCount(1);
      await expect(shownTerminal).toHaveCount(0);
      expect(cursor.calls()).toHaveLength(calls);
      expect(cursor.attaches()).toHaveLength(attaches);
    } finally {
      await release();
    }
  },
);
