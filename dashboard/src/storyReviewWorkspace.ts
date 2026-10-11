// Which workspace a story's review reads, decided the same way by the card
// that offers the review and by the local launch boundary that answers it: the
// latest kept launch workspace, else the one worktree local Git found holding
// the story's claim (`./localWorkspace.ts`). Several such worktrees are an
// ambiguity the review explains instead of choosing.

import { launchSubject } from "./launchWorkflow.ts";
import type { EstablishedContext, LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";

// What a workspace review reads of its workspace: where it is, its branch,
// and the trunk it is compared with. Every established start or preparation
// names these, and so does a worktree local Git found.
export type ReviewedWorkspace = Pick<
  EstablishedContext,
  "workspace" | "branch" | "remote" | "target"
>;

// The workspace a story's review reads. A kept launch record comes first,
// with what it established: the most recent by `launchedAt` of the story's
// records whose start or preparation names a workspace. Without one, the
// single worktree local Git found holding the story's claim. Several such
// worktrees are not chosen between: they are answered together as ambiguous.
// Undefined when nothing names a workspace.
export function reviewWorkspaceOf<
  Kept extends LaunchRecord,
  Found extends LocalWorkspace,
>(
  records: readonly Kept[] | undefined,
  workspaces: readonly Found[] | undefined,
  sourceId: string,
  identity: string,
):
  | {
      readonly kind: "launched";
      readonly record: Kept;
      readonly established: EstablishedContext;
    }
  | { readonly kind: "found"; readonly found: Found }
  | { readonly kind: "ambiguous"; readonly found: readonly Found[] }
  | undefined {
  let latest:
    | { readonly record: Kept; readonly established: EstablishedContext }
    | undefined;
  for (const record of records ?? []) {
    const established = record.start ?? record.preparation;
    if (
      established === undefined ||
      record.request.source !== sourceId ||
      launchSubject(record.request).identity !== identity
    )
      continue;
    if (
      latest === undefined ||
      Date.parse(record.launchedAt) >= Date.parse(latest.record.launchedAt)
    )
      latest = { record, established };
  }
  if (latest !== undefined) return { kind: "launched", ...latest };
  const holding = (workspaces ?? []).filter(
    (found) => found.source === sourceId && found.identity === identity,
  );
  const [found] = holding;
  if (found === undefined) return undefined;
  return holding.length === 1
    ? { kind: "found", found }
    : { kind: "ambiguous", found: holding };
}

// Why a review of several worktrees holding one story's claim reads none:
// their agent and each worktree as the context line would show it, in path
// order.
export function severalWorktreesExplanation(
  found: readonly LocalWorkspace[],
): string {
  const shown = found.map(({ workspace }) => workspace).sort();
  return `Several worktrees on this machine hold this story's claim for ${found[0]?.agent ?? ""}: ${shown.join(", ")}. The review cannot choose one.`;
}
