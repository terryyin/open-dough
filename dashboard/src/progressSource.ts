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
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { ReadProblem } from "./readProblem.ts";
import { routeOf, type Route } from "./progressRoute.ts";
import { interpretPlanSlices, type WorkPlanSlices } from "./storyPlan.ts";

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
      const route = routeOf(entry);
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

// The branch's plan at its head: the head read now, or, when a revision
// check already found it (`known`), that head, undefined when the branch is
// no longer published. Nothing earlier read on the branch is kept.
async function branchProgress(
  work: PublishedWork,
  entry: WorkEntry,
  { branch, planPath, profilePath }: Extract<Route, { kind: "branch" }>,
  signal: AbortSignal,
  known?: { readonly head: string | undefined },
): Promise<WorkEntry> {
  const { source, revision } = work;
  const unsourced: { -readonly [K in keyof WorkEntry]: WorkEntry[K] } = {
    ...entry,
  };
  delete unsourced.progressSource;
  delete unsourced.sliceClock;
  try {
    const head =
      known === undefined
        ? await readBranchHeadAt(source, revision, branch, signal)
        : known.head;
    if (head === undefined) {
      return {
        ...unsourced,
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
      planSlices: unavailable(
        error instanceof ReadProblem
          ? error.message
          : `The plan on branch ${branch} could not be read.`,
      ),
    };
  }
}

// Reads each Story Branch Mode entry's plan at its branch head; a failed or
// abandoned read is that entry's gap. Given the heads a revision check found
// for `moved` branches, reads only the entries on those branches, at those
// heads, and leaves every other entry as shown.
export async function withProgressSources(
  work: PublishedWork,
  signal: AbortSignal,
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
          return branchProgress(work, entry, route, signal);
        }
        return moved.has(route.branch)
          ? branchProgress(work, entry, route, signal, {
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
