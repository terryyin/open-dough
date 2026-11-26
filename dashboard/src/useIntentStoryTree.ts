// The compared story's overlay and the kept scope of its file browser.

import { useMemo } from "react";
import { useKeptArrangement } from "./pageIntentReading.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { ComparedStory } from "./IntentStorySummary.tsx";
import type { FilesFilter } from "./FilesSidebarActions.tsx";
import {
  intentStoryOverlay,
  storyRepositoryTree,
} from "./intentStoryOverlay.ts";

// A compared story's "Changes only" filter and whether the chosen filters
// leave no path; only the locations browser has them.
export type StoryTreeScope = {
  readonly changesOnly: FilesFilter;
  readonly noMatch: boolean;
};

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
  // Intent only is off unless kept, in a story and in whole-project scope.
  const [intentOnly, setIntentOnly] = useKeptArrangement(
    "intentOnly",
    () => false,
  );
  const shown = useMemo(
    () => storyRepositoryTree(locations, overlay, changesOnly, intentOnly),
    [locations, overlay, changesOnly, intentOnly],
  );
  // The expansion the story's overlay last asked for here: when it first had
  // one, and at each toggle.
  const [round, setRound] = useKeptArrangement("storyExpansionRound", () => 0);
  if (story !== undefined && round === 0) setRound(1);
  // A filter's choice asks the story's expansion afresh.
  const filterOf = (
    label: string,
    checked: boolean,
    choose: (next: boolean) => void,
  ): FilesFilter => ({
    label,
    checked,
    onToggle: (next) => {
      choose(next);
      setRound((previous) => previous + 1);
    },
  });
  const scope: StoryTreeScope | undefined =
    story === undefined
      ? undefined
      : {
          changesOnly: filterOf("Changes only", only, setOnly),
          noMatch: shown.noMatch,
        };
  return {
    overlay,
    shown,
    intentOnly: filterOf("Intent only", intentOnly, setIntentOnly),
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
