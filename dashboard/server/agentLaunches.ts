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
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { recordedRequest } from "./hostLaunch.ts";
import {
  keepRecord,
  updateRecord,
  keptRecords,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
import { establishedFacts } from "./startLaunch.ts";
import { StartProgress } from "./startProgress.ts";
import { removeStart } from "./startStore.ts";
import { started } from "./launchStart.ts";
import {
  establishing,
  establishingHosts,
  offeredDefinitions,
  keptStarts,
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
  private readonly running = new Set<AbortController>();
  private readonly progress = new StartProgress();

  async machineSessions(): Promise<readonly LaunchWithState[]> {
    const kept = await keptRecordsByProject();
    return withStates(
      machineFolder(),
      catalog.flatMap((source) => kept.get(source.id) ?? []),
    );
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

  // Requester detachment leaves the launch and its durable evidence alive.
  async launch(
    source: PublishedSource,
    request: AgentLaunchRequest,
  ): Promise<LaunchResult> {
    const folder = projectFolder(source);
    if (!(await folderExists(folder))) {
      return {
        kind: "failed",
        reason: "folder-not-found",
        explanation: `The project folder ${folder.shown} was not found on this machine. Nothing was launched.`,
      };
    }
    const pending = (await keptRecords(source.id)).find(
      (record) =>
        record.request.host === request.host &&
        record.request.workflow === request.workflow &&
        request.workflow !== "ad-hoc" &&
        record.request.workflow !== "ad-hoc" &&
        record.request.identity === request.identity &&
        record.firstInput !== undefined &&
        record.firstInput.state !== "confirmed",
    );
    if (pending !== undefined)
      return {
        kind: "uncertain",
        reason: "unconfirmed",
        explanation:
          "This conversation's first input is not confirmed. Continue the recorded conversation before starting again.",
      };
    const start = await started(source, request, folder, this.progress);
    if (start.kind === "stopped") {
      return start.result;
    }
    const began = new Date();
    const recording = recordedRequest(request, began);
    const controller = new AbortController();
    this.running.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
    }, launchTimeoutMs());
    try {
      const host = launchHost(request.host);
      if (host === undefined) {
        throw new Error("An admitted launch has no available host.");
      }
      let retained: LaunchRecord | undefined;
      const recordEvidence = async (
        session: LaunchRecord["session"],
        firstInput: NonNullable<LaunchRecord["firstInput"]>,
      ) => {
        const record: LaunchRecord = {
          request: recording,
          session,
          firstInput,
          ...(start.kind === "established" ? start.handoff.established : {}),
          launchedAt: retained?.launchedAt ?? began.toISOString(),
        };
        if (retained === undefined) await keepRecord(source.id, record);
        else if (!(await updateRecord(source.id, record)))
          throw new Error("The launch record was deleted.");
        retained = record;
      };
      const launched = await host.launch(
        source,
        recording,
        folder,
        controller.signal,
        start.kind === "established" ? start : undefined,
        recordEvidence,
      );
      if (launched.kind !== "launched") {
        return start.kind === "established" && launched.kind === "failed"
          ? {
              ...launched,
              explanation: `${launched.explanation} ${start.workflow.publishedWithoutSession(start)}`,
            }
          : launched;
      }
      const record: LaunchRecord = retained ?? {
        request: recording,
        session: launched.session,
        ...(start.kind === "established" ? start.handoff.established : {}),
        launchedAt: new Date().toISOString(),
      };
      if (retained === undefined) await keepRecord(source.id, record);
      if (start.kind === "established") {
        await removeStart(
          source.id,
          establishedFacts(start.handoff.established).identity,
          start.workflow.workflow,
        );
      }
      return {
        kind: "launched",
        record: { ...record, sessionState: launched.sessionState },
      };
    } finally {
      clearTimeout(timer);
      this.running.delete(controller);
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
