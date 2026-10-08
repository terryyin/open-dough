// A launched Cursor session's entry shows the screen the runner holds.
// Those words stay the runner's labels. A runner that is not running, or
// cannot be reached, says so and shows no screen label. An unfinished
// recorded session the runner does not hold says the agent is not running
// and offers Recover. Stop and rename stay absent. Delete record remains.
// This read starts no agent.
import {
  cursorHeldLabel,
  type CursorHeldLabel,
} from "../src/cursorHeldLabel.ts";
import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { launchHost } from "../server/launchHosts.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardPage.ts";
import {
  expectSidebarSessionShown,
  sidebarParts,
} from "./sessionSidebarPage.ts";
import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import {
  agentCalls,
  cursorRecord,
  expectCursorSessionActions,
  expectCursorUnknownWording,
  expectHeldLabel,
  expectNoBorrowedActivity,
  expectReadingWithoutScreenLabel,
  instruction,
  openTakenCursorSession,
  projectedSessions,
  readLog,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  openStoppedCursorEntry,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";
import type { CursorScreen } from "./support/fakeCursor.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";

test("a held Cursor session shows its screen label, without stop or rename", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const cursorHost = launchHost("cursor");
  expect(cursorHost).toBeDefined();
  expect(cursorHost).not.toHaveProperty("stop");
  expect(cursorHost).not.toHaveProperty("rename");
  expectCursorUnknownWording();

  const recent = await openTakenCursorSession(page, origin);
  await expect(recent).toContainText(cursor.sessionId);
  await expect(recent).toContainText("Continue in Cursor:");
  await expectHeldLabel(recent, cursorHeldLabel.followUp);
  await expectNoBorrowedActivity(recent);
  await expectCursorSessionActions(page, recent);
  await expect(recent.getByRole("button", { name: "Recover" })).toHaveCount(0);

  const answer = await projectedSessions(page);
  expect(answer.hostOperations.cursor).toEqual({
    attach: true,
    stop: false,
    launchedSessions: false,
  });
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
    label: cursorHeldLabel.followUp,
  });

  const sidebar = sidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expectSidebarSessionShown(
    sidebar.entries,
    cursorHeldLabel.followUp,
    "unsettled",
  );
  await expect(sidebar.badge).toHaveCount(0);
  await expect(
    sidebar.sidebar.getByRole("button", {
      name: /Delete record|Mark as done|Rename/i,
    }),
  ).toHaveCount(0);

  const callsAfterView = agentCalls(cursor);
  const client = cursor.attaches()[0];
  const prompt = cursor.input(client?.pid ?? 0).replace(/\r$/u, "");
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expectAdHocReportingInput(prompt, instruction, record?.request, dashboard);
  expect(callsAfterView).toEqual([["create-chat"]]);
  expect(client?.args).toEqual([
    "--workspace",
    origin.project,
    "--resume",
    cursor.sessionId,
  ]);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(dashboard.codex.calls).toEqual([]);
  expect(readLog(dashboard.codex.env["FAKE_CODEX_CLI_LOG"])).toBe("");
  expect(readLog(dashboard.codex.env["FAKE_CODEX_DAEMON_LOG"])).toBe("");

  await page.reload();
  await expectHeldLabel(recent, cursorHeldLabel.followUp);
  await expect(page.getByRole("button", { name: "Mark as done" })).toHaveCount(
    0,
  );
  await expect(
    recent.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  const again = await projectedSessions(page);
  expect(again.hostOperations.cursor).toEqual({
    attach: true,
    stop: false,
    launchedSessions: false,
  });
  expect(cursorRecord(again, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
    label: cursorHeldLabel.followUp,
  });
  expect(agentCalls(cursor)).toEqual(callsAfterView);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(dashboard.codex.calls).toEqual([]);
  expect(readLog(dashboard.codex.env["FAKE_CODEX_CLI_LOG"])).toBe("");
});

const heldScreens: readonly {
  readonly screen: CursorScreen;
  readonly label: CursorHeldLabel;
}[] = [
  { screen: "working", label: cursorHeldLabel.working },
  { screen: "waiting", label: cursorHeldLabel.waiting },
];

for (const { screen, label } of heldScreens) {
  test.describe(`a held ${screen} screen`, () => {
    test.use({ cursorScreen: screen });

    test(`the session entry shows ${label}`, async ({
      page,
      origin,
      cursor,
    }) => {
      test.setTimeout(120_000);
      const recent = await openTakenCursorSession(page, origin);
      await expectHeldLabel(recent, label);
      expect(agentCalls(cursor)).toEqual([["create-chat"]]);
      expect(cursor.attaches()).toHaveLength(1);
    });
  });
}

test("a stopped runner says so, shows no screen label, and starts no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const recent = await openTakenCursorSession(page, origin);
  await expectHeldLabel(recent, cursorHeldLabel.followUp);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  await page.reload();
  const again = parts(page).taken.locator(".session-entry");
  await expect(again).toHaveCount(1);
  await expectReadingWithoutScreenLabel(
    again,
    cursorRunnerSentence("not-running"),
  );
  expect(agentCalls(cursor)).toEqual(calls);
  expect(cursor.attaches()).toHaveLength(attaches);
});

test("an unreachable runner says so, shows no screen label, and starts no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const recent = await openTakenCursorSession(page, origin);
  await expectHeldLabel(recent, cursorHeldLabel.followUp);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  const release = await occupyRunner(dashboard.home);
  try {
    await page.reload();
    const again = parts(page).taken.locator(".session-entry");
    await expect(again).toHaveCount(1);
    await expectReadingWithoutScreenLabel(
      again,
      cursorRunnerSentence("unreachable"),
    );
    expect(agentCalls(cursor)).toEqual(calls);
    expect(cursor.attaches()).toHaveLength(attaches);
  } finally {
    await release();
  }
});

test("a recorded session the runner does not hold shows the agent is not running and offers Recover", async ({
  page,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const again = await openStoppedCursorEntry(page, origin, cursor);
  await expect(again).not.toHaveClass(/needs-attention/);
  await expect(
    again.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(1);
  const answer = await projectedSessions(page);
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "unknown",
    label: agentNotRunningLabel,
  });
});
