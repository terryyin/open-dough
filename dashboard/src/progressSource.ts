// Where a Taken entry's slice progress is published: trunk's copy of its
// plan at the shown revision, or the plan at the head of the story branch its
// agent profile records in Story Branch Mode. Which branch comes only from
// the owner already read from trunk's profiles (`./takenOwner.ts`); the plan
// path only from trunk's story-state. The branch copy replaces trunk's count;
// it is interpreted by the same plan reader (`./storyPlan.ts`) and never
// falls back to trunk when the branch cannot say. No assignment is ever
// inferred from a branch name.

import {
  readBranchHeadAt,
  readFileOnBranch,
  type BranchHead,
} from "./authenticatedBranchRead";
import type { PublishedWork, WorkEntry } from "./publishedWork";
import { ReadProblem } from "./readProblem";
import { resolveBesideFile } from "./repositoryPath";
import { snapshotRepositoryPath } from "./sourceLink";
import { interpretPlanSlices, type WorkPlanSlices } from "./storyPlan";

// Where a Taken entry's slice progress is read. When one profile records
// where the work is published, `profilePath` is that profile: the one
// recording the Take (`./sliceClockStart.ts`).
export type ProgressSource =
  // Trunk Mode: trunk is where the work is published.
  | { readonly kind: "trunk"; readonly profilePath: string }
  // Trunk's copy, since no readable profile says where the work is
  // published: none records the entry, or none could be read.
  | {
      readonly kind: "trunk-copy";
      readonly branchUnknown: "not-recorded" | "profiles-unreadable";
    }
  // The recorded story branch, at the head read.
  | ({ readonly kind: "branch"; readonly profilePath: string } & BranchHead);

type Route =
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

function routeOf(entry: WorkEntry, backlogPath: string): Route {
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

function unavailable(problem: string): WorkPlanSlices {
  return { status: "unavailable", problem };
}

// Every Taken entry's progress source that needs no read is known at once;
// one on a story branch waits for that branch's plan, and trunk's count is
// not shown for it meanwhile.
export function awaitingProgressSources(work: PublishedWork): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => {
      const route = routeOf(entry, work.source.backlogPath);
      switch (route.kind) {
        case "none":
          return entry;
        case "known":
          return { ...entry, progressSource: route.source };
        case "gap":
          return { ...entry, planSlices: unavailable(route.problem) };
        case "branch":
          return { ...entry, planSlices: { status: "loading" as const } };
      }
    }),
  };
}

async function branchProgress(
  work: PublishedWork,
  entry: WorkEntry,
  { branch, planPath, profilePath }: Extract<Route, { kind: "branch" }>,
  signal: AbortSignal,
): Promise<WorkEntry> {
  const { source, revision } = work;
  try {
    const head = await readBranchHeadAt(source, revision, branch, signal);
    if (head === undefined) {
      return {
        ...entry,
        planSlices: unavailable(
          `The recorded branch ${branch} is no longer published, so its slice progress cannot be read. Trunk's copy is not its progress.`,
        ),
      };
    }
    const onBranch = { branch, head };
    const text = await readFileOnBranch(
      source,
      planPath,
      revision,
      onBranch,
      signal,
    );
    return {
      ...entry,
      progressSource: { kind: "branch", ...onBranch, profilePath },
      planSlices:
        text === undefined
          ? unavailable(
              `The associated plan ${planPath} is missing on this branch.`,
            )
          : interpretPlanSlices(text, planPath),
    };
  } catch (error) {
    return {
      ...entry,
      planSlices: unavailable(
        error instanceof ReadProblem
          ? error.message
          : `The plan on branch ${branch} could not be read.`,
      ),
    };
  }
}

// Reads each Story Branch Mode entry's plan at its branch head; a failed or
// abandoned read is that entry's gap.
export async function withProgressSources(
  work: PublishedWork,
  signal: AbortSignal,
): Promise<PublishedWork> {
  return {
    ...work,
    taken: await Promise.all(
      work.taken.map((entry) => {
        const route = routeOf(entry, work.source.backlogPath);
        return route.kind === "branch"
          ? branchProgress(work, entry, route, signal)
          : Promise.resolve(entry);
      }),
    ),
  };
}

// Where the entry's counted plan was read, as a commit time read names it:
// on the recorded branch at its head, or at the shown revision.
export function countedPlanBranch(entry: WorkEntry): BranchHead | undefined {
  const source = entry.progressSource;
  return source?.kind === "branch"
    ? { branch: source.branch, head: source.head }
    : undefined;
}
