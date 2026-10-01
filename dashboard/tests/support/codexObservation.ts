// Saved predecessor preconditions and passive-protocol assertions, shared by Codex observation journeys.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "../dashboardTest.ts";
import type { FakeCodex, FakeCodexObservation } from "./fakeCodex.ts";
import type { LaunchRecord, LaunchWithState } from "../../src/agentLaunch.ts";
import { machineSessions } from "../agentLaunchBoundary.ts";
import { notRefinedStory, notRefinedIdentity } from "../launchJourney.ts";
import type { DashboardServer } from "./dashboardServer.ts";

export function observationRecord(
  server: DashboardServer,
  native: FakeCodex,
  id: string,
): LaunchRecord {
  return {
    request: {
      source: "open-dough",
      identity: notRefinedIdentity,
      title: notRefinedStory,
      workflow: "refinement",
      host: "codex",
    },
    session: {
      host: "codex",
      sessionId: id,
      name: id,
      continuation: {
        workspace: path.join(server.home, "git", "open-dough"),
        endpoint: `unix://${native.env["FAKE_CODEX_SOCKET"] ?? ""}`,
        args: ["codex", "resume", id],
      },
    },
    launchedAt: "2026-09-01T00:00:00.000Z",
    // Deliberately omit newer firstInput/preparation fields: actual predecessor decoding.
  };
}
export function saveObservations(
  server: DashboardServer,
  records: LaunchRecord[],
) {
  const folder = path.join(server.home, ".open-dough", "dashboard");
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    path.join(folder, "agent-launches.json"),
    JSON.stringify({ "open-dough": records }),
  );
}
export async function observationStates(
  server: DashboardServer,
): Promise<LaunchWithState[]> {
  return (await machineSessions(server)) as LaunchWithState[];
}
export function observed(
  native: FakeCodex,
  id: string,
  status: FakeCodexObservation["status"],
  turn?: string,
) {
  native.observations.set(id, {
    status,
    turns: turn === undefined ? [] : [{ id: `${id}-turn`, status: turn }],
  });
}
export function passive(calls: FakeCodex["calls"]) {
  expect(
    calls.every(({ method }) =>
      [
        "initialize",
        "initialized",
        "thread/read",
        "thread/turns/list",
      ].includes(method),
    ),
  ).toBe(true);
  for (const { method, params } of calls) {
    if (method === "thread/read")
      expect(params).toEqual({
        threadId: expect.any(String),
        includeTurns: false,
      });
    if (method === "thread/turns/list")
      expect(params).toEqual({
        threadId: expect.any(String),
        limit: 1,
        sortDirection: "desc",
        itemsView: "notLoaded",
      });
  }
}
