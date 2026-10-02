// The start context and record shared by native launch and verification.
import {
  policyOf,
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

// A confirmation's durable record. Callers supply the evidence's own time;
// native input evidence may extend it without re-forming its start facts.
export function launchRecord(
  request: RecordedLaunchRequest,
  session: HostSession,
  facts: Pick<LaunchRecord, "start" | "preparation">,
  launchedAt: string,
): LaunchRecord {
  return {
    request,
    session,
    ...(facts.start === undefined ? {} : { start: facts.start }),
    ...(facts.preparation === undefined
      ? {}
      : { preparation: facts.preparation }),
    launchedAt,
  };
}
