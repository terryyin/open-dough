// The page's selected story as Intent's lens reads it (`./IntentPerspective.tsx`,
// `./IntentStorySummary.tsx`): the story by its published entry, and what is
// known of its default Review changes comparison (`./useStoryComparison.ts`).
// Whether the story has a comparison is decided as Review changes offers it
// (`storyComparisonOffered`), unknown while an active story's records are
// unread; a story with none reads nothing. A completed story is named by its
// published done record, read as Recently done reads it (`./doneDetails.ts`),
// and by its identity until that record says more; what is known of that
// record also qualifies its Intent coverage (`./IntentStoryCoverage.tsx`).

import { useState } from "react";
import { useDoneDetails } from "./doneDetails.ts";
import { unreadableDoneRecord } from "./doneRecord.ts";
import type { IntentDoneRecord } from "./IntentStoryCoverage.tsx";
import type { LensComparison } from "./IntentStoryComparison.tsx";
import type { ComparedStory, LensStory } from "./IntentStorySummary.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { storyComparisonOffered } from "./storyReviewWorkspace.ts";
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
  workspaces,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly selectedIdentity: string | undefined;
  readonly records: readonly LaunchRecord[] | undefined;
  readonly workspaces: readonly LocalWorkspace[];
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
  const offered =
    story === undefined
      ? false
      : story.completed || records !== undefined
        ? storyComparisonOffered(
            records,
            workspaces,
            source.id,
            story.identity,
            story.completed,
          )
        : undefined;
  const [round, setRound] = useState(0);
  const { review, reading, problem, shown } = useStoryComparison({
    source: source.id,
    identity: story?.identity ?? "",
    completed: story?.completed ?? false,
    round,
    enabled: offered === true,
  });
  const comparison: LensComparison =
    offered === undefined
      ? { state: "reading" }
      : !offered
        ? { state: "unavailable" }
        : reading
          ? { state: "reading" }
          : shown !== undefined
            ? { state: "compared", shown, review }
            : problem !== undefined
              ? { state: "failed", problem }
              : review !== undefined &&
                  (review.kind === "unavailable" ||
                    review.kind === "landing-unavailable")
                ? { state: "unavailable", explanation: review.explanation }
                : { state: "reading" };
  return {
    story,
    comparison,
    compared:
      story !== undefined && comparison.state === "compared"
        ? { lens: story, shown: comparison.shown }
        : undefined,
    retry: () => {
      setRound((n) => n + 1);
    },
  };
}
