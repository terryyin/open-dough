// What this server holds in memory of the launch attempts it accepted
// (`./launchAttemptOwner.ts`): each attempt it runs, or whose settled state no
// read has found kept yet, by id, with what waits for its next change. Once
// closed, none is said to run and every wait ends.

import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchAttemptRecord,
} from "../src/agentLaunch.ts";

// An attempt this server accepted: its request as asked, what is kept of it,
// and the controller that ends its waits.
export type OwnedAttempt = {
  readonly request: AgentLaunchRequest;
  readonly controller: AbortController;
  attempt: LaunchAttemptRecord;
};

export class OwnedAttempts {
  private readonly byId = new Map<string, OwnedAttempt>();
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

  // An attempt as this server knows it: an owned one as held, said to run
  // while it is unsettled and this server open.
  observed(attempt: LaunchAttemptRecord): AttemptObservation {
    const own = this.byId.get(attempt.id);
    return own === undefined
      ? { ...attempt, owned: false }
      : {
          ...own.attempt,
          owned: !this.closedNow && own.attempt.outcome === undefined,
        };
  }

  own(request: AgentLaunchRequest, attempt: LaunchAttemptRecord): OwnedAttempt {
    const own = { request, controller: new AbortController(), attempt };
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
  // an unsettled attempt this open server runs.
  nextChange(id: string): Promise<void> {
    const own = this.byId.get(id);
    if (
      this.closedNow ||
      own === undefined ||
      own.attempt.outcome !== undefined
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
