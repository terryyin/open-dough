// Which way a Taken entry's slice progress is sourced (`./progressSource.ts`):
// already known without a read, a gap, or the plan trunk's story-state
// records, read on the story branch the entry's single agent profile records.
// Which branch is the story-branch rule's (`./storyBranch.ts`), from the
// owner already read from trunk's profiles; the plan path only from trunk's
// story-state, as enrichment resolved it once (`WorkEntry.planPath`). A
// branch name the local read boundary would refuse is that entry's gap, so it
// is never read or watched, and nothing else waits on it.

import type { ProgressSource } from "./progressSource.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { storyBranchOf } from "./storyBranch.ts";

export type Route =
  // No recorded plan progress to source, or nothing known to source it by.
  | { readonly kind: "none" }
  | { readonly kind: "known"; readonly source: ProgressSource }
  | {
      readonly kind: "branch";
      readonly branch: string;
      readonly planPath: string;
      readonly profilePath: string;
    }
  | { readonly kind: "gap"; readonly problem: string };

export function routeOf(entry: WorkEntry): Route {
  if (entry.planSlices === undefined || entry.planSlices.status === "absent") {
    return { kind: "none" };
  }
  const storyBranch = storyBranchOf(entry.owner);
  switch (storyBranch.kind) {
    case "unknown":
      return { kind: "none" };
    case "not-recorded":
    case "profiles-unreadable":
      return {
        kind: "known",
        source: { kind: "trunk-copy", branchUnknown: storyBranch.kind },
      };
    case "conflicting":
      return {
        kind: "gap",
        problem:
          "More than one agent profile names this story, so it has no single progress source.",
      };
    case "trunk":
      return {
        kind: "known",
        source: { kind: "trunk", profilePath: storyBranch.profilePath },
      };
    case "unsafe":
    case "branch":
      break;
  }
  if (
    entry.preparation?.status === "recorded" &&
    entry.preparation.assessment.status === "plan-association-conflict"
  ) {
    // The association conflict is already this entry's plan gap.
    return { kind: "none" };
  }
  if (storyBranch.kind === "unsafe") {
    return {
      kind: "gap",
      problem: `The recorded branch ${storyBranch.branch} has a name this dashboard cannot use, so its slice progress cannot be read. Trunk's copy is not its progress.`,
    };
  }
  const { planPath } = entry;
  return planPath === undefined
    ? {
        kind: "gap",
        problem: "The associated plan path could not be resolved.",
      }
    : {
        kind: "branch",
        branch: storyBranch.branch,
        planPath,
        profilePath: storyBranch.profilePath,
      };
}
