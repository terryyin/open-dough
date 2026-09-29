// Shared by the local launch boundary specs (./agent-launch-boundary.spec.ts,
// ./agent-launch-refusal.spec.ts, and ./agent-launch-records.spec.ts): one execution launch request for this
// repository's own story, and its refinement counterpart, sent over raw HTTP,
// and what the boundary keeps.

import { realpathSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
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

export async function recordsOf(
  server: DashboardServer,
  source: string,
): Promise<unknown[]> {
  const response = await rawRequest({
    url: `${server.baseURL}${agentLaunchEndpoint}?source=${source}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  return (JSON.parse(response.body) as { records: unknown[] }).records;
}

export function openDoughFolder(server: DashboardServer): string {
  return realpathSync(path.join(server.home, "git", "open-dough"));
}
