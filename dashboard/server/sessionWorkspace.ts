// Saved directory observation is independent of conversation and done intent.
import { stat } from "node:fs/promises";
import type { HostSession, WorkspaceState } from "../src/launchRecord.ts";

export async function savedWorkspaceState(
  session: HostSession,
): Promise<WorkspaceState> {
  const workspace = session.continuation?.workspace;
  if (workspace === undefined) return { kind: "unknown" };
  try {
    return {
      kind: (await stat(workspace)).isDirectory() ? "available" : "missing",
    };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return {
      kind: code === "ENOENT" || code === "ENOTDIR" ? "missing" : "unknown",
    };
  }
}
