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
import type { PublishedSource } from "../src/publishedSource.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { launchHost } from "./launchHosts.ts";
import { launchHosts } from "../src/sessionCapabilities.ts";
import { withStates } from "./launchStates.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { LaunchAttemptOwner } from "./launchAttemptOwner.ts";
import { startStillRunning } from "./launchAttemptConflicts.ts";
import {
  keptCreations,
  keptSession,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
import { creationView } from "./launchCreation.ts";
import { preAcceptanceAnswer } from "./launchPreAcceptance.ts";
import { SavedSessionServices } from "./savedSessionServices.ts";
import { StartProgress } from "./startProgress.ts";
import { attemptRun } from "./launchRun.ts";
import { verifyLaunch } from "./launchVerification.ts";
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

// How long a launch verification waits for its host's session listing.
const verifyWaitMs = 10_000;

export class AgentLaunches {
  private readonly owner = new LaunchAttemptOwner();
  private readonly progress = new StartProgress();
  private readonly savedSessionServices = new SavedSessionServices();

  async machineSessions(): Promise<readonly LaunchWithState[]> {
    await this.savedSessionServices.refresh();
    const kept = await keptRecordsByProject();
    return withStates(
      machineFolder(),
      configuredProjects().flatMap((source) => kept.get(source.id) ?? []),
    );
  }

  async creations() {
    return (await keptCreations()).map((record) => creationView(record));
  }

  // Legacy Claude-only machine-answer projection, in catalog order.
  // Host-qualified capabilities are answered by establishingHosts.
  establishingProjects(): Promise<readonly string[]> {
    return establishing("execution", "claude");
  }

  // Legacy Claude-only preparation projection, in catalog order.
  establishingPreparation(): Promise<readonly string[]> {
    return establishing("refinement", "claude");
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
    await this.savedSessionServices.refresh();
    const [joined] = await withStates(projectFolder(source), [record]);
    return joined ?? { ...record, sessionState: { kind: "unknown" } };
  }

  // A kept session and existing project folder; no native command is run.
  async recorded(
    source: PublishedSource,
    session: SessionReference,
  ): Promise<Recorded> {
    await this.savedSessionServices.refresh();
    const record = await keptSession(source.id, session);
    if (record === undefined) {
      return { kind: "unrecorded" };
    }
    const folder = projectFolder(source);
    return (await folderExists(folder))
      ? { kind: "recorded", record, folder }
      : { kind: "folder-not-found", folder };
  }

  // The attempts this machine keeps and those this server owns, and whether
  // the kept ones could be read.
  attempts(): Promise<{
    readonly attempts: readonly AttemptObservation[];
    readonly readable: boolean;
  }> {
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
    reportingOrigin?: string,
  ): Promise<Acceptance> {
    // A matching launch still running is answered before its own creation
    // evidence or kept start could be mistaken for this request's.
    const answer =
      this.owner.submitted(request) ??
      (await preAcceptanceAnswer(source, request));
    if (answer !== undefined) return answer;
    return this.owner.accept(
      request,
      (own, notePublication) =>
        attemptRun(source, own, notePublication, this.progress),
      reportingOrigin,
    );
  }

  // Continues the project's kept attempt `id` that needs reconciliation
  // through the same pre-launch answers and run as a launch, so its kept
  // start, host creation, or unconfirmed input is recovered by the existing
  // rules; answering once it is accepted again, or why it was not. While its
  // earlier start still runs here, it is not continued, so that start's
  // result is not mistaken for this attempt's.
  continueAttempt(source: PublishedSource, id: string): Promise<Acceptance> {
    return this.owner.continueAttempt(
      source.id,
      id,
      async (request) =>
        request.workflow !== "ad-hoc" &&
        this.progress.for(request.workflow).running(source.id, request.identity)
          ? startStillRunning
          : preAcceptanceAnswer(source, request),
      (own, notePublication) =>
        attemptRun(source, own, notePublication, this.progress),
    );
  }

  reconcile(source: PublishedSource, id: string) {
    return this.owner.reconcile(source.id, id);
  }

  // Settles the project's story attempt `id` whose launch is uncertain from
  // its host's own session listing, read once and bounded, or answers why it
  // stays unresolved.
  verify(source: PublishedSource, id: string) {
    return this.owner.verify(source.id, id, (attempt) =>
      verifyLaunch(source, attempt, AbortSignal.timeout(verifyWaitMs)),
    );
  }

  // Detaches native clients and ends launch waits when the server closes.
  // Kept attempts stay as last written, for reconciliation; native work goes
  // on.
  close(): void {
    this.savedSessionServices.close();
    this.owner.close();
    for (const host of launchHosts) launchHost(host)?.close?.();
  }
}
