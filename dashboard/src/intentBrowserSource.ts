// The comparison can supply changed files using its captured tree when
// the whole story has no readable historical locations. Project Intent
// browses the whole project, so its tree shows without configured locations.
import {
  hasUnavailableComparisonSource,
  type LensComparison,
} from "./IntentStoryComparison.tsx";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";

export function intentBrowserSource(
  shown: ShownIntentLocations,
  comparison: LensComparison | undefined,
  wholeProject: boolean,
) {
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
