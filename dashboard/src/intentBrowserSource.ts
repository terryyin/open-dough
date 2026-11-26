// The comparison can supply changed files using its captured tree when
// the whole story has no readable historical locations. Project Intent
// browses the whole project, so its tree shows without configured locations.
// A read story result supplies its own pinned locations instead.
import {
  hasUnavailableComparisonSource,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import type { StoryResultBrowse } from "./useStoryResultRead.tsx";

export function intentBrowserSource(
  shown: ShownIntentLocations,
  comparison: LensComparison | undefined,
  wholeProject: boolean,
  result: StoryResultBrowse | undefined,
) {
  if (result !== undefined)
    return {
      comparisonSourceUnavailable: false,
      locations: result.locations,
      revision: result.pin.revision,
      explanation: undefined,
      lead: result.lead,
    };
  const capturedRevision =
    comparison?.state === "compared" && comparison.review?.kind === "landed"
      ? comparison.shown.tree
      : undefined;
  const comparisonSourceUnavailable =
    hasUnavailableComparisonSource(comparison);
  const listOutsideLocations =
    (wholeProject && shown.unconfigured) ||
    (comparison?.state === "compared" &&
      (shown.unconfigured || capturedRevision !== undefined));
  const locations = comparisonSourceUnavailable
    ? undefined
    : (shown.locations ?? (listOutsideLocations ? [] : undefined));
  return {
    comparisonSourceUnavailable,
    locations,
    revision: shown.shownRevision ?? capturedRevision,
    explanation:
      locations === undefined && !comparisonSourceUnavailable
        ? shown.explanation
        : undefined,
    lead: locations === undefined ? undefined : shown.explanation,
  };
}
