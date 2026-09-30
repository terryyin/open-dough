// Common launch lifetime: establish the shared workflow start, delegate native
// launch to the selected host, and keep its confirmed evidence. Catalog reads,
// current native observations and deterministic start each retain their owner.
// Origin alone decides every story fact; a detached browser leaves launch alive.

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
import { withStates } from "./launchStates.ts";
import { sessionKey, type SessionReference } from "../src/sessionReference.ts";
import { recordedRequest } from "./hostLaunch.ts";
import {
  keepRecord,
  keptRecords,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
import { establishedFacts } from "./startLaunch.ts";
import { StartProgress } from "./startProgress.ts";
import { removeStart } from "./startStore.ts";
import { started } from "./launchStart.ts";
import {
  establishing,
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

// How long one launch -- the host's start and its confirmation -- may take
// before its answer is uncertain. A test may shorten it through the
// environment.
function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

// One session this dashboard recorded for the project, in its existing
// folder, or why there is none.
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
  // The starts running now with their phases; the one owner of what runs.
  private readonly progress = new StartProgress();

  // The machine's sessions: every catalog project's kept records, projects
  // in catalog order and each project's oldest first, joined with one
  // listing. Each record names its project (`request.source`).
  async machineSessions(): Promise<readonly LaunchWithState[]> {
    const kept = await keptRecordsByProject();
    return withStates(
      machineFolder(),
      catalog.flatMap((source) => kept.get(source.id) ?? []),
    );
  }

  // The catalog projects whose installed skill establishes a start when
  // Start execution is pressed, by id, in catalog order.
  establishingProjects(): Promise<readonly string[]> {
    return establishing("execution");
  }

  // The catalog projects whose installed skill ships the preparation start and
  // its formatter, by id, in catalog order.
  establishingPreparation(): Promise<readonly string[]> {
    return establishing("refinement");
  }

  offeredDefinitions(): Promise<readonly OfferedDefinition[]> {
    return offeredDefinitions();
  }

  keptStarts(): Promise<readonly KeptStart[]> {
    return keptStarts(this.progress);
  }

  // The starts running in this server now, each with its workflow and phase.
  runningStarts(): readonly RunningStart[] {
    return this.progress.all();
  }

  // One kept record's session state read now.
  async stateOf(
    source: PublishedSource,
    record: LaunchRecord,
  ): Promise<LaunchWithState> {
    const [joined] = await withStates(projectFolder(source), [record]);
    return joined ?? { ...record, sessionState: { kind: "unknown" } };
  }

  // The session this dashboard recorded for this project, if it did, in the
  // project folder, if that exists. Runs no `claude`.
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

  // A launch settles on its own even if the requester goes away, so its
  // record is kept for the next read.
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
      const launched = await host.launch(
        source,
        recording,
        folder,
        controller.signal,
        start.kind === "established" ? start : undefined,
      );
      if (launched.kind !== "launched") {
        return start.kind === "established" && launched.kind === "failed"
          ? {
              ...launched,
              explanation: `${launched.explanation} ${start.workflow.publishedWithoutSession(start)}`,
            }
          : launched;
      }
      const record: LaunchRecord = {
        request: recording,
        session: launched.session,
        ...(start.kind === "established" ? start.handoff.established : {}),
        launchedAt: new Date().toISOString(),
      };
      await keepRecord(source.id, record);
      if (start.kind === "established") {
        // The session carries the start now; the launch record keeps it.
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

  // Ends any host process still starting when the server closes.
  close(): void {
    for (const controller of this.running) {
      controller.abort();
    }
    this.running.clear();
  }
}
