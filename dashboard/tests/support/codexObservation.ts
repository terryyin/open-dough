// Saved predecessor preconditions and passive-protocol assertions, shared by Codex observation journeys.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { appendedRecords } from "./appendedRecords.ts";
import { expect } from "../dashboardTest.ts";
import { codexEndpoint } from "./fakeCodex.ts";
import type { FakeCodex, FakeCodexObservation } from "./fakeCodex.ts";
import type {
  CodexSession,
  LaunchRecord,
  LaunchWithState,
} from "../../src/agentLaunch.ts";
import { machineSessions } from "../agentLaunchBoundary.ts";
import { notRefinedStory, notRefinedIdentity } from "../launchJourney.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { keepLaunchStore } from "./launchStore.ts";
import { rawRequest } from "./rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RawRequestOptions, RawResponse } from "./rawHttp.ts";

// The kept refinement of the not-refined story in Codex thread `id`, which
// continues through this fake's socket in the server's checkout unless the
// case states its project, title, workspace or endpoint. It states no first
// input or preparation, so the server decodes it as a predecessor record.
export function observationRecord(
  server: Pick<DashboardServer, "home">,
  native: FakeCodex,
  id: string,
  {
    source = "open-dough",
    title = notRefinedStory,
    workspace = path.join(server.home, "git", "open-dough"),
    endpoint = codexEndpoint(native),
  }: {
    source?: string;
    title?: string;
    workspace?: string;
    endpoint?: string;
  } = {},
): LaunchRecord & { session: CodexSession } {
  const record = makeMe.aLaunchRecord
    .refining({ identity: notRefinedIdentity, title, source })
    .inCodexSession({
      sessionId: id,
      continuation: { workspace, endpoint },
    })
    .please();
  const { session } = record;
  if (session.host !== "codex") throw new Error("Expected a Codex session");
  return { ...record, session };
}
export function saveObservations(
  server: Pick<DashboardServer, "home">,
  records: LaunchRecord[],
) {
  keepLaunchStore(server, { "open-dough": records });
}
export async function observationStates(
  server: DashboardServer,
): Promise<LaunchWithState[]> {
  return (await machineSessions(server)) as LaunchWithState[];
}
// The machine's sessions ask, answered as sent: its status and exact body.
export function sessionsRequest(server: DashboardServer): RawRequestOptions {
  return {
    url: `${server.baseURL}/__agent-launch`,
    headers: { Origin: server.origin },
  };
}
export function askSessions(server: DashboardServer): Promise<RawResponse> {
  return rawRequest(sessionsRequest(server));
}
// Each record's session state in a sessions answer body.
export function sessionStatesIn(body: string): unknown[] {
  return (
    JSON.parse(body) as { records: { sessionState: unknown }[] }
  ).records.map(({ sessionState }) => sessionState);
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

// Waits through further polls of this session, regardless of how many other
// sessions the server reads. Three starts establish completed intervening polls.
export async function afterFurtherReads(
  native: FakeCodex,
  sessionId: string,
): Promise<void> {
  const reads = () =>
    native.calls.filter(
      (call) =>
        call.method === "thread/read" && call.params["threadId"] === sessionId,
    ).length;
  const before = reads();
  // These alert journeys poll every 50 ms; avoid backoff after a read finishes.
  await expect
    .poll(reads, { intervals: [50] })
    .toBeGreaterThanOrEqual(before + 3);
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

export function daemonStarts(native: FakeCodex): unknown[] {
  return appendedRecords<unknown>(
    readFileSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "", "utf8"),
  );
}

// The recorded environment of each `codex <command> ...` the fake ran, in
// order: `NODE_ENV`, `PATH`, every `npm_*` key, `INIT_CWD`, its socket and
// terminal wiring, and the spec's pass-through marker, where set.
export function codexEnvironments(
  native: FakeCodex,
  command: "app-server" | "resume",
): Readonly<Record<string, string>>[] {
  const log = native.env["FAKE_CODEX_ENV_LOG"] ?? "";
  if (!existsSync(log)) return [];
  return appendedRecords<{
    args: string[];
    env: Readonly<Record<string, string>>;
  }>(readFileSync(log, "utf8"))
    .filter(({ args }) => args[0] === command)
    .map(({ env }) => env);
}
