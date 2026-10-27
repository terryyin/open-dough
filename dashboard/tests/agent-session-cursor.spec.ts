// A launched Cursor session's entry reads the screen the runner holds as
// the shared normalized activities: a proved clarifying question reads
// Needs input with the question text, the follow-up prompt after a
// confirmed first instruction reads Ready for review, and a working screen
// reads Working. A trust screen keeps the runner's label as an unknown
// reading. A runner that is not running, or cannot be reached, says so and
// shows no screen label. An unfinished recorded session the runner does
// not hold says the agent is not running and offers Recover. Rename
// stays absent. Delete record stays only while a reading is unknown
// or unavailable, as for every host. This read starts no agent.
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";

import type { LaunchRecord } from "../src/launchRecord.ts";
import { launchHost } from "../server/launchHosts.ts";

import { recordsOf } from "./agentLaunchBoundary.ts";

import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "./sessionsSidebarPage.ts";

import {
  agentCalls,
  cursorQuestion,
  cursorRecord,
  expectCursorSessionActions,
  expectCursorUnknownWording,
  expectHeldLabel,
  expectNormalizedReading,
  instruction,
  openTakenCursorSession,
  projectedSessions,
  readLog,
} from "./support/cursorSessionReading.ts";

import { expect, test } from "./support/cursorStart.ts";
import type { CursorScreen } from "./support/fakeCursor.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test("a held Cursor session at the follow-up prompt after its confirmed first instruction reads Ready for review, with stop and without rename", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const cursorHost = launchHost("cursor");
  expect(cursorHost).toBeDefined();
  expect(cursorHost).toHaveProperty("stop");
  expect(cursorHost).not.toHaveProperty("rename");
  expectCursorUnknownWording();

  const recent = await openTakenCursorSession(page, origin);
  await expect(recent).toContainText(cursor.sessionId);
  await expect(recent).toContainText("Continue in Cursor:");
  await expectNormalizedReading(recent, "Ready for review", true);
  await expectCursorSessionActions(page, recent);
  await expect(recent.getByRole("button", { name: "Recover" })).toHaveCount(0);

  const answer = await projectedSessions(page);
  expect(answer.hostOperations.cursor).toEqual({
    attach: true,
    stop: true,
    doneStop: false,
    localDone: true,
    launchedSessions: false,
  });
  expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
    kind: "available",
    availability: "loaded",
    activity: "review",
  });

  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expectSessionsSidebarSessionEntryShown(
    sidebar.entries,
    "Ready for review",
    "ready",
  );
  await expect(sidebar.badge).toHaveCount(1);
  await expect(sidebar.badge).toHaveAccessibleName("1 session needs attention");
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

  await reloadUntilRead(page);
  await expectNormalizedReading(recent, "Ready for review", true);
  await expect(
    recent.getByRole("button", { name: "Delete record…" }),
  ).toHaveCount(0);
  const again = await projectedSessions(page);
  expect(again.hostOperations.cursor).toEqual({
    attach: true,
    stop: true,
    doneStop: false,
    localDone: true,
    launchedSessions: false,
  });
  expect(cursorRecord(again, cursor.sessionId)?.sessionState).toEqual({
    kind: "available",
    availability: "loaded",
    activity: "review",
  });
  expect(agentCalls(cursor)).toEqual(callsAfterView);
  expect(dashboard.claudeCalls()).toEqual([]);
  expect(dashboard.codex.calls).toEqual([]);
  expect(readLog(dashboard.codex.env["FAKE_CODEX_CLI_LOG"])).toBe("");
});

const heldScreens: readonly {
  readonly screen: CursorScreen;
  readonly reading: string;
  readonly needsAttention: boolean;
  readonly state: Record<string, string>;
}[] = [
  {
    screen: "working",
    reading: "Working",
    needsAttention: false,
    state: { kind: "available", availability: "loaded", activity: "working" },
  },
  {
    screen: "waiting",
    reading: `Needs input: ${cursorQuestion}`,
    needsAttention: true,
    state: {
      kind: "available",
      availability: "loaded",
      activity: "waiting",
      waitingFor: cursorQuestion,
    },
  },
  {
    // Cancelled and failed history above the follow-up prompt proves
    // neither failure nor interruption: the same review reading.
    screen: "cancelled-follow-up",
    reading: "Ready for review",
    needsAttention: true,
    state: { kind: "available", availability: "loaded", activity: "review" },
  },
];

for (const { screen, reading, needsAttention, state } of heldScreens) {
  test.describe(`a held ${screen} screen`, () => {
    test.use({ cursorScreen: screen });

    test(`the session entry reads ${reading}`, async ({
      page,
      origin,
      cursor,
    }) => {
      test.setTimeout(120_000);
      const recent = await openTakenCursorSession(page, origin);
      await expectNormalizedReading(recent, reading, needsAttention);
      const answer = await projectedSessions(page);
      expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual(
        state,
      );
      expect(agentCalls(cursor)).toEqual([["create-chat"]]);
      expect(cursor.attaches()).toHaveLength(1);
    });
  });
}

test.describe("a held trust screen", () => {
  test.use({ cursorScreen: "trust" });

  test("the session entry keeps the waiting label as an unknown reading, with no attention", async ({
    page,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    const recent = await openTakenCursorSession(page, origin);
    await expectHeldLabel(recent, cursorHeldLabel.waiting);
    const answer = await projectedSessions(page);
    expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
      kind: "unknown",
      label: cursorHeldLabel.waiting,
    });
    expect(agentCalls(cursor)).toEqual([["create-chat"]]);
    expect(cursor.attaches()).toHaveLength(1);
  });
});

test.describe("a held waiting screen that settles to the follow-up prompt", () => {
  test.use({ cursorScreen: "waiting" });

  test("reads Ready for review once that prompt accepts the pending first instruction", async ({
    page,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    const recent = await openTakenCursorSession(page, origin);
    await expectNormalizedReading(
      recent,
      `Needs input: ${cursorQuestion}`,
      true,
    );
    cursor.setAttachMode("follow-up");
    await reloadUntilRead(page);
    await expectNormalizedReading(recent, "Ready for review", true);
    const answer = await projectedSessions(page);
    expect(cursorRecord(answer, cursor.sessionId)?.sessionState).toEqual({
      kind: "available",
      availability: "loaded",
      activity: "review",
    });
    expect(agentCalls(cursor)).toEqual([["create-chat"]]);
    expect(cursor.attaches()).toHaveLength(1);
  });
});

import "./agentSessionCursorUnavailableCases.ts";
