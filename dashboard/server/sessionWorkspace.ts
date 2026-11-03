// Saved directory observation is independent of conversation and done intent.
import { statSync, type Stats } from "node:fs";
import { stat } from "node:fs/promises";
import {
  recordedWorkspace,
  type HostSession,
  type LaunchRecord,
  type WorkspaceState,
} from "../src/launchRecord.ts";

const presence = (stats: Stats): WorkspaceState => ({
  kind: stats.isDirectory() ? "available" : "missing",
});

const absence = (error: unknown): WorkspaceState => {
  const code = (error as NodeJS.ErrnoException).code;
  return {
    kind: code === "ENOENT" || code === "ENOTDIR" ? "missing" : "unknown",
  };
};

// Whether a directory is there: unknown when the observation itself failed.
export function directoryState(directory: string): WorkspaceState {
  try {
    return presence(statSync(directory));
  } catch (error) {
    return absence(error);
  }
}

export function savedWorkspaceState(session: HostSession): WorkspaceState {
  const workspace =
    session.host === "codex" ? session.continuation?.workspace : undefined;
  return workspace === undefined
    ? { kind: "unknown" }
    : directoryState(workspace);
}

// Legacy Claude records have no saved launch directory; retain their native
// terminal access rather than treating absent evidence as a lost workspace.
// Each record's state, each directory looked at once, without holding the
// event loop while the file system answers.
export async function recordedWorkspaceStates(
  records: readonly LaunchRecord[],
): Promise<readonly (WorkspaceState | undefined)[]> {
  const workspaces = records.map((record) => recordedWorkspace(record));
  const looked = new Map<string, Promise<WorkspaceState>>();
  for (const workspace of workspaces)
    if (workspace !== undefined && !looked.has(workspace))
      looked.set(workspace, stat(workspace).then(presence, absence));
  return Promise.all(
    records.map(async (record, index) => {
      const workspace = workspaces[index];
      return workspace === undefined
        ? record.session.host === "codex"
          ? { kind: "unknown" as const }
          : undefined
        : looked.get(workspace);
    }),
  );
}
