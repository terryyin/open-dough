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

import {
  additionQuestion,
  type ProfileAdditions,
} from "./authenticatedProfileRead.ts";
import { readLastCommitTimeAt } from "./authenticatedRead.ts";
import {
  shouldAsk,
  trackSettledAsk,
  type ObservationOutcomes,
  type ReadQuestion,
} from "./observationOutcomes.ts";
import { countedPlanBranch } from "./progressSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork, WorkEntry } from "./publishedWork.ts";
import {
  gapCauseOf,
  unavailableGap,
  type UnavailableGap,
} from "./readWaitBound.ts";
import {
  countedPlanPathOf,
  takeSourceOf,
  takeTimeOf,
} from "./sliceClockTake.ts";

export type SliceClock =
  | { readonly status: "loading" }
  | UnavailableGap
  | {
      readonly status: "started";
      readonly at: Date;
      // False when no agent profile records the Take, so the clock starts at
      // the plan's last commit.
      readonly takeRecorded: boolean;
    };

function commitTimeQuestion(
  source: PublishedSource,
  revision: string,
  planPath: string,
  entry: WorkEntry,
): ReadQuestion {
  const onBranch = countedPlanBranch(entry);
  return {
    sourceId: source.id,
    revision: onBranch?.head ?? revision,
    ...(onBranch !== undefined ? { head: onBranch.head } : {}),
    operation: "commit-time",
    path: planPath,
  };
}

async function startOf(
  entry: WorkEntry,
  planPath: string,
  source: PublishedSource,
  revision: string,
  additionOf: ProfileAdditions,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
): Promise<SliceClock> {
  const take = takeSourceOf(entry);
  if (take.kind === "unknown") {
    return { status: "unavailable", problem: take.problem };
  }
  const question = commitTimeQuestion(source, revision, planPath, entry);
  const prior = entry.sliceClock;
  const askPlan = shouldAsk(outcomes, question);
  const askTake =
    take.kind === "profile" &&
    shouldAsk(outcomes, additionQuestion(source, revision, take.path));
  // A started clock whose plan commit stays settled is kept for this pin.
  // An unavailable clock is kept only when neither the plan nor the Take
  // still needs an ask — otherwise a rate-limited Take beside an answered
  // plan would stick forever.
  if (prior?.status === "started" && !askPlan) {
    return prior;
  }
  if (prior?.status === "unavailable" && !askPlan && !askTake) {
    return prior;
  }
  try {
    // Answered plan times reuse the existing memo without re-settling under
    // a shared bound another gap may still be waiting on. Plan and Take
    // still run together so a failed plan does not wait on its Take.
    const [planCommitted, taken] = await Promise.all([
      askPlan
        ? trackSettledAsk(
            outcomes,
            readLastCommitTimeAt(
              source,
              planPath,
              revision,
              signal,
              countedPlanBranch(entry),
            ),
            {
              question,
              untilEither: signal,
              bound,
              reading: "the last plan commit",
              unreadable: "The last plan commit could not be read.",
            },
          )
        : readLastCommitTimeAt(
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
    return unavailableGap(
      gapCauseOf(
        error,
        signal,
        bound,
        "the last plan commit or the Take",
        "The last plan commit or Take time could not be read.",
      ),
    );
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
// a failed or bound-interrupted read is that clock's gap. Each clock is
// passed on to `onClocked` as soon as its own reads end, so a slow Take
// delays only its own clock.
export async function withSliceClocks(
  work: PublishedWork,
  additionOf: ProfileAdditions,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
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
        outcomes,
        bound,
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
