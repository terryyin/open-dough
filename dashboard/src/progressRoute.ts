// Which way a Taken entry's slice progress is sourced (`./progressSource.ts`):
// already known without a read, a gap, or the plan trunk's story-state
// records, read on the story branch the entry's single agent profile records.
// Which branch comes only from the owner already read from trunk's profiles
// (`./takenOwner.ts`); the plan path only from trunk's story-state. A branch
// name the local read boundary would refuse is that entry's gap, so it is
// never read or watched, and nothing else waits on it.

import { isSafeBranchName } from "./authenticatedReadRules";
import type { ProgressSource } from "./progressSource";
import type { WorkEntry } from "./publishedWork";
import { resolveBesideFile } from "./repositoryPath";
import { snapshotRepositoryPath } from "./sourceLink";

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

// The plan path trunk's story-state records for the entry, beside its
// canonical record, when its plan association stands; undefined when it
// cannot be resolved.
type RecordedPlan =
  | { readonly kind: "association-conflict" }
  | { readonly kind: "recorded"; readonly path: string | undefined };

function recordedPlanOf(entry: WorkEntry, backlogPath: string): RecordedPlan {
  const { preparation } = entry;
  if (
    preparation?.status !== "recorded" ||
    preparation.approach.kind !== "planned"
  ) {
    return { kind: "recorded", path: undefined };
  }
  if (preparation.assessment.status === "plan-association-conflict") {
    return { kind: "association-conflict" };
  }
  const canonicalPath = snapshotRepositoryPath(entry.canonical, backlogPath);
  return {
    kind: "recorded",
    path:
      canonicalPath === undefined
        ? undefined
        : resolveBesideFile(canonicalPath, preparation.approach.plan),
  };
}

export function routeOf(entry: WorkEntry, backlogPath: string): Route {
  if (entry.planSlices === undefined || entry.planSlices.status === "absent") {
    return { kind: "none" };
  }
  const { owner } = entry;
  switch (owner?.status) {
    case "not-recorded":
      return {
        kind: "known",
        source: { kind: "trunk-copy", branchUnknown: "not-recorded" },
      };
    case "unavailable":
      return {
        kind: "known",
        source: { kind: "trunk-copy", branchUnknown: "profiles-unreadable" },
      };
    case "recorded": {
      const [only, ...others] = owner.owners;
      if (only === undefined || others.length > 0) {
        return {
          kind: "gap",
          problem:
            "More than one agent profile names this story, so it has no single progress source.",
        };
      }
      if (only.mode === "trunk") {
        return {
          kind: "known",
          source: { kind: "trunk", profilePath: only.profilePath },
        };
      }
      const plan = recordedPlanOf(entry, backlogPath);
      if (plan.kind === "association-conflict") {
        // The association conflict is already this entry's plan gap.
        return { kind: "none" };
      }
      if (!isSafeBranchName(only.branch)) {
        return {
          kind: "gap",
          problem: `The recorded branch ${only.branch} has a name this dashboard cannot use, so its slice progress cannot be read. Trunk's copy is not its progress.`,
        };
      }
      const planPath = plan.path;
      return planPath === undefined
        ? {
            kind: "gap",
            problem:
              "The recorded plan path could not be resolved, so the branch's plan cannot be read.",
          }
        : {
            kind: "branch",
            branch: only.branch,
            planPath,
            profilePath: only.profilePath,
          };
    }
    case "loading":
    case undefined:
      return { kind: "none" };
  }
}
