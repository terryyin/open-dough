// The page's selected story as Intent's lens reads it (`./IntentPerspective.tsx`,
// `./IntentStorySummary.tsx`): the story by its published entry, and what is
// known of its default Review changes comparison (`./useStoryComparison.ts`).
// Whether the story has a comparison is decided as Review changes offers it
// (`storyComparisonOffered`), unknown while an active story's records are
// unread; a story with none reads nothing. A completed story is named by its
// published done record's title, read as Recently done reads it
// (`./doneDetails.ts`), and by its identity until that record says more.

import { useState } from "react";
import { useDoneDetails } from "./doneDetails.ts";
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
// record's title once read (`doneTitle`), else by its identity.
function lensStoryOf(
  work: PublishedWork | undefined,
  identity: string,
  doneTitle: string | undefined,
): LensStory {
  const entry = [...(work?.taken ?? []), ...(work?.backlog ?? [])].find(
    (each) => each.identity === identity,
  );
  return entry === undefined
    ? { identity, title: doneTitle ?? identity, completed: true }
    : { identity, title: entry.title, completed: false };
}

// The selected story's published done record, read once it is catalogued,
// and the title it gives.
function useDoneTitle(
  source: PublishedSource,
  work: PublishedWork | undefined,
  identity: string | undefined,
) {
  const done = work?.done;
  const catalogued = done?.status === "catalogued" ? done : undefined;
  const record =
    identity === undefined
      ? undefined
      : catalogued?.records.find((each) => each.identity === identity);
  const { detailOf } = useDoneDetails(
    source,
    catalogued?.revision ?? "",
    record === undefined ? [] : [record],
    record !== undefined,
  );
  if (record === undefined) return undefined;
  const detail = detailOf(record);
  return detail.status === "read" ? detail.story.title : undefined;
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
  const doneTitle = useDoneTitle(source, work, selectedIdentity);
  const story =
    selectedIdentity === undefined
      ? undefined
      : lensStoryOf(work, selectedIdentity, doneTitle);
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
        : shown !== undefined
          ? { state: "compared", shown, review }
          : problem !== undefined && !reading
            ? { state: "failed", problem }
            : review !== undefined &&
                !reading &&
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
