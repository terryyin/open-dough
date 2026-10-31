// Keeps one attempt per story before effects, then settles independently of
// its caller. Interrupted attempts resume their kept request and identity;
// reconciliation and verification settle them from retained evidence.

import { randomUUID } from "node:crypto";
import {
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
  type ReconciledAnswer,
  type VerifiedAnswer,
} from "../src/agentLaunch.ts";
import {
  alreadySubmitted,
  unreadableEvidence,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { reconcileAttempt } from "./launchAttemptReconciliation.ts";
import {
  verifyAttempt,
  type LaunchVerifier,
} from "./launchAttemptVerification.ts";
import type { AttemptRun } from "./launchAttemptSettlement.ts";
import { keptAttempts } from "./launchAttemptStore.ts";
import { OwnedAttempts } from "./ownedAttempts.ts";
import { continueAttempt } from "./launchAttemptContinuation.ts";
import { admitAttempt, conflictWithAttempts } from "./launchAttemptAdmit.ts";
import {
  abandonAttachmentClaims,
  recordedRequestWithMaterializedAttachments,
  removeLaunchAttachments,
} from "./launchAttachmentClaims.ts";

export class LaunchAttemptOwner {
  private readonly owned = new OwnedAttempts();
  // Includes the final durable outcome write, after native confirmation.
  drain(): Promise<void> {
    return this.owned.drain();
  }
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
  // the caller. A request that cannot be kept starts nothing. Attachment
  // claims become absolute paths under launch-attachments/<attempt>/ only
  // once this attempt id is chosen; the kept request holds those paths, never
  // image bytes.
  async accept(
    request: AgentLaunchRequest,
    run: AttemptRun,
    reportingOrigin?: string,
  ): Promise<Acceptance> {
    const kept = await keptAttempts();
    if (kept === undefined) {
      abandonAttachmentClaims(request.attachmentClaims);
      return unreadableEvidence;
    }
    // Refuse live workers before waiting on their note; admission rechecks under lock.
    const conflict = conflictWithAttempts(this.owned, request, kept, new Map());
    if (conflict !== undefined) {
      abandonAttachmentClaims(request.attachmentClaims);
      return conflict;
    }
    const id = randomUUID();
    const recorded = recordedRequestWithMaterializedAttachments(id, request);
    try {
      const acceptance = await admitAttempt(
        this.owned,
        this.verifying,
        request,
        {
          id,
          request: recorded,
          acceptedAt: new Date().toISOString(),
          ...(reportingOrigin === undefined ? {} : { reportingOrigin }),
          publication: {
            kind: request.workflow === "ad-hoc" ? "none" : "unknown",
          },
        },
        run,
      );
      if (acceptance.kind !== "accepted") removeLaunchAttachments(id);
      return acceptance;
    } catch (error) {
      removeLaunchAttachments(id);
      throw error;
    }
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
      (attempt) =>
        admitAttempt(
          this.owned,
          this.verifying,
          attempt.request,
          attempt,
          run,
          id,
        ),
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
