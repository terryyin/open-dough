// The machine state the Sessions replay (../../backend-tests/sessions/sessions-replay.spec.ts)
// starts its server on, written straight into a machine directory the
// replay owns (./fakeClaude.ts lays it out: `home/` and `claude-state/`):
// the launch records and attempts (./sessionsReplayRecords.ts), a
// 1,191-entry Claude listing like production's on 2026-11-03, and each Codex
// thread's state for the fake Codex app server, which the server asks one
// or two requests a thread, as the real one.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  LaunchAttemptRecord,
  LaunchRecord,
} from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FakeCodex } from "./fakeCodexTypes.ts";
import { keepLaunchStore } from "./launchStore.ts";
import { replayRecords, replayScale } from "./sessionsReplayRecords.ts";
import { indices, uuidOf } from "./sessionsReplayValues.ts";

const minute = 60_000;

export type ReplaySeed = {
  readonly records: readonly LaunchRecord[];
  readonly attempts: readonly LaunchAttemptRecord[];
  // The open sessions' ids, in seeding order: all Claude ones.
  readonly openSessions: readonly string[];
  readonly listed: readonly Record<string, unknown>[];
};

const listedFor = (record: LaunchRecord, open: boolean) =>
  makeMe.aClaudeListingRow
    .background({
      sessionId: record.session.sessionId,
      name: record.session.name,
      ...(record.start?.workspace === undefined
        ? {}
        : { cwd: record.start.workspace }),
      startedAt: Date.parse(record.launchedAt),
    })
    .as(open ? "working" : "done-exited")
    .please();

const byProject = <T extends { readonly request: { readonly source: string } }>(
  items: readonly T[],
) => {
  const grouped: Record<string, T[]> = {};
  for (const item of items) (grouped[item.request.source] ??= []).push(item);
  return grouped;
};

// Writes the replay's sessions under `machine`, and tells `codex` each Codex
// thread's state; answers what it wrote.
export function seedReplaySessions(
  machine: string,
  codex: FakeCodex,
  now = Date.now(),
): ReplaySeed {
  const home = path.join(machine, "home");
  const endpoint = `unix://${codex.env["FAKE_CODEX_SOCKET"] ?? ""}`;
  const { records, attempts } = replayRecords(home, endpoint, now);
  const open = records.slice(replayScale.done);
  for (const record of open)
    if (record.start) mkdirSync(record.start.workspace, { recursive: true });
  for (const { session } of records)
    if (session.host === "codex")
      codex.observations.set(session.sessionId, {
        status: { type: "notLoaded" },
        turns: [{ id: `turn-${session.sessionId}`, status: "completed" }],
      });
  const claudeRecords = records.filter(
    ({ session }) => session.host === "claude",
  );
  const listed = [
    ...claudeRecords.map((record) =>
      listedFor(record, record.doneAt === undefined),
    ),
    ...indices(replayScale.listed - claudeRecords.length).map((index) => {
      const sessionId = uuidOf(`unrecorded:${String(index)}`);
      return makeMe.aClaudeListingRow
        .background({
          sessionId,
          name: `Unrecorded ${String(index)}`,
          cwd: path.join(home, "git", "open-dough"),
          startedAt: now - index * minute,
        })
        .as(index % 3 === 0 ? "stopped" : "done-exited")
        .please();
    }),
  ];
  keepLaunchStore(home, byProject(records));
  const dashboard = path.join(home, ".open-dough", "dashboard");
  writeFileSync(
    path.join(dashboard, "launch-attempts.json"),
    JSON.stringify(byProject(attempts)),
  );
  const claudeState = path.join(machine, "claude-state");
  mkdirSync(claudeState, { recursive: true });
  writeFileSync(path.join(claudeState, "agents.json"), JSON.stringify(listed));
  return {
    records,
    attempts,
    openSessions: open.map(({ session }) => session.sessionId),
    listed,
  };
}
