// Keeps one attempt per story before effects, then settles independently of
// its caller. Interrupted attempts resume their kept request and identity;
// reconciliation and verification settle them from retained evidence.

import { randomUUID } from "node:crypto";
import {
  rememberTerminalHandoff,
  terminalHandoffRequested,
} from "./terminalHandoff.ts";
import {
  withoutConfirmation,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type LaunchAttemptRecord,
  type LaunchRecord,
  type ReconciledAnswer,
  type VerifiedAnswer,
} from "../src/agentLaunch.ts";
import {
  alreadySubmitted,
  conflicting,
  unreadableEvidence,
  unrecordedAcceptance,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { reconcileAttempt } from "./launchAttemptReconciliation.ts";
import {
  verifyAttempt,
  type LaunchVerifier,
} from "./launchAttemptVerification.ts";
import { settleAttempt, type AttemptRun } from "./launchAttemptSettlement.ts";
import { keepAttemptIf, keptAttempts } from "./launchAttemptStore.ts";
import { readableRecordsByProject } from "./launchRecordStore.ts";
import { OwnedAttempts } from "./ownedAttempts.ts";
import {
  continueAttempt,
  continuationRecord,
} from "./launchAttemptContinuation.ts";
import { attemptWorker } from "./launchAttemptWorker.ts";

export class LaunchAttemptOwner {
  private readonly owned = new OwnedAttempts();
  private readonly verifying = new Set<string>();

  // The attempts this machine keeps and those this server owns, oldest
  // first, an owned attempt as this server knows it; and whether the kept
  // ones could be read.
  async attempts(): Promise<{
    readonly attempts: readonly AttemptObservation[];
    readonly readable: boolean;
  }> {
    const read = await keptAttempts();
    const kept = read ?? [];
    const attempts = this.owned.known(kept);
    this.owned.releaseKeptSettled(kept);
    return { attempts, readable: read !== undefined };
  }

  // The answer to a launch matching one this server still runs, if any.
  submitted(request: AgentLaunchRequest): Unaccepted | undefined {
    return alreadySubmitted(
      request,
      this.owned.unsettledRequests(),
      this.owned.known([]),
    );
  }

  // Accepts a request nothing else answered: its exact request is kept
  // before `run` has any side effect, then `run` goes on whatever happens to
  // the caller. A request that cannot be kept starts nothing.
  async accept(
    request: AgentLaunchRequest,
    run: AttemptRun,
    reportingOrigin?: string,
  ): Promise<Acceptance> {
    const kept = await keptAttempts();
    if (kept === undefined) return unreadableEvidence;
    // Refuse live workers before waiting on their note; admission rechecks under lock.
    const conflict = this.conflictWith(request, kept, new Map());
    if (conflict !== undefined) return conflict;
    return this.admit(
      request,
      {
        id: randomUUID(),
        request: withoutConfirmation(request),
        acceptedAt: new Date().toISOString(),
        ...(reportingOrigin === undefined ? {} : { reportingOrigin }),
        publication: {
          kind: request.workflow === "ad-hoc" ? "none" : "unknown",
        },
      },
      run,
    );
  }

  // Continue first settles from its own launch record, otherwise readmits the
  // kept request after the existing pre-launch checks.
  continueAttempt(
    sourceId: string,
    id: string,
    before: (request: AgentLaunchRequest) => Promise<Unaccepted | undefined>,
    run: AttemptRun,
  ): Promise<Acceptance> {
    return continueAttempt(
      this.owned,
      this.verifying,
      sourceId,
      id,
      before,
      (attempt) => this.admit(attempt.request, attempt, run, id),
    );
  }

  // Notes that the project's settled attempt `id` reconciled with published
  // state, or answers why not.
  reconcile(sourceId: string, id: string): Promise<ReconciledAnswer> {
    return reconcileAttempt(this.owned, sourceId, id);
  }

  // Settles the project's story attempt `id` whose launch is uncertain from
  // what `verify` finds in its host's own evidence, or answers why it stays
  // unresolved (`./launchAttemptVerification.ts`).
  verify(
    sourceId: string,
    id: string,
    verify: LaunchVerifier,
  ): Promise<VerifiedAnswer> {
    return verifyAttempt(this.owned, this.verifying, sourceId, id, verify);
  }

  // What the request, or the continuation of the attempt `continued`, would
  // duplicate among the attempts and open launch records this machine knows
  // (`conflicting`). `excluding` omits that owned attempt during a locked keep.
  private conflictWith(
    request: AgentLaunchRequest,
    kept: readonly LaunchAttemptRecord[],
    records: ReadonlyMap<string, readonly LaunchRecord[]> | undefined,
    continued?: string,
    excluding?: string,
  ): Unaccepted | undefined {
    const { unsettled, known } = this.owned.forConflict(
      kept,
      excluding,
      continued,
    );
    return conflicting(request, unsettled, known, records, continued);
  }

  // Locked machine evidence admits one acceptance across servers, then local
  // registration precedes effects. An attempt that cannot be kept starts nothing.
  private async admit(
    request: AgentLaunchRequest,
    attempt: LaunchAttemptRecord,
    run: AttemptRun,
    continued?: string,
  ): Promise<Acceptance> {
    const attachTerminal = terminalHandoffRequested();
    // The locked keep rechecks machine facts before local registration and effects.
    const local = this.conflictWith(request, [], new Map(), continued);
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
            this.owned,
            this.verifying,
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
        refusal = this.conflictWith(
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
      this.owned.release(attempt.id);
      return { kind: "accepted", attempt: this.owned.observed(keptAttempt) };
    }
    if (this.owned.closed)
      return {
        kind: "failed",
        reason: "refused",
        explanation:
          "This dashboard stopped before admission finished. The attempt was kept for recovery; nothing was started or launched.",
      };
    const own = this.owned.own(request, keptAttempt);
    rememberTerminalHandoff(attempt.id, attachTerminal);
    void settleAttempt(this.owned, own, run);
    return { kind: "accepted", attempt: this.owned.observed(keptAttempt) };
  }

  // Waits for an owned attempt's next change, or none when it has changed
  // since the observation counting `seen` changes; other attempts answer
  // immediately.
  changed(id: string, seen?: number): Promise<void> {
    return this.owned.nextChange(id, seen);
  }

  // The attempt this server runs under `id`, as it knows it now.
  observation(id: string): AttemptObservation | undefined {
    const own = this.owned.get(id);
    return own && this.owned.observed(own.attempt);
  }

  // Ends every owned attempt's waits; kept attempts stay as last written,
  // for reconciliation.
  close(): void {
    this.owned.close();
  }
}
