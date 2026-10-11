// Retained establishment and its launch outcome agree before the attempt
// settles: successful launch spends the start; a definite failure after
// establishment keeps it and tells the developer where to resume.
import {
  establishesSession,
  type AgentLaunchRequest,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { projectFolder } from "./projectFolders.ts";
import { startWorkspaceFolder } from "./launchWorkspace.ts";
import { settleSessionStart } from "./sessionStartStore.ts";
import { unattachedStartWords } from "./startWorkflows.ts";

export async function settleSessionResult(
  source: PublishedSource,
  request: AgentLaunchRequest,
  attempt: string,
  result: LaunchResult,
): Promise<LaunchResult> {
  if (request.workflow !== "ad-hoc" || !establishesSession(request))
    return result;
  const kept = await settleSessionStart(source.id, attempt, result);
  if (result.kind !== "failed" || kept === undefined) return result;
  return {
    ...result,
    sessionStartKept: true,
    explanation: `${result.explanation} ${unattachedStartWords.retained({
      workspace: startWorkspaceFolder(projectFolder(source), kept.workspace)
        .shown,
      branch: kept.branch,
    })}`,
  };
}
