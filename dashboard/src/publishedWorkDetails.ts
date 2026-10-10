// After membership: preparation, profiles, credit, progress, clocks, and done
// stories for one published snapshot read (`./publishedWorkRead.ts`). At the
// same revision as a shown snapshot, successful facts stay projected while
// eligible unanswered questions are asked again; at a new revision of the
// shown project, each snapshot the read shows carries the shown facts it has
// not answered yet (`./carriedFacts.ts`).

import type { PublishedWork, PublishedWorkProgress } from "./publishedWork.ts";
import { enrichPreparation } from "./preparationEnrichment.ts";
import { readAssignments, type ProfilesRead } from "./agentAssignments.ts";
import { withAssignments } from "./assignmentPlacement.ts";
import { readAttributedAssignments } from "./assignmentAttribution.ts";
import { profileAdditionsAt } from "./authenticatedProfileRead.ts";
import { readDoneStories, type DoneStories } from "./doneStories.ts";
import type { ObservationOutcomes } from "./observationOutcomes.ts";
import {
  awaitingProgressSources,
  withKnownProgressSources,
  withProgressSources,
} from "./progressSource.ts";
import { awaitingSliceClocks, withSliceClocks } from "./sliceClockStart.ts";
import { withCarriedFacts } from "./carriedFacts.ts";

// Enriches a membership snapshot with independent detail groups. Same-
// revision recovery keeps counted progress and clocks that already answered.
// `carriedFrom`, the shown snapshot of an earlier revision, lends its facts to
// every part not yet answered.
export async function readPublishedDetails(
  work: PublishedWork,
  sameRevision: boolean,
  carriedFrom: PublishedWork | undefined,
  untilEither: AbortSignal,
  bound: AbortSignal,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  onPartial?: PublishedWorkProgress,
): Promise<PublishedWork> {
  let prepared = work;
  let progress: PublishedWork | undefined = sameRevision ? work : undefined;
  let credited: ProfilesRead | undefined;
  let done: DoneStories =
    sameRevision && work.done !== undefined && work.done.status !== "loading"
      ? work.done
      : { status: "loading" };
  const assembled = (): PublishedWork => {
    // Trunk's plan facts do not establish a Taken entry's progress until
    // its profiles can say where that progress is published.
    const current = progress ?? {
      ...prepared,
      taken: prepared.taken.map((entry) =>
        entry.planSlices !== undefined && entry.planSlices.status !== "absent"
          ? { ...entry, planSlices: { status: "loading" as const } }
          : entry,
      ),
    };
    const withOwners =
      credited === undefined ? current : withAssignments(current, credited);
    // Owners from `credited` can heal before `progress` is rewritten; keep
    // trunk-copy labels aligned (or cleared) with the owners now shown.
    return withCarriedFacts(
      { ...withKnownProgressSources(withOwners), done },
      carriedFrom,
    );
  };
  const show = () => {
    if (!signal.aborted) {
      onPartial?.(assembled());
    }
  };
  // Establish the pending observation before any detail can answer.
  show();
  // The done stories are independent of preparation and profiles; any
  // failure, the bound included, is the column's own gap.
  const doneRead = readDoneStories(
    work.source,
    work.revision,
    untilEither,
    outcomes,
    bound,
  ).then((read) => {
    done = read;
    show();
  });
  // Owners and preparers come from the agent profiles at the same
  // revision, read beside the preparation facts.
  const preparationRead = enrichPreparation(
    work,
    untilEither,
    outcomes,
    bound,
  ).then((read) => {
    prepared = read;
    show();
    return read;
  });
  // Profiles answers (including same-revision listing memo) update owners
  // as soon as they land; attributed walks still refresh only eligible
  // additions below.
  const profilesRead = readAssignments(
    work.source,
    work.revision,
    untilEither,
    outcomes,
    bound,
  ).then((read) => {
    credited = read;
    show();
    return read;
  });
  // Each profile's addition is read once, for both its assignment's human
  // and its Take's slice clock. Each human is read while progress and
  // clocks are, and is shown as soon as its own walk ends, in whatever
  // snapshot is shown by then.
  const additionOf = profileAdditionsAt(
    work.source,
    work.revision,
    untilEither,
    outcomes,
    bound,
  );
  const attributed = profilesRead.then((assignments) =>
    readAttributedAssignments(
      work.source,
      work.revision,
      assignments,
      additionOf,
      untilEither,
      bound,
      (partial) => {
        credited = partial;
        show();
      },
    ),
  );
  const progressed = Promise.all([preparationRead, profilesRead]).then(
    async ([preparation, assignments]) => {
      // Always place the landed profiles answer: same-revision memo reads
      // must heal a stale unread gap left on `shown` from an earlier bound.
      const placed = withAssignments(preparation, assignments);
      // Same-revision recovery must not keep a profiles-unreadable trunk-copy
      // label after owners heal; branch progress still stays until re-routed.
      const owned = sameRevision
        ? withKnownProgressSources(placed)
        : awaitingProgressSources(placed);
      signal.throwIfAborted();
      progress = sameRevision ? owned : awaitingSliceClocks(owned);
      show();
      // Branch routing needs both the canonical plan and profiles.
      progress = sameRevision
        ? await withProgressSources(owned, untilEither, outcomes, bound)
        : awaitingSliceClocks(
            await withProgressSources(owned, untilEither, outcomes, bound),
          );
      signal.throwIfAborted();
      show();
      // Only core snapshot reads fail the observation at the bound;
      // clocks, humans, and done records retain their own detail gaps.
      const snapshotUnread = bound.aborted;
      progress = await withSliceClocks(
        progress,
        additionOf,
        untilEither,
        outcomes,
        bound,
        (partial) => {
          progress = partial;
          show();
        },
      );
      return snapshotUnread;
    },
  );
  const details = [
    preparationRead,
    profilesRead,
    progressed,
    attributed,
    doneRead,
  ] as const;
  try {
    const [, , snapshotUnread] = await Promise.all(details);
    signal.throwIfAborted();
    const enriched = assembled();
    // Finish every started read before the final promise establishes
    // completion, even when a bound left explicit gaps in the view.
    onPartial?.(enriched);
    if (snapshotUnread) {
      bound.throwIfAborted();
    }
    return enriched;
  } finally {
    // An abandoned or failed path still owns all its started tasks.
    await Promise.allSettled(details);
  }
}
