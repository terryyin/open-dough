// Common launch lifetime: accept a launch with its exact request kept before
// any side effect (`./launchAttemptOwner.ts`), establish the workflow start,
// delegate to its host, and keep durable evidence and the attempt's outcome,
// whatever happens to the caller. Origin alone decides every story fact.

import {
  needsReconciliation,
  laterAttempt,
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
import { sameLaunch } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { LaunchAdmission } from "./launchAdmission.ts";
import { configuredProjects } from "./projectConfiguration.ts";
import { launchHost } from "./launchHosts.ts";
import { launchHosts } from "../src/sessionCapabilities.ts";
import { withStates } from "./launchStates.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { LaunchAttemptOwner } from "./launchAttemptOwner.ts";
import { changedAttempt } from "./launchAttemptChanges.ts";
import { keptCreations, keptRecordsByProject } from "./launchRecordStore.ts";
import {
  lookupRecordedSession,
  type Recorded,
} from "./recordedSessionLookup.ts";
import { creationView } from "./launchCreation.ts";
import {
  preAcceptanceAnswer,
  preContinuationAnswer,
  replacementWriterBlock,
} from "./launchPreAcceptance.ts";
import { SavedSessionServices } from "./savedSessionServices.ts";
import { StartProgress } from "./startProgress.ts";
import { attemptRun } from "./launchRun.ts";
import type { AttemptRun } from "./launchAttemptSettlement.ts";
import { verifyLaunch } from "./launchVerification.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";
import {
  establishing,
  establishingHosts,
  offeredDefinitions,
  keptStarts,
  sessionPolicies,
} from "./launchCatalog.ts";
import { machineFolder, projectFolder } from "./projectFolders.ts";
import {
  applyPreparedWorktreeUpdate,
  prepareWorktreeUpdate,
} from "./worktreeUpdateRetry.ts";

// How long a launch verification waits for its host's session listing.
const verifyWaitMs = 10_000;

export class AgentLaunches {
  private readonly owner = new LaunchAttemptOwner();
  private readonly admission = new LaunchAdmission();

  async drain(): Promise<void> {
    await this.admission.drain();
    await this.owner.drain();
  }
  private readonly progress = new StartProgress();
  private readonly savedSessionServices = new SavedSessionServices();

  // A session bound after its quiet report has its native Done started there.
  constructor(private readonly doneMarks: NativeDoneMarks) {}

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
    return keptStarts();
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
    return lookupRecordedSession(source, session);
  }

  // The attempts this machine keeps and those this server owns, and whether
  // the kept ones could be read.
  attempts(): Promise<{
    readonly attempts: readonly AttemptObservation[];
    readonly readable: boolean;
  }> {
    return this.owner.attempts();
  }

  // Waits for a change after the observation counting `seen` changes, then
  // answers the attempt as this server knows it.
  changed(id: string, waitMs: number, seen?: number): Promise<ChangedAnswer> {
    return changedAttempt(this.owner, id, waitMs, seen);
  }

  // Accepts a launch, answering once it is accepted; the launch goes on
  // whatever happens to the caller.
  accept(
    source: PublishedSource,
    request: AgentLaunchRequest,
    reportingOrigin?: string,
  ): Promise<Acceptance> {
    return this.admission.run(async () => {
      // A matching live launch is answered before its evidence can be mistaken
      // for a retry. Settled recoverable session starts reuse locked continuation.
      const submitted = this.owner.submitted(request);
      if (submitted !== undefined) return submitted;
      if (request.workflow === "ad-hoc") {
        const { attempts } = await this.owner.attempts();
        const retained = attempts
          .filter((attempt) => sameLaunch(attempt.request, request))
          .reduce<AttemptObservation | undefined>(laterAttempt, undefined);
        if (retained !== undefined && needsReconciliation(retained))
          return this.continueRequest(source, retained.id);
      }
      const blocked = await replacementWriterBlock(source, request);
      if (blocked !== undefined) return blocked;
      const answer = await preAcceptanceAnswer(source, request);
      if (answer !== undefined) return answer;
      return this.owner.accept(
        request,
        this.runAttempt(source),
        reportingOrigin,
      );
    });
  }

  // Continues the kept attempt through the same pre-launch checks and run.
  // Its kept start, creation, or unconfirmed input is recovered by existing
  // rules; an earlier start still running here must finish first.
  continueAttempt(source: PublishedSource, id: string): Promise<Acceptance> {
    return this.admission.run(() => this.continueRequest(source, id));
  }

  // Applies the verified release updater to the attempt's launch worktree,
  // then continues that same attempt. A refused update does not launch.
  updateWorktreeAndRetry(
    source: PublishedSource,
    id: string,
  ): Promise<Acceptance> {
    return this.admission.run(async () => {
      const { attempts } = await this.owner.attempts();
      const prepared = await prepareWorktreeUpdate(source, id, attempts);
      if (prepared.kind !== "ready") return prepared;
      const refused = await applyPreparedWorktreeUpdate(prepared);
      return refused ?? this.continueRequest(source, id);
    });
  }

  private continueRequest(
    source: PublishedSource,
    id: string,
  ): Promise<Acceptance> {
    return this.owner.continueAttempt(
      source.id,
      id,
      (request) => preContinuationAnswer(source, id, request, this.progress),
      this.runAttempt(source),
    );
  }

  private runAttempt(source: PublishedSource): AttemptRun {
    return (...args) =>
      attemptRun(source, ...args, this.progress, this.doneMarks);
  }

  reconcile(source: PublishedSource, id: string) {
    return this.owner.reconcile(source.id, id);
  }

  // Settles the project's story attempt `id` whose launch is uncertain from
  // its host's own session listing, read once and bounded, or answers why it
  // stays unresolved.
  verify(source: PublishedSource, id: string) {
    return this.owner.verify(source.id, id, (attempt) =>
      verifyLaunch(
        source,
        attempt,
        AbortSignal.timeout(verifyWaitMs),
        this.doneMarks,
      ),
    );
  }

  // Detaches native clients and ends launch waits when the server closes.
  // Kept attempts stay for reconciliation; native work goes on.
  close(): void {
    this.savedSessionServices.close();
    this.owner.close();
    for (const host of launchHosts) launchHost(host)?.close?.();
  }
}
