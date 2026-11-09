// A Done story's locations and unchanged-file source belong to its published
// result commit. Its comparison/CI keep their own baseline and measured build
// provenance. Missing history never borrows the project's current test tree.

import { settledLocationsOf } from "./IntentLocationsUnavailable.tsx";
import type { StorySummary } from "./IntentStorySummary.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import { useIntentLocations } from "./useIntentLocations.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";

export function useHistoricalIntentLocations(
  source: PublishedSource,
  summary: StorySummary,
): ShownIntentLocations {
  const comparison = summary.comparison;
  const review =
    comparison.state === "compared" ? comparison.review : undefined;
  const revision =
    review?.kind === "published"
      ? review.completion
      : review?.kind === "landed"
        ? review.landing.revision
        : undefined;
  const { intent, shownRevision, retryLocations } = useIntentLocations(
    source,
    revision,
    false,
  );
  if (revision === undefined || intent === "loading") {
    return {
      notice: undefined,
      shownRevision: undefined,
      locations: undefined,
      explanation:
        comparison.state === "reading" || revision !== undefined ? (
          <p className="quiet">
            Reading the story&apos;s historical Intent locations…
          </p>
        ) : (
          <p className="intent-story-problem">
            The story&apos;s historical Intent locations and test source are
            unavailable: its landed result could not be established.
          </p>
        ),
    };
  }
  const settled = settledLocationsOf(
    intent,
    `${source.label} at the story's landed revision ${shortRevision(revision)}`,
    retryLocations,
  );
  return {
    notice: undefined,
    shownRevision,
    locations: "locations" in settled ? settled.locations : undefined,
    explanation:
      "status" in intent && intent.status === "not-configured" ? (
        <p className="intent-not-configured">
          No Intent locations were configured at the story&apos;s landed
          revision <code>{shortRevision(revision)}</code>.
        </p>
      ) : "unavailable" in settled ? (
        settled.unavailable
      ) : undefined,
  };
}
