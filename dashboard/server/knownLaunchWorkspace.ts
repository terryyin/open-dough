// Launch workspace already known from a pending conversation or kept start,
// before further publication or native launch effects.
import {
  recordedWorkspace,
  type AgentLaunchRequest,
  type LaunchRecord,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { startWorkspaceFolder } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { keptStart } from "./startStore.ts";
import { keptSessionStart } from "./sessionStartStore.ts";
import { startOf } from "./startWorkflows.ts";

export async function knownLaunchWorkspace(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  attemptId: string,
  pending: LaunchRecord | undefined,
): Promise<ProjectFolder | undefined> {
  const pendingWorkspace = pending && recordedWorkspace(pending);
  if (pendingWorkspace !== undefined)
    return startWorkspaceFolder(folder, pendingWorkspace);
  if (request.workflow === "ad-hoc") {
    const session = await keptSessionStart(source.id, attemptId);
    return session === undefined
      ? undefined
      : startWorkspaceFolder(folder, session.workspace);
  }
  if (startOf(request.workflow) === undefined) return undefined;
  const kept = await keptStart(source.id, request.identity, request.workflow);
  return kept === undefined
    ? undefined
    : startWorkspaceFolder(folder, kept.workspace);
}
