// Where a Taken entry's slice progress is published: trunk's copy of its
// plan at the shown revision, or the plan at the head of the story branch its
// agent profile records in Story Branch Mode, as its route says
// (`./progressRoute.ts`). The branch copy replaces trunk's count; it is
// interpreted by the same plan reader (`./storyPlan.ts`) and never falls back
// to trunk when the branch cannot say. No assignment is ever inferred from a
// branch name.

import {
  readBranchHeadAt,
  readFileOnBranch,
  type BranchHead,
  type StoryBranchHeads,
} from "./authenticatedBranchRead.ts";
import {
  settleMissing,
  shouldAsk,
  trackSettledAsk,
  type ObservationOutcomes,
} from "./observationOutcomes.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { ReadProblem } from "./readProblem.ts";
import { routeOf, type Route } from "./progressRoute.ts";
import {
  gapCauseOf,
  unavailableGap,
  type UnavailableGap,
} from "./readWaitBound.ts";
import { interpretPlanSlices } from "./storyPlan.ts";

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

function unavailable(problem: string): UnavailableGap {
  return { status: "unavailable", problem };
}

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
          return { ...entry, planSlices: unavailable(route.problem) };
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

// The branch's plan at its head: the head read now, or, when a revision
// check already found it (`known`), that head, undefined when the branch is
// no longer published. Nothing earlier read on the branch is kept.
async function branchProgress(
  work: PublishedWork,
  entry: WorkEntry,
  { branch, planPath, profilePath }: Extract<Route, { kind: "branch" }>,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
  known?: { readonly head: string | undefined },
): Promise<WorkEntry> {
  const { source, revision } = work;
  const unsourced: { -readonly [K in keyof WorkEntry]: WorkEntry[K] } = {
    ...entry,
  };
  delete unsourced.progressSource;
  delete unsourced.sliceClock;
  const headQuestion = {
    sourceId: source.id,
    revision,
    operation: "branch-head" as const,
    path: branch,
  };
  const unreadable = `The plan on branch ${branch} could not be read.`;
  const priorHead = outcomes.of(headQuestion);
  if (
    known === undefined &&
    !shouldAsk(outcomes, headQuestion) &&
    priorHead !== undefined &&
    priorHead.kind !== "answered"
  ) {
    // Missing or terminal/bound head failure: keep this entry's shown gap.
    return entry;
  }
  try {
    const head =
      known === undefined
        ? await trackSettledAsk(
            outcomes,
            readBranchHeadAt(source, revision, branch, signal),
            {
              question: headQuestion,
              of: (resolved) =>
                resolved === undefined
                  ? "missing"
                  : {
                      kind: "answered",
                      question: { ...headQuestion, head: resolved },
                    },
              untilEither: signal,
              bound,
              reading: `branch ${branch}`,
              unreadable,
            },
          )
        : known.head;
    if (head === undefined) {
      if (known !== undefined) {
        settleMissing(outcomes, headQuestion);
      }
      return {
        ...unsourced,
        planSlices: unavailable(
          `The recorded branch ${branch} is no longer published, so its slice progress cannot be read. Trunk's copy is not its progress.`,
        ),
      };
    }
    const onBranch = { branch, head };
    const fileQuestion = {
      sourceId: source.id,
      revision,
      head,
      operation: "branch-file" as const,
      path: planPath,
    };
    const priorFile = outcomes.of(fileQuestion);
    if (
      !shouldAsk(outcomes, fileQuestion) &&
      priorFile !== undefined &&
      priorFile.kind !== "answered"
    ) {
      return entry;
    }
    const text = await trackSettledAsk(
      outcomes,
      readFileOnBranch(source, planPath, revision, onBranch, signal),
      {
        question: fileQuestion,
        of: (found) => (found === undefined ? "missing" : "answered"),
        untilEither: signal,
        bound,
        reading: planPath,
        unreadable,
      },
    );
    return {
      ...unsourced,
      progressSource: { kind: "branch", ...onBranch, profilePath },
      planSlices:
        text === undefined
          ? unavailable(
              `The associated plan ${planPath} is missing on this branch.`,
            )
          : interpretPlanSlices(text),
    };
  } catch (error) {
    return {
      ...unsourced,
      planSlices: unavailableGap(
        gapCauseOf(
          error,
          signal,
          bound,
          `branch ${branch}`,
          error instanceof ReadProblem ? error.message : unreadable,
        ),
      ),
    };
  }
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
        if (moved === undefined) {
          return branchProgress(work, entry, route, signal, outcomes, bound);
        }
        return moved.has(route.branch)
          ? branchProgress(work, entry, route, signal, outcomes, bound, {
              head: moved.get(route.branch),
            })
          : Promise.resolve(entry);
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
