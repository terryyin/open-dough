// The page's selected story as Intent's lens reads it (`./IntentPerspective.tsx`,
// `./IntentStorySummary.tsx`): the story by its published entry, and what is
// known of its Review changes comparison (`./useStoryComparison.ts`): the
// default, and the chosen one that equals it until a choice is made.
// Whether the story has a comparison is decided by published membership or
// retained landing evidence, unknown while an active story's records are
// unread; a story with none reads nothing. A completed story is named by its
// published done record, read as Recently done reads it (`./doneDetails.ts`),
// and by its identity until that record says more; what is known of that
// record also qualifies its Intent coverage (`./IntentStoryCoverage.tsx`).

import { useDoneDetails } from "./doneDetails.ts";
import { unreadableDoneRecord } from "./doneRecord.ts";
import { usePublishIntentStoryTitle } from "./intentStoryTitle.tsx";
import type { IntentDoneRecord } from "./IntentStoryCoverage.tsx";
import type { LensComparison } from "./IntentStoryComparison.tsx";
import {
  wholeStoryOf,
  type ComparedStory,
  type LensStory,
} from "./IntentStorySummary.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { storyReviewOffered } from "./storyReviewLandedRun.ts";
import { useStoryComparison } from "./useStoryComparison.ts";

// The selected story as Intent names it: an active story by its published
// entry; any other selected story is a completed one, named by its done
// record's title once read, else by its identity.
function lensStoryOf(
  work: PublishedWork | undefined,
  identity: string,
  record: IntentDoneRecord,
): LensStory {
  const entry = [...(work?.taken ?? []), ...(work?.backlog ?? [])].find(
    (each) => each.identity === identity,
  );
  return entry === undefined
    ? {
        identity,
        title: record.state === "read" ? record.story.title : identity,
        completed: true,
        record,
      }
    : { identity, title: entry.title, completed: false };
}

// Why a completed story has no done record to read.
const notCatalogued = "No published done record names this story.";

// The selected story's published done record, read once it is catalogued:
// still reading while the catalog or the record is, else what it says or why
// it could not be read, with Retry for a failed read.
function useDoneRecord(
  source: PublishedSource,
  work: PublishedWork | undefined,
  identity: string | undefined,
): IntentDoneRecord {
  const done = work?.done;
  const catalogued = done?.status === "catalogued" ? done : undefined;
  const record =
    identity === undefined
      ? undefined
      : catalogued?.records.find((each) => each.identity === identity);
  const { detailOf, retry } = useDoneDetails(
    source,
    catalogued?.revision ?? "",
    record === undefined ? [] : [record],
    record !== undefined,
  );
  if (done === undefined || done.status === "loading")
    return { state: "reading" };
  if (done.status === "unavailable")
    return { state: "failed", problem: done.problem };
  if (record === undefined) return { state: "failed", problem: notCatalogued };
  const detail = detailOf(record);
  switch (detail.status) {
    case "reading":
      return { state: "reading" };
    case "read":
      return { state: "read", story: detail.story };
    case "unreadable":
      return {
        state: "failed",
        problem: unreadableDoneRecord(record.fileName, detail.problem),
      };
    case "failed":
      return { state: "failed", problem: detail.problem, retry };
  }
}

export function useIntentStoryLens({
  source,
  work,
  selectedIdentity,
  records,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly selectedIdentity: string | undefined;
  readonly records: readonly LaunchRecord[] | undefined;
}): {
  readonly story: LensStory | undefined;
  readonly comparison: LensComparison;
  // The story with its comparison, once compared.
  readonly compared: ComparedStory | undefined;
  readonly retry: () => void;
} {
  const doneRecord = useDoneRecord(source, work, selectedIdentity);
  const story =
    selectedIdentity === undefined
      ? undefined
      : lensStoryOf(work, selectedIdentity, doneRecord);
  usePublishIntentStoryTitle(source.id, story);
  const taken = work?.taken.find(
    ({ identity }) => identity === selectedIdentity,
  );
  const offered =
    story === undefined
      ? false
      : storyReviewOffered(
          records,
          source.id,
          story.identity,
          story.completed || taken !== undefined,
        );
  const {
    review,
    defaultReview,
    reading,
    initialSync,
    problem,
    shown,
    compare,
    unreadable,
    refreshed,
    onRefresh,
  } = useStoryComparison({
    source: source.id,
    identity: story?.identity ?? "",
    completed: story?.completed ?? false,
    taken: taken !== undefined,
    enabled: offered === true,
    records,
  });
  const comparison: LensComparison =
    offered === undefined
      ? { state: "reading" }
      : !offered
        ? { state: "unavailable" }
        : shown !== undefined
          ? {
              state: "compared",
              shown,
              review,
              defaultReview,
              compare,
              ...(reading ? { reading: true } : { refreshed }),
            }
          : reading || initialSync !== undefined
            ? { state: "reading", defaultReview, compare, initialSync }
            : unreadable !== undefined && compare !== undefined
              ? { state: "unreadable", unreadable, defaultReview, compare }
              : problem !== undefined
                ? { state: "failed", problem, compare }
                : review !== undefined &&
                    (review.kind === "unavailable" ||
                      review.kind === "landing-unavailable")
                  ? {
                      state: "unavailable",
                      explanation: review.explanation,
                      compare,
                      ...(review.kind === "landing-unavailable"
                        ? { unavailableLanding: true }
                        : {}),
                    }
                  : { state: "reading", defaultReview, compare };
  return {
    story,
    comparison,
    compared:
      story !== undefined && comparison.state === "compared"
        ? {
            lens: story,
            shown: comparison.shown,
            wholeStory: wholeStoryOf({ comparison }),
          }
        : undefined,
    retry: onRefresh,
  };
}
