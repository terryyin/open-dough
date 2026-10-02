// Shared by the local launch boundary specs (./agent-launch-boundary.spec.ts,
// ./agent-launch-refusal.spec.ts, ./agent-launch-records.spec.ts,
// ./agent-launch-session-listing.spec.ts, and ./agent-launch-done.spec.ts):
// one execution launch request for this repository's own story, and its
// refinement counterpart, sent over raw HTTP to be answered once accepted,
// or followed to what it settled to (./acceptedAttempts.ts), a continuation, a
// reconciliation note, a done mark, a record delete, and what the boundary
// keeps, read as the machine's sessions and scoped by project.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  agentAcceptEndpoint,
  agentContinueEndpoint,
  agentLaunchEndpoint,
  agentReconciledEndpoint,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { settledOutcome } from "./acceptedAttempts.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest, type RawResponse } from "./support/rawHttp.ts";

export const identity = "SEED-052#launch-claude-planned-execution";
export const title = "Launch execution in a Claude Code background session";
export const launchRequest = {
  source: "open-dough",
  identity,
  title,
  workflow: "execution",
  host: "claude",
};
export const refinementRequest = { ...launchRequest, workflow: "refinement" };

// Asks for a launch and answers what it settled to, as a launch result: the
// acceptance answer itself when nothing was accepted (or the request was
// refused), otherwise the accepted attempt's outcome once it settled, a
// launched one with its record as the machine's sessions list it.
// Settlement is followed through the attempt's own change answers (or, once
// no server runs it, what this machine keeps of it), so no read of the
// machine's sessions, and its host listing, runs before the launch settled.
export async function launch(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return followed(server, await accept(server, body, headers));
}

// Asks to continue the project's kept attempt `attempt` and answers what it
// settled to, as `launch` does.
export async function continued(
  server: DashboardServer,
  attempt: string,
): Promise<RawResponse> {
  return followed(server, await continueAttempt(server, attempt));
}

// The acceptance answer when nothing was accepted, otherwise what the
// accepted attempt settled to.
async function followed(
  server: DashboardServer,
  accepted: RawResponse,
): Promise<RawResponse> {
  if (accepted.status !== 200) return accepted;
  const answer = JSON.parse(accepted.body) as {
    kind: string;
    attempt?: AttemptObservation;
  };
  if (answer.kind !== "accepted" || answer.attempt === undefined) {
    return accepted;
  }
  const outcome = await settledOutcome(server, answer.attempt.id);
  if (outcome.kind !== "launched") {
    return { ...accepted, body: JSON.stringify(outcome) };
  }
  const { session } = outcome;
  const record = (await machineSessions(server)).find((listed) => {
    const { host, sessionId } = (
      listed as { session: { host: string; sessionId: string } }
    ).session;
    return host === session.host && sessionId === session.sessionId;
  });
  return { ...accepted, body: JSON.stringify({ kind: "launched", record }) };
}

// What a launch of a story already starting on this machine is answered.
export const alreadyStarting = {
  kind: "failed",
  reason: "already-starting",
  explanation:
    "This story is already starting on this machine, so a second start was not made. Wait for the running start to end; its card shows its progress. Nothing was launched.",
};

// What a launch matching one this server is still running is answered.
export const alreadySubmitted = {
  kind: "uncertain",
  reason: "unconfirmed",
  explanation:
    "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
};

// A JSON POST of `body` to the boundary's `endpoint`, from this dashboard's
// own origin unless `headers` say otherwise.
function post(
  server: DashboardServer,
  endpoint: string,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${endpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// Asks for a launch answered once the boundary's launch owner accepted it.
export const accept = (
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
) => post(server, agentAcceptEndpoint, body, headers);

// Asks to continue the project's kept attempt `attempt`, answered once it is
// accepted again or with why not.
export const continueAttempt = (
  server: DashboardServer,
  attempt: string,
  source = "open-dough",
) => post(server, agentContinueEndpoint, { source, attempt });

// Notes that the project's kept attempt `attempt` reconciled with published
// state, answered with the attempt so noted or why not.
export const noteReconciled = (
  server: DashboardServer,
  attempt: string,
  source = "open-dough",
) => post(server, agentReconciledEndpoint, { source, attempt });

export const markDone = (
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
) => post(server, agentDoneEndpoint, body, headers);

// The machine's sessions as the boundary answers them.
async function sessionsAnswer<T>(server: DashboardServer): Promise<T> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return JSON.parse(response.body) as T;
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

export const deleteRecord = (
  server: DashboardServer,
  body: unknown,
  headers?: Record<string, string>,
) => post(server, agentDeleteEndpoint, body, headers);

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

// The launch attempts the boundary answers with the machine's sessions.
export async function attempts(
  server: DashboardServer,
): Promise<AttemptObservation[]> {
  return (await sessionsAnswer<{ attempts: AttemptObservation[] }>(server))
    .attempts;
}
