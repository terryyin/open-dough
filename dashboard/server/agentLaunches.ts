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

import {
  type AgentLaunchRequest,
  type LaunchWithState,
  type LaunchRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import { catalog, type PublishedSource } from "../src/publishedSource.ts";
import { claudeSessions } from "./claudeCode.ts";
import { launchClaude, recordedRequest } from "./claudeLaunch.ts";
import {
  keepRecord,
  keptRecords,
  keptRecordsByProject,
} from "./launchRecordStore.ts";
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
      );
      if (launched.kind !== "launched") {
        return launched;
      }
      const record: LaunchRecord = {
        request: recording,
        session: launched.session,
        launchedAt: new Date().toISOString(),
      };
      await keepRecord(source.id, record);
      return {
        kind: "launched",
        record: { ...record, sessionState: launched.sessionState },
      };
    } finally {
      clearTimeout(timer);
      this.running.delete(controller);
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
