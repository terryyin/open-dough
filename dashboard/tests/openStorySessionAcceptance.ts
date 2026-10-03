// Shared setup for open-story-session acceptance proof: the queued story
// request, answer parsing, seeding an open record, and asserting nothing
// started.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { AttemptObservation } from "../src/agentLaunch.ts";
import {
  accept,
  attempts,
  keptStarts,
  launchRequest,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import { openStoryRecord, seedStore } from "./machineLaunchRecords.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  queuedIdentity,
  queuedTitle,
  type PushHold,
  type StartOrigin,
} from "./support/startOrigin.ts";

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

export const seedOpenSession = (
  machine: string,
  host: "claude" | "codex" | "cursor",
  sessionId: string,
  story: {
    readonly source: string;
    readonly identity: string;
    readonly title: string;
    readonly workflow: string;
  } = openSessionRequest,
): void => {
  seedStore(
    machine,
    JSON.stringify({
      "open-dough": [openStoryRecord(host, sessionId, story)],
    }),
  );
};

export const nothingStarted = async (
  origin: StartOrigin,
  server: DashboardServer,
  push: PushHold,
  keptAttempts = true,
): Promise<void> => {
  expect(push.isHeld()).toBe(false);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(server.claudeCalls()).toEqual([]);
  expect(await runningStarts(server)).toEqual([]);
  expect(await keptStarts(server)).toEqual([]);
  if (keptAttempts) expect(await attempts(server)).toEqual([]);
};

// Seeds one kept attempt into the machine's launch-attempts store.
export const seedKeptAttempt = (
  home: string,
  attempt: {
    readonly id: string;
    readonly request: typeof openSessionRequest;
    readonly acceptedAt: string;
    readonly publication: { readonly kind: string };
    readonly outcome: object;
    readonly settledAt: string;
  },
): void => {
  const folder = path.join(home, ".open-dough", "dashboard");
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    path.join(folder, "launch-attempts.json"),
    JSON.stringify({ "open-dough": [attempt] }),
  );
};
