// Launch-run preparation of reporting from a known or established launch
// workspace: refuse incomplete installed support before native launch, and
// settle IncompleteReportingSupport as a definite failed result.
import {
  establishedPlace,
  recordedWorkspace,
  type AgentLaunchRequest,
  type LaunchAttemptRecord,
  type LaunchRecord,
  type LaunchResult,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  IncompleteReportingSupport,
  incompleteReportingExplanation,
  missingReportingSupport,
  preparesReporting,
  type MissingReportingSupport,
} from "./launchWorkspaceReporting.ts";
import {
  reportingContext,
  type PreparedReporting,
} from "./completionReporting.ts";
import { establishedLaunch, type Started } from "./launchStart.ts";
import { startWorkspaceFolder } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { keptStart } from "./startStore.ts";
import { keptStartWords } from "./startResult.ts";
import { keptSessionStart } from "./sessionStartStore.ts";
import { startOf } from "./startWorkflows.ts";

export type PreparedAttemptReporting =
  | PreparedReporting
  | { readonly reporting: NonNullable<LaunchAttemptRecord["reporting"]> };

// A launch workspace already known from a pending conversation or kept start,
// before this run's start script can publish further.
async function knownLaunchWorkspace(
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

function incompleteReportingFailure(
  missing: MissingReportingSupport,
  workspaceShown: string,
  continuation: string,
): LaunchResult {
  return {
    kind: "failed",
    reason: "refused",
    explanation: `${incompleteReportingExplanation(missing, workspaceShown)} ${continuation}`,
  };
}

// When the launch workspace is already known, refuse incomplete installed
// reporting support before further start publication or native launch.
export async function refuseIncompleteKnownReporting(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
  attempt: LaunchAttemptRecord,
  pending: LaunchRecord | undefined,
): Promise<LaunchResult | undefined> {
  if (!preparesReporting(attempt) || attempt.reporting !== undefined)
    return undefined;
  const known = await knownLaunchWorkspace(
    source,
    request,
    folder,
    attempt.id,
    pending,
  );
  if (known === undefined) return undefined;
  const missing = await missingReportingSupport(request.host, known);
  if (missing === undefined) return undefined;
  return incompleteReportingFailure(
    missing,
    known.shown,
    `${keptStartWords} Nothing was launched.`,
  );
}

export async function prepareAttemptReporting(
  attempt: LaunchAttemptRecord,
  start: Exclude<Started, { kind: "stopped" }>,
  folder: ProjectFolder,
  pending: LaunchRecord | undefined,
  kept: LaunchAttemptRecord["reporting"] | undefined,
): Promise<
  | { readonly kind: "prepared"; readonly prepared?: PreparedAttemptReporting }
  | { readonly kind: "failed"; readonly result: LaunchResult }
> {
  const launchFolder = establishedLaunch(start)?.workspace ?? folder;
  try {
    const prepared =
      kept === undefined
        ? await reportingContext(
            attempt,
            launchFolder,
            // A story's start or preparation, or an unattached session.
            establishedPlace(
              pending ?? establishedLaunch(start)?.handoff.established ?? {},
            ),
          )
        : { reporting: kept };
    return prepared === undefined
      ? { kind: "prepared" }
      : { kind: "prepared", prepared };
  } catch (error) {
    if (!(error instanceof IncompleteReportingSupport)) throw error;
    return {
      kind: "failed",
      result: incompleteReportingFailure(
        error.missing,
        launchFolder.shown,
        start.kind === "established"
          ? start.workflow.publishedWithoutSession(start)
          : "Nothing was launched.",
      ),
    };
  }
}
