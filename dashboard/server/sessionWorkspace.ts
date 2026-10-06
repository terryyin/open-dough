// Saved directory observation is independent of conversation and done intent.
import { statSync } from "node:fs";
import {
  recordedWorkspace,
  type HostSession,
  type LaunchRecord,
  type WorkspaceState,
} from "../src/launchRecord.ts";

// Whether a directory is there: unknown when the observation itself failed.
export function directoryState(directory: string): WorkspaceState {
  try {
    return {
      kind: statSync(directory).isDirectory() ? "available" : "missing",
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return {
      kind: code === "ENOENT" || code === "ENOTDIR" ? "missing" : "unknown",
    };
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
export function recordedWorkspaceState(
  record: LaunchRecord,
): WorkspaceState | undefined {
  const workspace = recordedWorkspace(record);
  return workspace === undefined
    ? record.session.host === "codex"
      ? { kind: "unknown" }
      : undefined
    : directoryState(workspace);
}
