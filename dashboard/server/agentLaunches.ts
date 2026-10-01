// Common launch lifetime: establish the workflow start, delegate to its host,
// and keep durable evidence. Origin alone decides every story fact.

import {
  type AgentLaunchRequest,
  type KeptStart,
  type OfferedDefinition,
  type RunningStart,
  type LaunchWithState,
  type LaunchRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import { catalog, type PublishedSource } from "../src/publishedSource.ts";
import { launchHost } from "./launchHosts.ts";
import { launchHosts } from "../src/sessionCapabilities.ts";
import { withStates } from "./launchStates.ts";
import type { SessionReference } from "../src/sessionReference.ts";
import { recordedRequest, withStartPolicy } from "./hostLaunch.ts";
import {
  creationOf,
  keptCreations,
  keptRecords,
  keptSession,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
import { creationRecovery } from "../src/launchCreation.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import { establishedFacts } from "./startLaunch.ts";
import { StartProgress } from "./startProgress.ts";
import { launchRun } from "./launchRun.ts";
import { started } from "./launchStart.ts";
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

const defaultLaunchWaitMs = 30_000;

// A bounded launch wait; test configuration may shorten it.
function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

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
  private readonly running = new Set<
    AbortController & { request: AgentLaunchRequest }
  >();
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
    const record = await keptSession(source.id, session);
    if (record === undefined) {
      return { kind: "unrecorded" };
    }
    const folder = projectFolder(source);
    return (await folderExists(folder))
      ? { kind: "recorded", record, folder }
      : { kind: "folder-not-found", folder };
  }

  // Requester detachment leaves the launch and its durable evidence alive.
  async launch(
    source: PublishedSource,
    request: AgentLaunchRequest,
  ): Promise<LaunchResult> {
    if (
      request.host === "codex" &&
      [...this.running].some((entry) => sameLaunch(entry.request, request))
    )
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          "This launch is already being reconciled or submitted. Wait for its result; no duplicate input or conversation was created.",
      };
    const controller = Object.assign(new AbortController(), { request });
    this.running.add(controller);
    try {
      return await this.attempt(source, request, controller);
    } finally {
      this.running.delete(controller);
    }
  }

  private async attempt(
    source: PublishedSource,
    request: AgentLaunchRequest,
    controller: AbortController,
  ): Promise<LaunchResult> {
    const folder = projectFolder(source);
    if (!(await folderExists(folder))) {
      return {
        kind: "failed",
        reason: "folder-not-found",
        explanation: `The project folder ${folder.shown} was not found on this machine. Nothing was launched.`,
      };
    }
    const began = new Date();
    const requested = recordedRequest(request, began);
    const creation =
      request.host === "codex" ? await creationOf(requested) : undefined;
    if (creation !== undefined)
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          creation === "unreadable"
            ? "This machine's launch evidence is unreadable. Reconcile it with native Codex history before starting again; no new conversation was created."
            : creationRecovery(creation),
      };
    const pending = (await keptRecords(source.id)).find(
      (record) =>
        sameLaunch(record.request, request) &&
        record.firstInput !== undefined &&
        record.firstInput.state !== "confirmed" &&
        record.firstInput.state !== "not-requested",
    );
    const start =
      pending === undefined
        ? await started(source, request, folder, this.progress)
        : ({ kind: "none" } as const);
    if (start.kind === "stopped") return start.result;
    const recording =
      pending?.request ??
      (start.kind === "established"
        ? withStartPolicy(requested, start.policy)
        : requested);
    const timer = setTimeout(() => {
      controller.abort();
    }, launchTimeoutMs());
    try {
      return await launchRun(
        source,
        recording,
        folder,
        began,
        start,
        controller,
        pending,
      );
    } finally {
      clearTimeout(timer);
      if (start.kind === "established") {
        this.progress
          .for(start.workflow.workflow)
          .clear(
            source.id,
            establishedFacts(start.handoff.established).identity,
          );
      }
    }
  }

  // Detaches native clients and ends launch waits when the server closes.
  close(): void {
    for (const controller of this.running) {
      controller.abort();
    }
    this.running.clear();
    for (const host of launchHosts) launchHost(host)?.close?.();
  }
}
