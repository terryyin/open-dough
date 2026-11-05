// The locations browser's trees over a selected story's comparison
// (`./IntentBrowser.tsx`): its overlay on the published files
// (`./intentStoryOverlay.ts`), or with "Selected story only" its changed
// entries alone, locations without changes left out. The first time the
// browser has a compared story, and at each toggle either way, it opens the
// first changed location and the folders containing changes and collapses the
// rest. The toggle, off at first, and the count outside every location are the
// tree scope the story's summary offers (`./IntentStorySummary.tsx`). The
// toggle and the expansion it asked for are kept with the tree's arrangement
// (`./pageIntentReading.tsx`), so leaving Intent and returning neither turns
// it off nor expands the story again.

import { useKeptArrangement } from "./pageIntentReading.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { ComparedStory, StoryTreeScope } from "./IntentStorySummary.tsx";
import {
  intentStoryOverlay,
  storyChangesOnly,
  storyOverlayExpansion,
  type StoryOverlayExpansion,
} from "./intentStoryOverlay.ts";
import type { LocationExpansion } from "./useLocationOpenFolders.ts";

export function useIntentStoryTree({
  source,
  locations,
  story,
  onExpandLocation,
}: {
  readonly source: string;
  readonly locations: readonly IntentLocation[];
  readonly story: ComparedStory | undefined;
  // Opens the location the story's expansion names, or collapses them all.
  readonly onExpandLocation: (path: string | null) => void;
}) {
  const overlay = intentStoryOverlay(locations, story?.shown.comparison.files);
  const [only, setOnly] = useKeptArrangement("storyOnly", () => false);
  const changesOnly = story !== undefined && only;
  const shownOverlay = changesOnly ? storyChangesOnly(overlay) : overlay;
  // The expansion the story's overlay last asked for here: when it first had
  // one, and at each toggle.
  const [expansion, setExpansion] = useKeptArrangement<
    { readonly round: number; readonly plan: StoryOverlayExpansion } | undefined
  >("storyExpansion", () => undefined);
  function expandStory(round: number) {
    const plan = storyOverlayExpansion(locations, overlay);
    setExpansion({ round, plan });
    onExpandLocation(plan.location ?? null);
  }
  if (story !== undefined && expansion === undefined) expandStory(1);
  const locationExpansion = (index: number): LocationExpansion | undefined =>
    expansion === undefined
      ? undefined
      : {
          round: expansion.round,
          folders: expansion.plan.folders[index] ?? [],
        };
  const scope: StoryTreeScope | undefined =
    story === undefined
      ? undefined
      : {
          source,
          outside: overlay.outside,
          only,
          noneInLocations: !overlay.locations.some(
            (each) => each.containsChanges,
          ),
          onOnly: (next) => {
            setOnly(next);
            expandStory((expansion?.round ?? 0) + 1);
          },
        };
  return { overlay, shownOverlay, changesOnly, locationExpansion, scope };
}
