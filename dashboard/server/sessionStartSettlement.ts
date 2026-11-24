// Retained establishment and its launch outcome agree before the attempt
// settles: successful launch spends the start; a definite failure after
// establishment keeps it and tells the developer where to resume.
import {
  establishesSession,
  type AgentLaunchRequest,
  type LaunchResult,
  type PublicationReceipt,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { executionCheckout } from "./executionCheckout.ts";
import { startWorkspaceFolder } from "./launchWorkspace.ts";
import { settleSessionStart } from "./sessionStartStore.ts";
import type { Started } from "./launchStart.ts";
import { publishedAssignment, unattachedStartWords } from "./startWorkflows.ts";

export function publicationRecordingFailure(
  start: Started,
  publication: PublicationReceipt,
  error: unknown,
): LaunchResult {
  if (publication.kind !== "published") throw error;
  const summary =
    start.kind === "established"
      ? `${publishedAssignment(start)}, workspace ${start.workspace.shown}`
      : [publication.identity, publication.revision].filter(Boolean).join(", ");
  return {
    kind: "failed",
    reason: "unrecorded",
    explanation: `Publication succeeded (${summary}), but the receipt could not be recorded in ~/.open-dough/dashboard/launch-attempts.json: ${error instanceof Error ? error.message : String(error)}. Repair the file, then Continue; nothing more was started.`,
  };
}

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
    explanation: `${result.explanation} ${unattachedStartWords.retained(
      {
        workspace: startWorkspaceFolder(
          executionCheckout(source),
          kept.workspace,
        ).shown,
        branch: kept.branch,
      },
      kept.claim?.publishedSha !== undefined
        ? "The Taken story was published."
        : kept.claim !== undefined
          ? "The story admission can be retried."
          : undefined,
    )}`,
  };
}
