// The launch attempts this server accepted for the launch lifetime
// (`./agentLaunches.ts`): each is kept with its exact request
// (`./launchAttemptStore.ts`) before its run has any side effect, then run to
// its outcome whatever happens to the caller. Of a story's launches in any
// workflow, and of the same Codex launch, one at a time is accepted.

import { randomUUID } from "node:crypto";
import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  AttemptOutcome,
  LaunchAttemptRecord,
  LaunchResult,
  PublicationReceipt,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import {
  keepAttempt,
  keptAttempts,
  updateAttempt,
} from "./launchAttemptStore.ts";
import { alreadyStarting } from "./startLaunch.ts";

// An attempt this server accepted: its request as asked, what is kept of it,
// and the controller that ends its waits.
export type OwnedAttempt = {
  readonly request: AgentLaunchRequest;
  readonly controller: AbortController;
  attempt: LaunchAttemptRecord;
};

// Runs an accepted attempt, noting its publication receipt once known.
export type AttemptRun = (
  own: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
) => Promise<LaunchResult>;

// What was answered before anything was accepted or started.
export type Unaccepted = Exclude<Acceptance, { kind: "accepted" }>;

// A request's admission: answered without acceptance, or accepted with the
// outcome it settles to.
export type Admission =
  | { readonly answer: Unaccepted }
  | {
      readonly answer: Extract<Acceptance, { kind: "accepted" }>;
      readonly settled: Promise<LaunchResult>;
    };

// The story a launch is of, or undefined for an ad hoc session.
const storyOf = (request: AgentLaunchRequest) =>
  request.workflow === "ad-hoc" ? undefined : request.identity;

// The outcome an attempt keeps: a launched session by reference to its
// record, or the answer itself.
function attemptOutcome(result: LaunchResult): AttemptOutcome {
  return result.kind === "launched"
    ? {
        kind: "launched",
        session: {
          host: result.record.session.host,
          sessionId: result.record.session.sessionId,
        },
      }
    : result;
}

export class LaunchAttemptOwner {
  // The attempts this server accepted, by id, until it closes.
  private readonly owned = new Map<string, OwnedAttempt>();
  private closed = false;

  // The attempts this machine keeps and those this server owns, oldest
  // first; an owned attempt as this server knows it, even when its latest
  // state could not be written.
  async attempts(): Promise<readonly AttemptObservation[]> {
    const kept = (await keptAttempts()) ?? [];
    const keptIds = new Set(kept.map((attempt) => attempt.id));
    return [
      ...kept.map((attempt) => this.observed(attempt)),
      ...[...this.owned.values()]
        .filter(({ attempt }) => !keptIds.has(attempt.id))
        .map(({ attempt }) => this.observed(attempt)),
    ];
  }

  private observed(attempt: LaunchAttemptRecord): AttemptObservation {
    const own = this.owned.get(attempt.id);
    return own === undefined
      ? { ...attempt, owned: false }
      : {
          ...own.attempt,
          owned: !this.closed && own.attempt.outcome === undefined,
        };
  }

  // Accepts a request nothing else answered: its exact request is kept
  // before `run` has any side effect, then `run` goes on whatever happens to
  // the caller. A request that cannot be kept starts nothing.
  async accept(
    request: AgentLaunchRequest,
    run: AttemptRun,
  ): Promise<Admission> {
    // Checked and registered in one synchronous step, so of two requests of
    // one story in this server exactly one is accepted.
    const conflict = this.conflicting(request);
    if (conflict !== undefined) return { answer: conflict };
    // The confirmation of existing changes is transient: never kept.
    const kept = { ...request };
    if (kept.workflow !== "ad-hoc") delete kept.existingChanges;
    const own: OwnedAttempt = {
      request,
      controller: new AbortController(),
      attempt: {
        id: randomUUID(),
        request: kept,
        acceptedAt: new Date().toISOString(),
        publication:
          request.workflow === "ad-hoc"
            ? { kind: "none" }
            : { kind: "unknown" },
      },
    };
    this.owned.set(own.attempt.id, own);
    try {
      await keepAttempt(own.attempt);
    } catch {
      this.owned.delete(own.attempt.id);
      return {
        answer: {
          kind: "failed",
          reason: "unrecorded",
          explanation:
            "This machine's launch evidence could not be written, so the launch was not accepted. Nothing was started or launched.",
        },
      };
    }
    return {
      answer: { kind: "accepted", attempt: this.observed(own.attempt) },
      settled: this.settle(own, run),
    };
  }

  // An unsettled attempt this server owns that the request would duplicate:
  // the same Codex launch, or any workflow's launch of the same story.
  private conflicting(request: AgentLaunchRequest): Unaccepted | undefined {
    const unsettled = [...this.owned.values()]
      .filter(({ attempt }) => attempt.outcome === undefined)
      .map((own) => own.request);
    if (
      request.host === "codex" &&
      unsettled.some((other) => sameLaunch(other, request))
    )
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
      };
    const story = storyOf(request);
    if (
      story !== undefined &&
      unsettled.some(
        (other) => other.source === request.source && storyOf(other) === story,
      )
    )
      return {
        kind: "failed",
        reason: "already-starting",
        explanation: alreadyStarting,
      };
    return undefined;
  }

  // Runs an accepted attempt to its outcome and keeps it; anything the run
  // throws is its uncertain outcome, never an unhandled rejection.
  private async settle(
    own: OwnedAttempt,
    run: AttemptRun,
  ): Promise<LaunchResult> {
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
    return result;
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
    if (this.closed) return;
    try {
      await updateAttempt(own.attempt);
    } catch {
      // Answered from memory; see above.
    }
  }

  // Ends every owned attempt's waits; kept attempts stay as last written,
  // for reconciliation.
  close(): void {
    this.closed = true;
    for (const { controller } of this.owned.values()) {
      controller.abort();
    }
  }
}
