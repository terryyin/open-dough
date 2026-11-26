// The compared story's overlay and the kept scope of its file browser.

import { useMemo } from "react";
import { useKeptArrangement } from "./pageIntentReading.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { ComparedStory, StoryTreeScope } from "./IntentStorySummary.tsx";
import {
  intentStoryOverlay,
  storyRepositoryTree,
} from "./intentStoryOverlay.ts";

export function useIntentStoryTree({
  locations,
  story,
  storyIdentity,
  inventory,
  comparisonReading,
  resultReading,
  resultKey,
}: {
  readonly locations: readonly IntentLocation[];
  readonly story: ComparedStory | undefined;
  // The selected story, owning the tree's folder arrangement.
  readonly storyIdentity?: string | undefined;
  readonly inventory?: readonly string[] | undefined;
  readonly comparisonReading?: boolean;
  // The result's inventory, which names the configured roots, is read.
  readonly resultReading?: boolean | undefined;
  readonly resultKey?: string | undefined;
}) {
  const changes = story?.shown.comparison.files;
  const overlay = useMemo(
    () => intentStoryOverlay(locations, changes, inventory),
    [locations, changes, inventory],
  );
  const [only, setOnly] = useKeptArrangement("changesOnly", () => true);
  // An unread or unavailable comparison narrows nothing.
  const changesOnly =
    changes !== undefined && comparisonReading !== true && only;
  const shown = useMemo(
    () => storyRepositoryTree(locations, overlay, changesOnly),
    [locations, overlay, changesOnly],
  );
  // The expansion the story's overlay last asked for here: when it first had
  // one, and at each toggle.
  const [round, setRound] = useKeptArrangement("storyExpansionRound", () => 0);
  if (story !== undefined && round === 0) setRound(1);
  const scope: StoryTreeScope | undefined =
    story === undefined
      ? undefined
      : {
          only,
          noMatch: shown.noMatch,
          onOnly: (next) => {
            setOnly(next);
            setRound((previous) => previous + 1);
          },
        };
  return {
    overlay,
    shown,
    owner: storyIdentity ?? "",
    // No expansion is asked for until the comparison and the roots it
    // reveals are known.
    round:
      comparisonReading === true || resultReading === true
        ? undefined
        : resultKey === undefined
          ? round
          : `${resultKey}:${String(round)}`,
    scope,
  };
}
