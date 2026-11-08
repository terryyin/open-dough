// After a current-runner start or replace settles, resume unfinished
// Cursor sessions named by durable last-held evidence onto the accepting
// runner through Recover's keep path — without calling
// ensureCurrentCursorRunner again (nested keep during ensure deadlocks).
// Observation never reaches this path. One failure leaves Recover offered
// on that entry and does not abandon siblings. Sessions already held,
// finished, marked done, or absent from last-held are not started.
import { homedir } from "node:os";
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import { sessionUnfinished } from "../../../src/sessionRecovery.ts";
import { keptRecordsByProject } from "../../launchRecordStore.ts";
import { directoryState } from "../../sessionWorkspace.ts";
import { cursorResumeKeepRequest, withinLaunchWait } from "./recoveryResume.ts";
import { readCursorRunnerLastHeld } from "./runnerPaths.ts";
import { acceptingCursorRunnerPort } from "./runnerProcess.ts";
import { recordedCursorSessionScope } from "./sessionScope.ts";
import {
  hangupCursorClient,
  keepCursorClientAtPort,
  readCursorRunnerSessions,
  type CursorKeepResult,
} from "./runnerWire.ts";
import { showsCursorWorkspaceTrust } from "./workspaceTrust.ts";

async function reviveOne(
  port: number,
  sourceId: string,
  record: LaunchRecord,
  home: string,
): Promise<void> {
  if (record.session.host !== "cursor") return;
  const workspace = record.session.continuation.workspace;
  const state = directoryState(workspace);
  if (state.kind !== "available") return;
  const scope = recordedCursorSessionScope(
    record.session.continuation.configScope,
  );
  if (scope.kind === "unavailable") return;
  const kept = keepCursorClientAtPort(
    port,
    cursorResumeKeepRequest(
      record,
      sourceId,
      scope.kind === "ready" ? { configScope: scope.scope } : {},
    ),
  );
  const outcome = await withinLaunchWait(kept);
  if (outcome === "timed-out") {
    // Same as Recover: keep may still finish and hold the session; a kept
    // session whose continuation was not taken in time still counts as
    // running when the runner holds it.
    return;
  }
  await afterKeep(outcome, record, home);
}

async function afterKeep(
  kept: CursorKeepResult,
  record: LaunchRecord,
  home: string,
): Promise<void> {
  if (record.session.host !== "cursor") return;
  if (
    kept.kind === "unreachable" ||
    kept.kind === "missing" ||
    kept.kind === "failed" ||
    kept.kind === "already-held"
  ) {
    return;
  }
  if (kept.kind === "exited") {
    // Cannot-load replacement stays a developer Recover concern for this
    // path; leave the unfinished record with Recover offered.
    return;
  }
  const screen = kept.screen ?? "";
  if (showsCursorWorkspaceTrust(screen)) {
    await hangupCursorClient(record.session, home);
  }
}

async function lastHeldUnfinishedCandidates(
  home: string,
  heldKeys: ReadonlySet<string>,
): Promise<
  readonly { readonly sourceId: string; readonly record: LaunchRecord }[]
> {
  const lastHeld = new Set(readCursorRunnerLastHeld(home));
  if (lastHeld.size === 0) return [];
  const byProject = await keptRecordsByProject();
  const candidates: { sourceId: string; record: LaunchRecord }[] = [];
  for (const [sourceId, records] of byProject) {
    for (const record of records) {
      if (record.session.host !== "cursor") continue;
      const key = sessionKey(record.session);
      if (!lastHeld.has(key) || heldKeys.has(key)) continue;
      if (!sessionUnfinished(record)) continue;
      candidates.push({ sourceId, record });
    }
  }
  return candidates;
}

// Sequential Recover-keep resume onto the accepting current runner. Call
// only after ensureCurrentCursorRunner has settled a start or replace.
export async function reviveLastHeldCursorSessions(
  home = homedir(),
): Promise<void> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return;
  const read = await readCursorRunnerSessions(home);
  const heldKeys = new Set(
    read.kind === "running"
      ? read.sessions.map((held) => sessionKey(held.session))
      : [],
  );
  const candidates = await lastHeldUnfinishedCandidates(home, heldKeys);
  for (const { sourceId, record } of candidates) {
    try {
      await reviveOne(port, sourceId, record, home);
    } catch {
      // One failure must not abandon siblings; Recover remains offered.
    }
  }
}
