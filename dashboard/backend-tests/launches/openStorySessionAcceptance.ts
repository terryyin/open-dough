// Shared setup for open-story-session acceptance proof: the queued story
// request, answer parsing, seeding a kept attempt, and asserting nothing
// started.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type {
  AttemptObservation,
  LaunchAttemptRecord,
} from "../../src/agentLaunch.ts";
import {
  accept,
  attempts,
  keptStarts,
  launchRequest,
  runningStarts,
} from "../../tests/agentLaunchBoundary.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  type PushHold,
  type StartOrigin,
} from "../../tests/support/startOrigin.ts";

export const openSessionRequest = {
  ...launchRequest,
  identity: queuedIdentity,
  title: queuedTitle,
  instruction: "Keep this exact instruction.",
};

export type OpenSessionAnswer = {
  kind: string;
  reason?: string;
  explanation?: string;
  attempt?: AttemptObservation;
};

export const answerOf = async (
  pending: ReturnType<typeof accept>,
): Promise<OpenSessionAnswer> =>
  JSON.parse((await pending).body) as OpenSessionAnswer;

export const nothingStarted = async (
  origin: StartOrigin,
  server: DashboardServer,
  push: PushHold,
  keptAttempts = true,
): Promise<void> => {
  expect(push.isHeld()).toBe(false);
  expect(await origin.takenProfiles()).toEqual([]);
  // A session listing (`agents`) may run for the alert baseline once an open
  // record is seeded; that is not a start.
  expect(
    server.claudeCalls().filter((call) => call.argv[0] !== "agents"),
  ).toEqual([]);
  expect(await runningStarts(server)).toEqual([]);
  expect(await keptStarts(server)).toEqual([]);
  if (keptAttempts) expect(await attempts(server)).toEqual([]);
};

// Seeds one kept attempt into the machine's launch-attempts store.
export const seedKeptAttempt = (
  home: string,
  attempt: LaunchAttemptRecord,
): void => {
  const folder = path.join(home, ".open-dough", "dashboard");
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    path.join(folder, "launch-attempts.json"),
    JSON.stringify({ "open-dough": [attempt] }),
  );
};
