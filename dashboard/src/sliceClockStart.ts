// When a Taken card's current slice started: the later of the associated
// plan's last commit and the Take, the commit that added the entry's agent
// profile. The plan's commit is read where its slices were read (the shown
// revision, or the recorded branch head); the Take on trunk, at the shown
// revision, where the profile was read. When no profile
// records the Take the clock starts at the plan commit and says so; when the
// profiles cannot say which commit was the Take, the clock is a gap. Commit
// times come through the local authenticated boundary; how long ago that was
// is left to the page clock (`./SliceClock.tsx`), so time passing asks
// nothing further.

import { readLastCommitTimeAt } from "./authenticatedRead";
import { countedPlanBranch } from "./progressSource";
import type { PublishedSource } from "./publishedSource";
import type { PublishedWork, WorkEntry } from "./publishedWork";
import { ReadProblem } from "./readProblem";

export type SliceClock =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "started";
      readonly at: Date;
      // False when no agent profile records the Take, so the clock starts at
      // the plan's last commit.
      readonly takeRecorded: boolean;
    };

// Where the Take time comes from: the one profile recording where the
// entry's progress is published, whose adding commit is the Take; none, when
// no profile records it; or a gap when the profiles cannot say which commit
// was the Take. Which profile that is, and that there is only one, is the
// progress source's (`./progressSource.ts`).
type TakeSource =
  | { readonly kind: "profile"; readonly path: string }
  | { readonly kind: "not-recorded" }
  | { readonly kind: "unknown"; readonly problem: string };

function takeSourceOf({ progressSource }: WorkEntry): TakeSource {
  switch (progressSource?.kind) {
    case "trunk":
    case "branch":
      return { kind: "profile", path: progressSource.profilePath };
    case "trunk-copy":
      return progressSource.branchUnknown === "not-recorded"
        ? { kind: "not-recorded" }
        : {
            kind: "unknown",
            problem:
              "The Take time cannot be determined because agent profiles could not be read.",
          };
    // Sources are always known once clocks are read; a clock never guesses
    // that no profile records the Take.
    case undefined:
      return {
        kind: "unknown",
        problem: "The Take time cannot be determined yet.",
      };
  }
}

// Only Taken entries whose plan slices are counted run a clock, from the
// commit time of the plan those slices were read from.
function countedPlanPathOf(entry: WorkEntry): string | undefined {
  return entry.planSlices?.status === "interpreted"
    ? entry.planPath
    : undefined;
}

async function startOf(
  entry: WorkEntry,
  planPath: string,
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<SliceClock> {
  const take = takeSourceOf(entry);
  if (take.kind === "unknown") {
    return { status: "unavailable", problem: take.problem };
  }
  const takeProfile = take.kind === "profile" ? take.path : undefined;
  try {
    const [planCommitted, taken] = await Promise.all([
      readLastCommitTimeAt(
        source,
        planPath,
        revision,
        signal,
        countedPlanBranch(entry),
      ),
      takeProfile === undefined
        ? undefined
        : readLastCommitTimeAt(source, takeProfile, revision, signal),
    ]);
    return {
      status: "started",
      at: taken !== undefined && taken > planCommitted ? taken : planCommitted,
      takeRecorded: taken !== undefined,
    };
  } catch (error) {
    return {
      status: "unavailable",
      problem:
        error instanceof ReadProblem
          ? error.message
          : "The last plan commit or Take time could not be read.",
    };
  }
}

// Every Taken entry with counted slices waits for its clock while commit
// times are read.
export function awaitingSliceClocks(work: PublishedWork): PublishedWork {
  return {
    ...work,
    taken: work.taken.map((entry) =>
      countedPlanPathOf(entry) === undefined
        ? entry
        : { ...entry, sliceClock: { status: "loading" as const } },
    ),
  };
}

// Reads each clock's start; a failed or abandoned read is that clock's gap.
export async function withSliceClocks(
  work: PublishedWork,
  signal: AbortSignal,
): Promise<PublishedWork> {
  const { source, revision } = work;
  return {
    ...work,
    taken: await Promise.all(
      work.taken.map(async (entry) => {
        const planPath = countedPlanPathOf(entry);
        return planPath === undefined
          ? entry
          : {
              ...entry,
              sliceClock: await startOf(
                entry,
                planPath,
                source,
                revision,
                signal,
              ),
            };
      }),
    ),
  };
}
