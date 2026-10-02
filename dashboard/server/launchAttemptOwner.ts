// The launch attempts this server accepted for the launch lifetime
// (`./agentLaunches.ts`): each is kept with its exact request
// (`./launchAttemptStore.ts`) before its run has any side effect, then run to
// its outcome whatever happens to the caller. Of a story's launches in any
// workflow, and of the same launch on any host, one at a time is accepted; a story
// whose earlier attempt no server runs any more and never settled accepts
// only that attempt's continuation, which runs its kept request again under
// the same identity. A settled attempt a page found reconciled with
// published state keeps when it was (`./launchAttemptReconciliation.ts`).
// Once a read finds its settled state kept, an attempt is answered from this
// machine's store rather than from memory (`./ownedAttempts.ts`).

import { randomUUID } from "node:crypto";
import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  LaunchAttemptRecord,
  LaunchResult,
  PublicationReceipt,
  ReconciledAnswer,
} from "../src/agentLaunch.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import {
  alreadySubmitted,
  conflicting,
  notContinued,
  unknownAttempt,
  unreadableEvidence,
  unrecordedAcceptance,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { reconcileAttempt } from "./launchAttemptReconciliation.ts";
import {
  attemptOutcome,
  keepAttempt,
  keptAttempts,
} from "./launchAttemptStore.ts";
import { OwnedAttempts, type OwnedAttempt } from "./ownedAttempts.ts";

// Runs an accepted attempt, noting its publication receipt once known.
export type AttemptRun = (
  own: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
) => Promise<LaunchResult>;

export class LaunchAttemptOwner {
  private readonly owned = new OwnedAttempts();

  // The attempts this machine keeps and those this server owns, oldest
  // first, an owned attempt as this server knows it; and whether the kept
  // ones could be read.
  async attempts(): Promise<{
    readonly attempts: readonly AttemptObservation[];
    readonly readable: boolean;
  }> {
    const read = await keptAttempts();
    const kept = read ?? [];
    const keptIds = new Set(kept.map((attempt) => attempt.id));
    const attempts = [
      ...kept,
      ...this.owned.records().filter((attempt) => !keptIds.has(attempt.id)),
    ].map((attempt) => this.owned.observed(attempt));
    this.owned.releaseKeptSettled(kept);
    return { attempts, readable: read !== undefined };
  }

  // The answer to a launch matching one this server still runs, if any.
  submitted(request: AgentLaunchRequest): Unaccepted | undefined {
    return alreadySubmitted(request, this.owned.unsettledRequests());
  }

  // Accepts a request nothing else answered: its exact request is kept
  // before `run` has any side effect, then `run` goes on whatever happens to
  // the caller. A request that cannot be kept starts nothing.
  async accept(
    request: AgentLaunchRequest,
    run: AttemptRun,
  ): Promise<Acceptance> {
    const kept = await keptAttempts();
    if (kept === undefined) return unreadableEvidence;
    // Checked and registered in one synchronous step, so of two requests of
    // one story in this server exactly one is accepted.
    const conflict = this.conflictWith(request, kept);
    if (conflict !== undefined) return conflict;
    // The confirmation of existing changes is transient: never kept.
    const keptRequest = { ...request };
    if (keptRequest.workflow !== "ad-hoc") delete keptRequest.existingChanges;
    return this.admit(
      request,
      {
        id: randomUUID(),
        request: keptRequest,
        acceptedAt: new Date().toISOString(),
        publication: {
          kind: request.workflow === "ad-hoc" ? "none" : "unknown",
        },
      },
      run,
    );
  }

