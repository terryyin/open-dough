// Locked machine evidence admits one acceptance across servers, then local
// registration precedes effects. An attempt that cannot be kept starts nothing.

import type {
  Acceptance,
  AgentLaunchRequest,
  LaunchAttemptRecord,
  LaunchRecord,
} from "../src/agentLaunch.ts";
import {
  conflicting,
  unrecordedAcceptance,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { continuationRecord } from "./launchAttemptContinuation.ts";
import type { AttemptRun } from "./launchAttemptSettlement.ts";
import { keepAttemptIf } from "./launchAttemptStore.ts";
import { attemptWorker } from "./launchAttemptWorker.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import type { OwnedAttempts } from "./ownedAttempts.ts";
import {
  rememberTerminalHandoff,
  terminalHandoffRequested,
} from "./terminalHandoff.ts";

// What the request, or the continuation of the attempt `continued`, would
// duplicate among the attempts and open launch records this machine knows
// (`conflicting`). `excluding` omits that owned attempt during a locked keep.
export function conflictWithAttempts(
  owned: OwnedAttempts,
  request: AgentLaunchRequest,
  kept: readonly LaunchAttemptRecord[],
  records: ReadonlyMap<string, readonly LaunchRecord[]> | undefined,
  continued?: string,
  excluding?: string,
): Unaccepted | undefined {
  const { unsettled, known } = owned.forConflict(kept, excluding, continued);
  return conflicting(request, unsettled, known, records, continued);
}

export async function admitAttempt(
  owned: OwnedAttempts,
  verifying: Set<string>,
  request: AgentLaunchRequest,
  attempt: LaunchAttemptRecord,
  run: AttemptRun,
  continued?: string,
): Promise<Acceptance> {
  const attachTerminal = terminalHandoffRequested();
  // The locked keep rechecks machine facts before local registration and effects.
  const local = conflictWithAttempts(owned, request, [], new Map(), continued);
  if (local !== undefined) return local;
  // Preparation runs in this server before spawn, and across the script's
  // exit and the next worker note. Keep that worker before any effect.
  const working = {
    ...attempt,
    worker: attemptWorker(request.workflow === "ad-hoc" ? "launch" : "start"),
  };
  let keptAttempt: LaunchAttemptRecord = working;
  let refusal: Unaccepted | undefined;
  try {
    const recorded = await keepAttemptIf(working, async (machine) => {
      const records = await readableRecordsByProject();
      if (continued !== undefined) {
        const selected = continuationRecord(
          owned,
          verifying,
          request.source,
          continued,
          machine,
          records,
        );
        if (!("attempt" in selected)) {
          refusal = selected;
          return false;
        }
        keptAttempt = selected.ownLaunch
          ? selected.attempt
          : {
              ...selected.attempt,
              worker: working.worker,
              outcome: undefined,
              settledAt: undefined,
            };
        if (selected.ownLaunch) return keptAttempt;
      }
      refusal = conflictWithAttempts(
        owned,
        request,
        machine,
        records,
        continued,
        attempt.id,
      );
      return refusal === undefined ? keptAttempt : false;
    });
    if (!recorded) {
      return refusal ?? unrecordedAcceptance;
    }
  } catch {
    return unrecordedAcceptance;
  }
  if (keptAttempt.outcome?.kind === "launched") {
    owned.release(attempt.id);
    return { kind: "accepted", attempt: owned.observed(keptAttempt) };
  }
  if (owned.closed)
    return {
      kind: "failed",
      reason: "refused",
      explanation:
        "This dashboard stopped before admission finished. The attempt was kept for recovery; nothing was started or launched.",
    };
  // Run from the kept request (attachment paths after materialization), not
  // the wire request that still names transient claim ids.
  const own = owned.own(keptAttempt.request, keptAttempt);
  rememberTerminalHandoff(attempt.id, attachTerminal);
  owned.settle(own, run);
  return { kind: "accepted", attempt: owned.observed(keptAttempt) };
}
