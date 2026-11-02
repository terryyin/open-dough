// The page's selected story as Intent's lens reads it (`./IntentPerspective.tsx`,
// `./IntentStoryLens.tsx`): the story by its published entry, and what is
// known of its default Review changes comparison (`./useStoryComparison.ts`).
// Whether the story has a comparison is decided as Review changes offers it
// (`storyComparisonOffered`), unknown while an active story's records are
// unread; a story with none reads nothing.

import { useState } from "react";
import type {
  ComparedStory,
  LensComparison,
  LensStory,
} from "./IntentStoryLens.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { storyComparisonOffered } from "./storyReviewWorkspace.ts";
import { useStoryComparison } from "./useStoryComparison.ts";

// The selected story as Intent names it: an active story by its published
// entry; any other selected story is a completed one, named by its identity.
function lensStoryOf(
  work: PublishedWork | undefined,
  identity: string,
): LensStory {
  const entry = [...(work?.taken ?? []), ...(work?.backlog ?? [])].find(
    (each) => each.identity === identity,
  );
  return entry === undefined
    ? { identity, title: identity, completed: true }
    : { identity, title: entry.title, completed: false };
}

export function useIntentStoryLens({
  source,
  work,
  selectedIdentity,
  records,
  workspaces,
}: {
  readonly source: string;
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
  const story =
    selectedIdentity === undefined
      ? undefined
      : lensStoryOf(work, selectedIdentity);
  const offered =
    story === undefined
      ? false
      : story.completed || records !== undefined
        ? storyComparisonOffered(
            records,
            workspaces,
            source,
            story.identity,
            story.completed,
          )
        : undefined;
  const [round, setRound] = useState(0);
  const { review, reading, problem, shown } = useStoryComparison({
    source,
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
