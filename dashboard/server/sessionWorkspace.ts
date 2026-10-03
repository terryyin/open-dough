// Saved directory observation is independent of conversation and done intent.
import { statSync } from "node:fs";
import type { HostSession, WorkspaceState } from "../src/launchRecord.ts";

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
