// When a Taken card's current slice started: the later of the associated
// plan's last commit and the Take, the commit that added the entry's agent
// profile's current allocation. The plan's commit is read where its slices
// were read (the shown revision, or the recorded branch head); the Take is
// the read's one addition of that profile at the shown revision, where the
// profile was read, the same addition that names its human
// (`./assignmentAttribution.ts`). When no profile records the Take the clock
// starts at the plan commit and says so; when the profiles cannot say which
// commit was the Take, or its addition cannot be found, the clock is a gap.
// Commit times come through the local authenticated boundary; how long ago
// that was is left to the page clock (`./SliceClock.tsx`), so time passing
// asks nothing further.

import type {
  ProfileAddition,
  ProfileAdditions,
} from "./authenticatedProfileRead.ts";
import { readLastCommitTimeAt } from "./authenticatedRead.ts";
import { countedPlanBranch } from "./progressSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import { ReadProblem } from "./readProblem.ts";
import { detailGapProblem } from "./readWaitBound.ts";

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

// When the Take was: the committer date of the commit that added the
// profile's current allocation. An addition the walk did not find, or one
// without a usable date, leaves the Take time unknown.
function takeTimeOf(addition: ProfileAddition): Date {
  if (addition === null) {
    throw new ReadProblem(
      "The Take time cannot be determined: no commit adding the agent profile was found in its recent published history.",
    );
  }
  if (addition.committedAt === null) {
    throw new ReadProblem(
      "The Take time cannot be determined: the commit that added the agent profile names no usable commit time.",
    );
  }
  return new Date(addition.committedAt);
}

async function startOf(
  entry: WorkEntry,
  planPath: string,
  source: PublishedSource,
  revision: string,
  additionOf: ProfileAdditions,
  signal: AbortSignal,
): Promise<SliceClock> {
  const take = takeSourceOf(entry);
  if (take.kind === "unknown") {
    return { status: "unavailable", problem: take.problem };
  }
  try {
    const [planCommitted, taken] = await Promise.all([
      readLastCommitTimeAt(
        source,
        planPath,
        revision,
        signal,
        countedPlanBranch(entry),
      ),
      take.kind === "profile"
        ? additionOf(take.path).then(takeTimeOf)
        : undefined,
    ]);
    return {
      status: "started",
      at: taken !== undefined && taken > planCommitted ? taken : planCommitted,
      takeRecorded: taken !== undefined,
    };
  } catch (error) {
    return {
      status: "unavailable",
      problem: detailGapProblem(
        error,
        signal,
        "the last plan commit or the Take",
        "The last plan commit or Take time could not be read.",
      ),
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

// Reads each clock's start from the read's profile additions (`additionOf`);
// a failed or abandoned read is that clock's gap. Each clock is passed on to
// `onClocked` as soon as its own reads end, so a slow Take delays only its own
// clock.
export async function withSliceClocks(
  work: PublishedWork,
  additionOf: ProfileAdditions,
  signal: AbortSignal,
  onClocked?: (work: PublishedWork) => void,
): Promise<PublishedWork> {
  const { source, revision } = work;
  let clocked = work;
  await Promise.all(
    work.taken.map(async (entry, index) => {
      const planPath = countedPlanPathOf(entry);
      if (planPath === undefined) {
        return;
      }
      const sliceClock = await startOf(
        entry,
        planPath,
        source,
        revision,
        additionOf,
        signal,
      );
      clocked = {
        ...clocked,
        taken: clocked.taken.map((each, at) =>
          at === index ? { ...each, sliceClock } : each,
        ),
      };
      onClocked?.(clocked);
    }),
  );
  return clocked;
}
