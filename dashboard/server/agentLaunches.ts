// Performs one admitted agent launch for the local launch boundary
// (`./agentLaunchPlugin.ts`): resolve the project folder
// (`./projectFolders.ts`), start the session (`./claudeLaunch.ts`) within
// the launch wait, and keep a confirmed result in this machine's launch
// record store (`./launchRecordStore.ts`), which outlives the server. The
// machine's sessions -- every catalog project's kept records -- are read at
// once, each answered with its session's state from one Claude Code listing
// (`./claudeCode.ts`), which is machine-wide and so runs in the machine's
// home folder, never stored; the same join, in the record's project folder,
// decides which recorded session the terminal boundary
// (`./agentTerminals.ts`) may attach to, and whether marking a recorded
// session done (`./doneMarks.ts`) stops it. Origin still decides every story
// fact.

import path from "node:path";
import {
  type AgentLaunchRequest,
  type KeptStart,
  type RunningStart,
  type LaunchWithState,
  type LaunchRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import { catalog, type PublishedSource } from "../src/publishedSource.ts";
import { claudeSessions } from "./claudeCode.ts";
import {
  launchClaude,
  recordedRequest,
  type EstablishedLaunch,
} from "./claudeLaunch.ts";
import {
  beginStart,
  establishesStart,
  formattedStart,
} from "./executionStart.ts";
import {
  keepRecord,
  keptRecords,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
import { shownWorkspace } from "./claudeWorkspace.ts";
import { StartProgress } from "./startProgress.ts";
import { keptStartsByProject, removeStart } from "./startStore.ts";
import {
  folderExists,
  machineFolder,
  projectFolder,
  type ProjectFolder,
} from "./projectFolders.ts";

const defaultLaunchWaitMs = 30_000;

// How long a records read waits on Claude Code's listing before answering
// each session's state unknown.
const listingWaitMs = 10_000;

// How long one launch -- the host's start and its confirmation -- may take
// before its answer is uncertain. A test may shorten it through the
// environment.
function launchTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_LAUNCH_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultLaunchWaitMs;
}

const defaultStartWaitMs = 120_000;

// How long an execution's start may run before the launch answers uncertain;
// the start itself is never aborted. A test may shorten it through the
// environment.
function startTimeoutMs(): number {
  const configured = Number(process.env["DOUGH_START_TIMEOUT_MS"]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultStartWaitMs;
}

// How a launch's start ended: there was none to run, it established the
// workspace the session opens in, or the launch stops with this answer.
type Started =
  | { readonly kind: "none" }
  | ({ readonly kind: "established" } & EstablishedLaunch)
  | { readonly kind: "stopped"; readonly result: LaunchResult };

function startFailed(
  explanation: string,
  reason: "start-refused" | "already-starting" = "start-refused",
): Started {
  return {
    kind: "stopped",
    result: { kind: "failed", reason, explanation },
  };
}

// The start an execution launch runs before its session, waiting at most
// `startTimeoutMs()` for it; the script goes on running when the wait ends.
async function started(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  progress: StartProgress,
): Promise<Started> {
  if (request.workflow !== "execution") {
    return { kind: "none" };
  }
  const planned = await beginStart(source, request, folder, progress);
  if (planned.kind === "not-applicable") {
    return { kind: "none" };
  }
  if (planned.kind === "refused") {
    return startFailed(planned.explanation, planned.reason);
  }
  let timer: NodeJS.Timeout | undefined;
  const expiry = new Promise<"expired">((resolve) => {
    timer = setTimeout(() => {
      resolve("expired");
    }, startTimeoutMs());
  });
  const attempt = await Promise.race([planned.attempt, expiry]);
  clearTimeout(timer);
  if (attempt === "expired") {
    // No launch follows the script that goes on running, so its phase ends
    // with it.
    void planned.attempt.finally(() => {
      progress.clear(source.id, request.identity);
    });
    return {
      kind: "stopped",
      result: {
        kind: "uncertain",
        reason: "timed-out",
        explanation: `The start did not finish within the wait, so the story may or may not be Taken. The start was kept and goes on in workspace ${planned.workspace.shown} on branch ${planned.branch}; pressing Start again resumes it.`,
      },
    };
  }
  if (attempt.kind === "refused") {
    return startFailed(attempt.explanation);
  }
  try {
    return {
      kind: "established",
      handoff: {
        start: attempt.start,
        formatted: await formattedStart(folder, attempt.start),
      },
      workspace: planned.workspace,
    };
  } catch {
    progress.clear(source.id, request.identity);
    return startFailed(
      `The story is Taken, but the installed skill's start formatter could not be read, so no session was started. Workspace ${planned.workspace.shown} on branch ${planned.branch}.`,
    );
  }
}

// What a failed session launch adds when its start already published the
// Take: who holds the story, that no session started, and the workspace the
// kept start resumes in.
function publishedWithoutSession({
  handoff,
  workspace,
}: EstablishedLaunch): string {
  const { agent } = handoff.start;
  return `${agent === undefined ? "Taken" : `Taken by ${agent}`}; no session started. Workspace ${workspace.shown}.`;
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

// Records joined by session id with Claude Code's listing read now in the
// folder. With no records, `claude` is not run.
async function withStates(
  folder: ProjectFolder,
  records: readonly LaunchRecord[],
): Promise<readonly LaunchWithState[]> {
  if (records.length === 0) {
    return [];
  }
  const listed = await claudeSessions(
    folder,
    AbortSignal.timeout(listingWaitMs),
  );
  const states = new Map(
    listed?.map((entry) => [entry.session.sessionId, entry.sessionState]),
  );
  return records.map((record) => ({
    ...record,
    sessionState:
      listed === undefined
        ? { kind: "unknown" }
        : (states.get(record.session.sessionId) ?? { kind: "unlisted" }),
  }));
}

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
  async establishingProjects(): Promise<readonly string[]> {
    const establishing = await Promise.all(
      catalog.map(async (source) =>
        (await establishesStart(projectFolder(source))) ? source.id : undefined,
      ),
    );
    return establishing.filter((id) => id !== undefined);
  }

  // The starts kept without a session, in catalog order: each names the
  // workspace as the page shows a project's folders and the Agent its claim
  // named, when the start reported one.
  async keptStarts(): Promise<readonly KeptStart[]> {
    const kept = await keptStartsByProject();
    return catalog.flatMap((source) =>
      (kept.get(source.id) ?? [])
        .filter((start) => !this.progress.running(source.id, start.identity))
        .map((start) => ({
          source: source.id,
          identity: start.identity,
          workspace: shownWorkspace(
            projectFolder(source),
            path.basename(start.workspace),
          ),
          ...(start.start?.agent === undefined
            ? {}
            : { agent: start.start.agent }),
        })),
    );
  }

  // The starts running in this server now, each with its phase.
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
    sessionId: string,
  ): Promise<Recorded> {
    const record = (await keptRecords(source.id)).find(
      (kept) => kept.session.sessionId === sessionId,
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
      const launched = await launchClaude(
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
              explanation: `${launched.explanation} ${publishedWithoutSession(start)}`,
            }
          : launched;
      }
      const record: LaunchRecord = {
        request: recording,
        session: launched.session,
        ...(start.kind === "established" ? { start: start.handoff.start } : {}),
        launchedAt: new Date().toISOString(),
      };
      await keepRecord(source.id, record);
      if (start.kind === "established") {
        // The session carries the start now; the launch record keeps it.
        await removeStart(source.id, start.handoff.start.identity);
      }
      return {
        kind: "launched",
        record: { ...record, sessionState: launched.sessionState },
      };
    } finally {
      clearTimeout(timer);
      this.running.delete(controller);
      if (start.kind === "established") {
        this.progress.clear(source.id, start.handoff.start.identity);
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
