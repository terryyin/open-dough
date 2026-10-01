// Shared by the local launch boundary specs (./agent-launch-boundary.spec.ts,
// ./agent-launch-refusal.spec.ts, ./agent-launch-records.spec.ts,
// ./agent-launch-session-listing.spec.ts, and ./agent-launch-done.spec.ts):
// one execution launch request for this repository's own story, and its
// refinement counterpart, sent over raw HTTP to be answered once settled or
// once accepted, a done mark, a record delete, and what the boundary keeps,
// read as the machine's sessions and scoped by project.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  agentAcceptEndpoint,
  agentLaunchEndpoint,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { agentDeleteEndpoint } from "../src/deleteRecord.ts";
import { agentDoneEndpoint } from "../src/doneMark.ts";
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

export function launch(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// What a launch of a story already starting on this machine is answered.
export const alreadyStarting = {
  kind: "failed",
  reason: "already-starting",
  explanation:
    "This story is already starting on this machine, so a second start was not made. Wait for the running start to end; its card shows its progress. Nothing was launched.",
};

// Asks for a launch answered once the boundary's launch owner accepted it.
export function accept(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${agentAcceptEndpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

export function markDone(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${agentDoneEndpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// The machine's sessions as the boundary answers them: every project's kept
// records, each naming its project.
export async function machineSessions(
  server: DashboardServer,
): Promise<unknown[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { records: unknown[] }).records;
}

// The projects whose installed skill establishes a start, as the boundary
// answers the machine's sessions.
export async function establishingProjects(
  server: DashboardServer,
): Promise<string[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { establishing: string[] }).establishing;
}

// The projects whose installed skill ships the preparation start and its
// formatter, as the boundary answers the machine's sessions.
export async function establishingPreparation(
  server: DashboardServer,
): Promise<string[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { establishingPreparation: string[] })
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

export function deleteRecord(
  server: DashboardServer,
  body: unknown,
  headers: Record<string, string> = { Origin: server.origin },
): Promise<RawResponse> {
  return rawRequest({
    url: `${server.baseURL}${agentDeleteEndpoint}`,
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

// The starts the boundary keeps without a session, as it answers the machine's
// sessions.
export async function keptStarts(server: DashboardServer): Promise<unknown[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { keptStarts: unknown[] }).keptStarts;
}

// The starts the boundary runs now with their phases, as it answers the
// machine's sessions.
export async function runningStarts(
  server: DashboardServer,
): Promise<unknown[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { starts: unknown[] }).starts;
}

// The launch attempts the boundary answers with the machine's sessions.
export async function attempts(
  server: DashboardServer,
): Promise<AttemptObservation[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { attempts: AttemptObservation[] })
    .attempts;
}
