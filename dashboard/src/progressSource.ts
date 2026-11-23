// Where a Taken entry's slice progress is published: trunk's copy of its
// plan at the shown revision, or the plan at the head of the story branch its
// agent profile records in Story Branch Mode, as its route says
// (`./progressRoute.ts`). The branch copy replaces trunk's count; it is
// interpreted by the same plan reader (`./storyPlan.ts`) and never falls back
// to trunk when the branch cannot say. No assignment is ever inferred from a
// branch name. Resolving and reading one branch's plan is `./branchPlanRead.ts`.

import {
  type BranchHead,
  type StoryBranchHeads,
} from "./authenticatedBranchRead.ts";
import {
  readBranchPlanForEntry,
  type BranchPlanReads,
} from "./branchPlanRead.ts";
import type { ObservationOutcomes } from "./observationOutcomes.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { routeOf } from "./progressRoute.ts";
import { unavailableGap } from "./readWaitBound.ts";

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

// Every Taken entry's progress source that needs no read is known at once;
// one on a story branch waits for that branch's plan, and trunk's count is
// not shown for it meanwhile.
function withoutProgressSource(entry: WorkEntry): WorkEntry {
  if (entry.progressSource === undefined) {
    return entry;
  }
  const cleared = { ...entry };
  delete cleared.progressSource;
  return cleared;
}

export function awaitingProgressSources(work: PublishedWork): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => {
      const route = routeOf(entry);
      switch (route.kind) {
        case "none":
          // Absent or not-yet-routable plans must not keep a source label
          // from an earlier profiles gap on this pin.
          return withoutProgressSource(entry);
        case "known":
          return { ...entry, progressSource: route.source };
        case "gap":
          return {
            ...entry,
            planSlices: unavailableGap({ problem: route.problem }),
          };
        case "branch":
          return { ...entry, planSlices: { status: "loading" as const } };
      }
    }),
  };
}

// Trunk and trunk-copy sources follow the current owner. Same-revision
// recovery keeps counted branch progress, but must refresh known sources
// when profiles answer after a wait-bound gap, and drop a stale
// `profiles-unreadable` label when the route is none (absent plan).
export function withKnownProgressSources(work: PublishedWork): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) => {
      const route = routeOf(entry);
      if (route.kind === "known") {
        return { ...entry, progressSource: route.source };
      }
      if (route.kind === "none") {
        return withoutProgressSource(entry);
      }
      return entry;
    }),
  };
}

// Reads each Story Branch Mode entry's plan at its branch head; a failed or
// bound-interrupted read is that entry's gap. Given the heads a revision
// check found for `moved` branches, reads only the entries on those branches,
// at those heads, and leaves every other entry as shown.
export async function withProgressSources(
  work: PublishedWork,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
  reads: BranchPlanReads,
  moved?: StoryBranchHeads,
): Promise<PublishedWork> {
  return {
    ...work,
    taken: await Promise.all(
      work.taken.map((entry) => {
        const route = routeOf(entry);
        if (route.kind !== "branch") {
          return Promise.resolve(entry);
        }
        if (moved !== undefined && !moved.has(route.branch)) {
          return Promise.resolve(entry);
        }
        return readBranchPlanForEntry(
          work,
          entry,
          route,
          signal,
          outcomes,
          bound,
          reads,
          moved === undefined ? undefined : { head: moved.get(route.branch) },
        );
      }),
    ),
  };
}

// The story branches shown entries' progress is read from, each with the
// head it was read at: undefined when none was, as for a branch no longer
// published. A revision check watches exactly these.
export function watchedBranchHeads(work: PublishedWork): StoryBranchHeads {
  const heads = new Map<string, string | undefined>();
  for (const entry of work.taken) {
    const route = routeOf(entry);
    if (route.kind === "branch") {
      heads.set(route.branch, countedPlanBranch(entry)?.head);
    }
  }
  return heads;
}

// Where the entry's counted plan was read, as a commit time read names it:
// on the recorded branch at its head, or at the shown revision.
export function countedPlanBranch(entry: WorkEntry): BranchHead | undefined {
  const source = entry.progressSource;
  return source?.kind === "branch"
    ? { branch: source.branch, head: source.head }
    : undefined;
}
