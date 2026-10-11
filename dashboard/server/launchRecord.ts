// The start context and record shared by native launch and verification.
import {
  policyOf,
  type establishedPlace,
  type HostSession,
  type LaunchRecord,
  type RecordedLaunchRequest,
} from "../src/agentLaunch.ts";
import { startWorkspaceFolder } from "./launchWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { StartRecord } from "./startStore.ts";

// A kept start's workspace, policy and established record facts. Before its
// command finishes the facts are empty; its workspace and policy still apply.
export function launchStartContext(
  project: ProjectFolder,
  kept: Pick<StartRecord, "workspace" | "policy" | "start" | "preparation">,
) {
  return {
    workspace: startWorkspaceFolder(project, kept.workspace),
    policy: policyOf(kept),
    facts: {
      ...(kept.start === undefined ? {} : { start: kept.start }),
      ...(kept.preparation === undefined
        ? {}
        : { preparation: kept.preparation }),
    },
  };
}

// What a launch's start established, under the key its record keeps it by:
// a story's start or preparation, or an unattached session.
export type EstablishedRecordFacts = Pick<
  LaunchRecord,
  "start" | "preparation" | "establishedSession"
>;

// The story what a launch's start established names: a story's start or
// preparation names its own, an unattached session none.
export function establishedStory(
  established: ReturnType<typeof establishedPlace>,
): string | undefined {
  return established !== undefined && "identity" in established
    ? established.identity
    : undefined;
}

// A confirmation's durable record. Callers supply the evidence's own time;
// native input evidence may extend it without re-forming its start facts.
export function launchRecord(
  request: RecordedLaunchRequest,
  session: HostSession,
  facts: EstablishedRecordFacts,
  launchedAt: string,
): LaunchRecord {
  return {
    request,
    session,
    ...(facts.start === undefined ? {} : { start: facts.start }),
    ...(facts.preparation === undefined
      ? {}
      : { preparation: facts.preparation }),
    ...(facts.establishedSession === undefined
      ? {}
      : { establishedSession: facts.establishedSession }),
    launchedAt,
  };
}
