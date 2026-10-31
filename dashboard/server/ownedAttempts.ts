// What this server holds in memory of the launch attempts it accepted
// (`./launchAttemptOwner.ts`): each attempt it runs, or whose settled state no
// read has found kept yet, by id, with what waits for its next change. Closing
// ends ownership and every wait; recorded workers may remain alive.

import { startTimeoutMs } from "./launchStart.ts";
import { attemptWorkerRunning } from "./launchAttemptWorker.ts";
import { settleAttempt, type AttemptRun } from "./launchAttemptSettlement.ts";

import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchAttemptRecord,
} from "../src/agentLaunch.ts";

// An attempt this server accepted: the request the run uses (as kept after
// admission, including materialized attachment paths), what is kept of it,
// the controller that ends its waits, and how many changes of it this server
// has told so far.
export type OwnedAttempt = {
  readonly request: AgentLaunchRequest;
  readonly controller: AbortController;
  attempt: LaunchAttemptRecord;
  changes: number;
};

export class OwnedAttempts {
  private readonly byId = new Map<string, OwnedAttempt>();
  private readonly settlements = new Set<Promise<void>>();

  // Ownership includes the final durable outcome write, after native confirmation.
  drain(): Promise<void> {
    return Promise.all(this.settlements).then(() => undefined);
  }

  settle(own: OwnedAttempt, run: AttemptRun): void {
    const settlement = settleAttempt(this, own, run);
    this.settlements.add(settlement);
    void settlement.then(
      () => this.settlements.delete(settlement),
      () => this.settlements.delete(settlement),
    );
  }

  // Each owned attempt's next change while something waits for it, by id.
  private readonly nextChanges = new Map<
    string,
    { readonly change: Promise<void>; readonly tell: () => void }
  >();
  private closedNow = false;

  get closed(): boolean {
    return this.closedNow;
  }

  get(id: string): OwnedAttempt | undefined {
    return this.byId.get(id);
  }

  // The project's attempt `id`, an owned one as held, else as `kept` holds
  // it.
  held(
    kept: readonly LaunchAttemptRecord[],
    sourceId: string,
    id: string,
  ): LaunchAttemptRecord | undefined {
    const found =
      this.byId.get(id)?.attempt ?? kept.find((attempt) => attempt.id === id);
    return found?.request.source === sourceId ? found : undefined;
  }

  // Holds an owned attempt as the store now keeps it.
  holdAsKept(attempt: LaunchAttemptRecord): void {
    const own = this.byId.get(attempt.id);
    if (own !== undefined) own.attempt = attempt;
  }

  // The `kept` attempts and those owned, oldest first, each as this server
  // knows it (`observed`).
  known(kept: readonly LaunchAttemptRecord[]): readonly AttemptObservation[] {
    const keptIds = new Set(kept.map((attempt) => attempt.id));
    return [
      ...kept,
      ...[...this.byId.values()]
        .map(({ attempt }) => attempt)
        .filter((attempt) => !keptIds.has(attempt.id)),
    ].map((attempt) => this.observed(attempt));
  }

  // The requests of the owned attempts that have not settled.
  unsettledRequests(): AgentLaunchRequest[] {
    return [...this.byId.values()]
      .filter(({ attempt }) => attempt.outcome === undefined)
      .map(({ request }) => request);
  }

  // Unsettled requests and known attempts for a conflict check. When
  // `excluding` is set, that owned attempt is omitted so a keep under the
  // write lock does not treat itself as a conflict; a continued attempt stays
  // in `known` so `ownOpenSession` can recognize its own open record.
  forConflict(
    kept: readonly LaunchAttemptRecord[],
    excluding?: string,
    continued?: string,
  ): {
    readonly unsettled: readonly AgentLaunchRequest[];
    readonly known: readonly AttemptObservation[];
  } {
    const excluded = excluding === undefined ? undefined : this.get(excluding);
    return {
      unsettled: this.unsettledRequests().filter(
        (entry) => entry !== excluded?.request,
      ),
      known: this.known(kept).filter(
        (entry) => entry.id !== excluding || entry.id === continued,
      ),
    };
  }

  // An attempt as held here or kept: ownership grants execution rights;
  // recorded process liveness protects unsettled work on every server.
  observed(attempt: LaunchAttemptRecord): AttemptObservation {
    const own = this.byId.get(attempt.id);
    const held = own?.attempt ?? attempt;
    const owned =
      own !== undefined && !this.closedNow && held.outcome === undefined;
    const running = owned || attemptWorkerRunning(held);
    const threshold = Date.parse(held.acceptedAt) + startTimeoutMs();
    return {
      ...held,
      owned,
      running,
      // Only an attempt this server runs has a next change to wait for.
      ...(own !== undefined && owned ? { changes: own.changes } : {}),
      ...(running &&
      held.worker?.step === "start" &&
      held.slowSince === undefined &&
      Date.now() >= threshold
        ? { slowSince: new Date(threshold).toISOString() }
        : {}),
    };
  }

  own(request: AgentLaunchRequest, attempt: LaunchAttemptRecord): OwnedAttempt {
    const own = {
      request,
      controller: new AbortController(),
      attempt,
      changes: 0,
    };
    this.byId.set(attempt.id, own);
    return own;
  }

  release(id: string): void {
    this.byId.delete(id);
  }

  // Releases each owned attempt whose settled state `kept` holds, so it is
  // answered from the store from now on.
  releaseKeptSettled(kept: readonly LaunchAttemptRecord[]): void {
    for (const attempt of kept) {
      if (
        attempt.settledAt !== undefined &&
        this.byId.get(attempt.id)?.attempt.settledAt === attempt.settledAt
      )
        this.byId.delete(attempt.id);
    }
  }

  // Settles once the owned attempt `id` changes, or at once when it is not
  // an unsettled attempt this open server runs, or when it has changed since
  // the observation counting `seen` changes: a change told while its caller
  // was not waiting is never missed.
  nextChange(id: string, seen?: number): Promise<void> {
    const own = this.byId.get(id);
    if (
      this.closedNow ||
      own === undefined ||
      own.attempt.outcome !== undefined ||
      (seen !== undefined && seen !== own.changes)
    )
      return Promise.resolve();
    const waited = this.nextChanges.get(id);
    if (waited !== undefined) return waited.change;
    let tell = () => {};
    const change = new Promise<void>((resolve) => {
      tell = resolve;
    });
    this.nextChanges.set(id, { change, tell });
    return change;
  }

  // Tells what waits for the attempt's next change that it changed.
  changed(id: string): void {
    const own = this.byId.get(id);
    if (own !== undefined) own.changes += 1;
    this.nextChanges.get(id)?.tell();
    this.nextChanges.delete(id);
  }

  // Ends every owned attempt's waits.
  close(): void {
    this.closedNow = true;
    for (const { controller } of this.byId.values()) controller.abort();
    for (const id of [...this.nextChanges.keys()]) this.changed(id);
  }
}
