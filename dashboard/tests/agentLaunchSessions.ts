// Machine-session reads through the agent launch boundary: kept and running
// starts, project records, establishing projects, and launch attempts.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  agentLaunchEndpoint,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import {
  sessionsAudienceParameter,
  sessionsHistoryAudience,
} from "../src/machineSessionsRevision.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";

// The machine's sessions as the boundary answers them, or their history.
async function sessionsAnswer<T>(
  server: DashboardServer,
  query = "",
): Promise<T> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}${query}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return JSON.parse(response.body) as T;
}

// Whether the server can raise its alerts, as the boundary answers the
// machine's sessions.
export async function alertsAnswered(
  server: DashboardServer,
): Promise<unknown> {
  return (await sessionsAnswer<{ alerts: unknown }>(server)).alerts;
}

// Until the boundary answers the notifier as available. Alerts read as
// checking until the server's startup diagnostic answers, which changes the
// sessions answer, so a revision held before then may not stand.
export async function alertsSettled(server: DashboardServer): Promise<void> {
  await expect.poll(() => alertsAnswered(server)).toEqual({ available: true });
}

// The machine's sessions as the boundary answers them: every project's kept
// records, each naming its project.
export async function machineSessions(
  server: DashboardServer,
): Promise<unknown[]> {
  return (await sessionsAnswer<{ records: unknown[] }>(server)).records;
}

// The projects whose installed skill establishes a start, as the boundary
// answers the machine's sessions.
export async function establishingProjects(
  server: DashboardServer,
): Promise<string[]> {
  return (await sessionsAnswer<{ establishing: string[] }>(server))
    .establishing;
}

// The projects whose installed skill ships the preparation start and its
// formatter, as the boundary answers the machine's sessions.
export async function establishingPreparation(
  server: DashboardServer,
): Promise<string[]> {
  return (await sessionsAnswer<{ establishingPreparation: string[] }>(server))
    .establishingPreparation;
}

// One project's records among the machine's sessions.
export function projectRecords(
  sessions: readonly unknown[],
  source: string,
): unknown[] {
  return sessions.filter(
    (record) =>
      (record as { request: { source: string } }).request.source === source,
  );
}

// One project's records as the boundary answers the machine's sessions now.
export async function recordsOf(
  server: DashboardServer,
  source: string,
): Promise<unknown[]> {
  return projectRecords(await machineSessions(server), source);
}

export function openDoughFolder(server: DashboardServer): string {
  return realpathSync(path.join(server.home, "git", "open-dough"));
}

// The machine's home folder, where the read of the machine's sessions lists
// Claude Code's sessions.
export function machineFolder(server: DashboardServer): string {
  return realpathSync(server.home);
}

// The starts the boundary keeps without a session, as it answers the machine's
// sessions.
export async function keptStarts(server: DashboardServer): Promise<unknown[]> {
  return (await sessionsAnswer<{ keptStarts: unknown[] }>(server)).keptStarts;
}

// The starts the boundary runs now with their phases, as it answers the
// machine's sessions.
export async function runningStarts(
  server: DashboardServer,
): Promise<unknown[]> {
  return (await sessionsAnswer<{ starts: unknown[] }>(server)).starts;
}

type AnsweredAttempts = { attempts: AttemptObservation[] };

const historyQuery = `?${sessionsAudienceParameter}=${sessionsHistoryAudience}`;

// The launch attempts still needing attention, which the boundary answers
// with the machine's sessions.
export async function attemptsAttending(
  server: DashboardServer,
): Promise<AttemptObservation[]> {
  return (await sessionsAnswer<AnsweredAttempts>(server)).attempts;
}

// The launch attempts the boundary answers only with the sessions history.
export async function attemptsInHistory(
  server: DashboardServer,
): Promise<AttemptObservation[]> {
  return (await sessionsAnswer<AnsweredAttempts>(server, historyQuery))
    .attempts;
}

// The launch attempts the boundary answers: those still needing attention
// with the machine's sessions, then the others with their history, as one
// observation answered them. The two reads are separate asks, so an attempt
// that stops needing attention between them (a page reconciling it) would
// read in both; a pair is taken only when the history read is the one the
// sessions answer names as its `historyRevision`.
export async function attempts(
  server: DashboardServer,
): Promise<AttemptObservation[]> {
  for (let tries = 0; tries < 20; tries += 1) {
    const overview = await sessionsAnswer<
      AnsweredAttempts & { historyRevision?: string }
    >(server);
    const history = await sessionsAnswer<
      AnsweredAttempts & { revision: string }
    >(server, historyQuery);
    if (history.revision === overview.historyRevision)
      return [...overview.attempts, ...history.attempts];
  }
  throw new Error("The sessions history kept moving between paired reads");
}
