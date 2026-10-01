// What a raw-HTTP launch spec observes of accepted launch attempts
// (./agentLaunchBoundary.ts, ./agent-launch-acceptance.spec.ts): the
// attempts this machine keeps, as its store file holds them, and what one
// settled to, followed through the attempt's own change answers.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import {
  agentChangedEndpoint,
  type AttemptObservation,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";

// The attempts kept on this machine, as the file holds them.
export function keptAttempts(server: DashboardServer): LaunchAttemptRecord[] {
  const file = path.join(
    server.home,
    ".open-dough",
    "dashboard",
    "launch-attempts.json",
  );
  if (!existsSync(file)) return [];
  const kept = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    LaunchAttemptRecord[]
  >;
  return Object.values(kept).flat();
}

// The outcome this machine keeps for an accepted attempt, once settled.
function keptOutcome(
  server: DashboardServer,
  id: string,
): AttemptObservation["outcome"] {
  try {
    return keptAttempts(server).find((attempt) => attempt.id === id)?.outcome;
  } catch {
    // Read while being replaced: read again.
    return undefined;
  }
}

// How long an accepted attempt is followed before giving up.
const settlementMs = 120_000;

// What an accepted attempt settled to, as the server running it answers its
// changes, or as this machine keeps it once no server runs it.
export async function settledOutcome(
  server: DashboardServer,
  id: string,
): Promise<NonNullable<AttemptObservation["outcome"]>> {
  const deadline = Date.now() + settlementMs;
  while (Date.now() < deadline) {
    const response = await rawRequest({
      url: `${server.baseURL}${agentChangedEndpoint}?attempt=${id}`,
      headers: { Origin: server.origin },
    });
    expect(response.status).toBe(200);
    const { attempt } = JSON.parse(response.body) as {
      attempt?: AttemptObservation;
    };
    const outcome = attempt?.outcome ?? keptOutcome(server, id);
    if (outcome !== undefined) return outcome;
    if (attempt === undefined) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(`launch attempt ${id} did not settle`);
}
