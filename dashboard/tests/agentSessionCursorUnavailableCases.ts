// Cases registered by ./agent-session-cursor.spec.ts.

import { cursorRunnerSentence } from "../src/cursorRunnerSessions.ts";

import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";

import { parts } from "./dashboardPage.ts";

import { occupyRunner } from "./support/cursorRunnerJourney.ts";
import {
  agentCalls,
  cursorRecord,
  expectNormalizedReading,
  expectReadingWithoutScreenLabel,
  openTakenCursorSession,
  projectedSessions,
} from "./support/cursorSessionReading.ts";
import {
  agentNotRunningLabel,
  openStoppedCursorEntry,
} from "./support/cursorSessionRecovery.ts";
import { expect, test } from "./support/cursorStart.ts";

import { reloadUntilRead } from "./pageRequestNotes.ts";

test("a stopped runner says so, shows no screen label, and starts no agent", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const recent = await openTakenCursorSession(page, origin);
  await expectNormalizedReading(recent, "Ready for review", true);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  await reloadUntilRead(page);
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
  await expectNormalizedReading(recent, "Ready for review", true);
  const calls = agentCalls(cursor);
  const attaches = cursor.attaches().length;
  await stopCursorRunner(dashboard.home);
  const release = await occupyRunner(dashboard.home);
  try {
    await reloadUntilRead(page);
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
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const again = await openStoppedCursorEntry(
    page,
    origin,
    cursor,
    dashboard.home,
  );
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