  // Continues the project's kept attempt `id` that needs reconciliation:
  // what `before` answers its kept request is answered with the attempt
  // kept as it was; otherwise its kept request runs again under the same
  // identity, from its kept publication receipt.
  async continueAttempt(
    sourceId: string,
    id: string,
    before: (request: AgentLaunchRequest) => Promise<Unaccepted | undefined>,
    run: AttemptRun,
  ): Promise<Acceptance> {
    const read = await keptAttempts();
    if (read === undefined) return unreadableEvidence;
    const found = read.find(
      (attempt) => attempt.id === id && attempt.request.source === sourceId,
    );
    if (found === undefined) return unknownAttempt;
    const unneeded = notContinued(this.owned.observed(found));
    if (unneeded !== undefined) return unneeded;
    const answer = await before(found.request);
    if (answer !== undefined) return answer;
    // Read again: the attempt may have been continued or settled meanwhile.
    const kept = await keptAttempts();
    if (kept === undefined) return unreadableEvidence;
    const now =
      kept.find((entry) => entry.id === id) ?? this.owned.get(id)?.attempt;
    const stillUnneeded =
      now === undefined
        ? unknownAttempt
        : notContinued(this.owned.observed(now));
    if (stillUnneeded !== undefined) return stillUnneeded;
    const conflict = this.conflictWith(
      found.request,
      kept.filter((attempt) => attempt.id !== id),
    );
    if (conflict !== undefined) return conflict;
    return this.admit(
      found.request,
      {
        id,
        request: found.request,
        acceptedAt: found.acceptedAt,
        publication: found.publication,
      },
      run,
    );
  }

  // Notes that the project's settled attempt `id` reconciled with published
  // state, or answers why not.
  reconcile(sourceId: string, id: string): Promise<ReconciledAnswer> {
    return reconcileAttempt(this.owned, sourceId, id);
  }

  // An unsettled attempt the request would duplicate: one this server runs,
  // or a kept one no server runs.
  private conflictWith(
    request: AgentLaunchRequest,
    kept: readonly LaunchAttemptRecord[],
  ): Unaccepted | undefined {
    return conflicting(
      request,
      this.owned.unsettledRequests(),
      kept.filter(
        (attempt) =>
          attempt.outcome === undefined && !this.owned.has(attempt.id),
      ),
    );
  }

  // Owns the attempt and keeps it before `run` has any side effect, then
  // runs it whatever happens to the caller; one that cannot be kept is not
  // accepted and starts nothing.
  private async admit(
    request: AgentLaunchRequest,
    attempt: LaunchAttemptRecord,
    run: AttemptRun,
  ): Promise<Acceptance> {
    const own = this.owned.own(request, attempt);
    try {
      await keepAttempt(attempt);
    } catch {
      this.owned.release(attempt.id);
      return unrecordedAcceptance;
    }
    void this.settle(own, run);
    return { kind: "accepted", attempt: this.owned.observed(attempt) };
  }

  // Settles once the attempt this server runs under `id` changes (its
  // publication receipt is noted or it settles), or at once when it runs no
  // such unsettled attempt.
  changed(id: string): Promise<void> {
    return this.owned.nextChange(id);
  }

  // The attempt this server runs under `id`, as it knows it now.
  observation(id: string): AttemptObservation | undefined {
    const own = this.owned.get(id);
    return own && this.owned.observed(own.attempt);
  }

  // Runs an accepted attempt to its outcome and keeps it; anything the run
  // throws is its uncertain outcome, never an unhandled rejection.
  private async settle(own: OwnedAttempt, run: AttemptRun): Promise<void> {
    let result: LaunchResult;
    try {
      result = await run(own, (publication) =>
        this.note(own.attempt.id, { publication }),
      );
    } catch (error) {
      result = {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation: `The launch ended unexpectedly (${new HostOperationFailure(error instanceof Error ? error.message : String(error)).message}), so a session may or may not have started. Check this machine's sessions before starting again.`,
      };
    }
    await this.note(own.attempt.id, {
      outcome: attemptOutcome(result),
      settledAt: new Date().toISOString(),
    });
  }

  // Changes an owned attempt and keeps it. When the change cannot be written,
  // this owner still answers it while the store keeps the earlier, more
  // conservative state; a closed server writes nothing more.
  private async note(
    id: string,
    change: Partial<LaunchAttemptRecord>,
  ): Promise<void> {
    const own = this.owned.get(id);
    if (own === undefined) return;
    own.attempt = { ...own.attempt, ...change };
    if (this.owned.closed) return;
    try {
      await keepAttempt(own.attempt);
    } catch {
      // Answered from memory; see above.
    }
    this.owned.changed(id);
  }

  // Ends every owned attempt's waits; kept attempts stay as last written,
  // for reconciliation.
  close(): void {
    this.owned.close();
  }
}
