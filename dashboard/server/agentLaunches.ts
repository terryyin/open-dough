// Common launch lifetime: accept a launch with its exact request kept before
// any side effect (`./launchAttemptOwner.ts`), establish the workflow start,
// delegate to its host, and keep durable evidence and the attempt's outcome,
// whatever happens to the caller. Origin alone decides every story fact.

import {
  type Acceptance,
  type AgentLaunchRequest,
  type ChangedAnswer,
  type AttemptObservation,
  type KeptStart,
  type OfferedDefinition,
  type RunningStart,
  type LaunchWithState,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import { catalog, type PublishedSource } from "../src/publishedSource.ts";
import { launchHost } from "./launchHosts.ts";
import { launchHosts } from "../src/sessionCapabilities.ts";
import { withStates } from "./launchStates.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { recordedRequest } from "./hostLaunch.ts";
import { LaunchAttemptOwner, type Unaccepted } from "./launchAttemptOwner.ts";
import {
  creationOf,
  keptCreations,
  keptRecords,
  keptRecordsByProject,
  pendingInputOf,
} from "./launchRecordStore.ts";
import { creationRecovery } from "../src/launchCreation.ts";
import { StartProgress } from "./startProgress.ts";
import { attemptRun } from "./launchRun.ts";
import { unconfirmedStart } from "./launchStart.ts";
import {
  establishing,
  establishingHosts,
  offeredDefinitions,
  keptStarts,
  sessionPolicies,
} from "./launchCatalog.ts";
import {
  folderExists,
  machineFolder,
  projectFolder,
  type ProjectFolder,
} from "./projectFolders.ts";

// A kept session in its existing project folder, or why none is available.
export type Recorded =
  | {
      readonly kind: "recorded";
      readonly record: LaunchRecord;
      readonly folder: ProjectFolder;
    }
  | { readonly kind: "unrecorded" }
  | { readonly kind: "folder-not-found"; readonly folder: ProjectFolder };

export class AgentLaunches {
  private readonly owner = new LaunchAttemptOwner();
  private readonly progress = new StartProgress();

  async machineSessions(): Promise<readonly LaunchWithState[]> {
    const kept = await keptRecordsByProject();
    return withStates(
      machineFolder(),
      catalog.flatMap((source) => kept.get(source.id) ?? []),
    );
  }

  creations() {
    return keptCreations();
  }

  // Projects with an installed execution start, in catalog order.
  establishingProjects(): Promise<readonly string[]> {
    return establishing("execution");
  }

  // Projects with installed preparation and its formatter, in catalog order.
  establishingPreparation(): Promise<readonly string[]> {
    return establishing("refinement");
  }

  establishingHosts() {
    return establishingHosts();
  }

  sessionPolicies() {
    return sessionPolicies();
  }

  offeredDefinitions(): Promise<readonly OfferedDefinition[]> {
    return offeredDefinitions();
  }

  keptStarts(): Promise<readonly KeptStart[]> {
    return keptStarts(this.progress);
  }

  runningStarts(): readonly RunningStart[] {
    return this.progress.all();
  }

  async stateOf(
    source: PublishedSource,
    record: LaunchRecord,
  ): Promise<LaunchWithState> {
    const [joined] = await withStates(projectFolder(source), [record]);
    return joined ?? { ...record, sessionState: { kind: "unknown" } };
  }

  // A kept session and existing project folder; no native command is run.
  async recorded(
    source: PublishedSource,
    session: SessionReference,
  ): Promise<Recorded> {
    const record = (await keptRecords(source.id)).find(
      (kept) => sessionKey(kept.session) === sessionKey(session),
    );
    if (record === undefined) {
      return { kind: "unrecorded" };
    }
    const folder = projectFolder(source);
    return (await folderExists(folder))
      ? { kind: "recorded", record, folder }
      : { kind: "folder-not-found", folder };
  }

  // The attempts this machine keeps and those this server owns.
  attempts(): Promise<readonly AttemptObservation[]> {
    return this.owner.attempts();
  }

  // Whether the attempt this server runs under `id` changed within `waitMs`
  // (true at once when it runs no such unsettled attempt), with the attempt
  // as this server knows it.
  async changed(id: string, waitMs: number): Promise<ChangedAnswer> {
    let expired: NodeJS.Timeout | undefined;
    const waited = new Promise<false>((resolve) => {
      expired = setTimeout(resolve, waitMs, false);
      expired.unref();
    });
    try {
      const changed = await Promise.race([
        this.owner.changed(id).then(() => true),
        waited,
      ]);
      const attempt = this.owner.observation(id);
      return attempt === undefined ? { changed } : { changed, attempt };
    } finally {
      clearTimeout(expired);
    }
  }

  // Accepts a launch, answering once it is accepted; the launch goes on
  // whatever happens to the caller.
  async accept(
    source: PublishedSource,
    request: AgentLaunchRequest,
  ): Promise<Acceptance> {
    const answer = await this.beforeAcceptance(source, request);
    if (answer !== undefined) return answer;
    return this.owner.accept(request, (own, notePublication) =>
      attemptRun(source, own, notePublication, this.progress),
    );
  }

  // What is answered before acceptance, with nothing started: a missing
  // folder, a Codex conversation awaiting reconciliation, or the start's own
  // pre-launch answer.
  private async beforeAcceptance(
    source: PublishedSource,
    request: AgentLaunchRequest,
  ): Promise<Unaccepted | undefined> {
    const folder = projectFolder(source);
    if (!(await folderExists(folder))) {
      return {
        kind: "failed",
        reason: "folder-not-found",
        explanation: `The project folder ${folder.shown} was not found on this machine. Nothing was launched.`,
      };
    }
    const creation =
      request.host === "codex"
        ? await creationOf(recordedRequest(request, new Date()))
        : undefined;
    if (creation !== undefined)
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          creation === "unreadable"
            ? "This machine's launch evidence is unreadable. Reconcile it with native Codex history before starting again; no new conversation was created."
            : creationRecovery(creation),
      };
    return (await pendingInputOf(source.id, request)) === undefined
      ? unconfirmedStart(source, request, folder)
      : undefined;
  }

  // Detaches native clients and ends launch waits when the server closes.
  // Kept attempts stay as last written, for reconciliation; native work goes
  // on.
  close(): void {
    this.owner.close();
    for (const host of launchHosts) launchHost(host)?.close?.();
  }
}
