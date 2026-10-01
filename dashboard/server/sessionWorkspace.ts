// Saved directory observation is independent of conversation and done intent.
import { statSync } from "node:fs";
import type { HostSession, WorkspaceState } from "../src/launchRecord.ts";

export function savedWorkspaceState(session: HostSession): WorkspaceState {
  const workspace =
    session.host === "codex" ? session.continuation?.workspace : undefined;
  if (workspace === undefined) return { kind: "unknown" };
  try {
    return {
      kind: statSync(workspace).isDirectory() ? "available" : "missing",
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return {
      kind: code === "ENOENT" || code === "ENOTDIR" ? "missing" : "unknown",
    };
  }
}
