// The isolated machine and observable notification/session-listing boundary
// for the dashboard server's macOS alert journeys.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineFolder,
} from "../agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { ClaudeSessionChange } from "./fakeClaude.ts";

export const alertCheckMs = 100;

export const test = base.extend<{ machine: string; server: DashboardServer }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-alerts-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  server: async ({ machine }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
    });
    await use(server);
    await server.close();
  },
});

// What each notification said: its message, its title, and the sound its
// script names.
export function notices(server: DashboardServer) {
  return server.osascriptCalls().map(({ argv }) => ({
    message: argv.at(-2),
    title: argv.at(-1),
    sound: /sound name "([^"]*)"/.exec(argv.join("\n"))?.[1],
  }));
}

export function messages(server: DashboardServer): (string | undefined)[] {
  return notices(server).map((notice) => notice.message);
}

// How many of the server's own session listings the fake `claude` has logged.
function listings(server: DashboardServer): number {
  const machine = machineFolder(server);
  return server
    .claudeCalls()
    .filter((call) => call.argv[0] === "agents" && call.cwd === machine).length;
}

// Waits until the server has read the sessions twice more, so whatever the
// last change should raise has been raised.
export async function afterFurtherListings(
  server: DashboardServer,
): Promise<void> {
  const before = listings(server);
  await expect.poll(() => listings(server)).toBeGreaterThanOrEqual(before + 2);
}

export async function start(
  server: DashboardServer,
  request: object = launchRequest,
): Promise<string> {
  const response = await launch(server, request);
  return (
    JSON.parse(response.body) as { record: { session: { sessionId: string } } }
  ).record.session.sessionId;
}

export async function becomes(
  server: DashboardServer,
  sessionId: string,
  change: ClaudeSessionChange,
  waitingFor?: string,
): Promise<void> {
  server.claudeSessionBecomes(sessionId, change, waitingFor);
  await afterFurtherListings(server);
}
