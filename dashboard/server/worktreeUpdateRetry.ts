// Update worktree and retry: apply the verified release updater to the kept
// launch worktree, then Continue-equivalent resume of the same attempt.
import {
  worktreeUpdateNeeded,
  type Acceptance,
  type AttemptObservation,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  notContinued,
  unknownAttempt,
  unreadableEvidence,
} from "./launchAttemptConflicts.ts";
import { keptAttempts } from "./launchAttemptStore.ts";
import { projectFolder } from "./projectFolders.ts";
import { knownLaunchWorkspace } from "./knownLaunchWorkspace.ts";
import { applyReleaseToWorktree } from "./worktreeReleaseApply.ts";

const updateNotOffered: Acceptance = {
  kind: "failed",
  reason: "refused",
  explanation:
    "This start does not need an Open Dough worktree update, so Update worktree and retry did nothing.",
};

const noWorkspace: Acceptance = {
  kind: "failed",
  reason: "refused",
  explanation:
    "This start keeps no launch worktree to update, so Update worktree and retry did nothing.",
};

export type PreparedWorktreeUpdate = {
  readonly kind: "ready";
  readonly workspace: string;
  readonly host: LaunchAttemptRecord["request"]["host"];
};

export async function prepareWorktreeUpdate(
  source: PublishedSource,
  id: string,
  known: readonly AttemptObservation[],
): Promise<PreparedWorktreeUpdate | Acceptance> {
  const read = await keptAttempts();
  if (read === undefined) return unreadableEvidence;
  const found = read.find(
    (entry) => entry.id === id && entry.request.source === source.id,
  );
  if (found === undefined) return unknownAttempt;
  const attempt = known.find((entry) => entry.id === id) ?? {
    ...found,
    owned: false,
    running: false,
  };
  if (!worktreeUpdateNeeded(attempt)) return updateNotOffered;
  const blocked = notContinued(attempt);
  if (blocked !== undefined) return blocked;
  const workspace = await knownLaunchWorkspace(
    source,
    found.request,
    projectFolder(source),
    found.id,
    undefined,
  );
  if (workspace === undefined) return noWorkspace;
  return { kind: "ready", workspace: workspace.path, host: found.request.host };
}

export async function applyPreparedWorktreeUpdate(
  prepared: PreparedWorktreeUpdate,
): Promise<Acceptance | undefined> {
  const applied = await applyReleaseToWorktree(
    prepared.workspace,
    prepared.host,
  );
  if (applied.kind === "refused") {
    return {
      kind: "failed",
      reason: "refused",
      worktreeUpdateNeeded: true,
      explanation: applied.explanation,
    };
  }
  return undefined;
}
