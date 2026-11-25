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
  inventory,
  comparisonReading,
  resultKey,
}: {
  readonly locations: readonly IntentLocation[];
  readonly story: ComparedStory | undefined;
  readonly inventory?: readonly string[] | undefined;
  readonly comparisonReading?: boolean;
  readonly resultKey?: string | undefined;
}) {
  const changes = story?.shown.comparison.files;
  const overlay = useMemo(
    () => intentStoryOverlay(locations, changes, inventory),
    [locations, changes, inventory],
  );
  const [only, setOnly] = useKeptArrangement("storyOnly", () => false);
  const changesOnly = story !== undefined && only;
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
          noneInLocations: overlay.changedLocations.size === 0,
          onOnly: (next) => {
            setOnly(next);
            setRound((previous) => previous + 1);
          },
        };
  return {
    overlay,
    shown,
    round:
      comparisonReading === true
        ? undefined
        : resultKey === undefined
          ? round
          : `${resultKey}:${String(round)}`,
    scope,
  };
}
