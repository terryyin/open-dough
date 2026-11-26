// A Done story's locations and unchanged-file source belong to its published
// result commit. Its comparison/CI keep their own baseline and measured build
// provenance. Missing history never borrows the project's current test tree.

import { settledLocationsOf } from "./IntentLocationsUnavailable.tsx";
import { defaultReviewOf } from "./IntentStoryComparison.tsx";
import type { StorySummary } from "./IntentStorySummary.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import { useIntentLocations } from "./useIntentLocations.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import { storyResultPin } from "./useStoryResultRead.tsx";
import "./intent-explanations.css";

export function useHistoricalIntentLocations(
  source: PublishedSource,
  summary: StorySummary,
): ShownIntentLocations {
  const comparison = summary.comparison;
  const review = defaultReviewOf(comparison);
  const revision =
    storyResultPin(comparison) !== undefined
      ? undefined
      : review?.kind === "published"
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
    const initialSync =
      comparison.state === "reading" ? comparison.initialSync : undefined;
    return {
      notice: undefined,
      ...(comparison.state === "reading" || revision !== undefined
        ? { reading: true }
        : {}),
      shownRevision: undefined,
      locations: undefined,
      unconfigured: false,
      explanation:
        initialSync !== undefined ? undefined : comparison.state ===
            "reading" || revision !== undefined ? (
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
  const unconfigured = "status" in intent && intent.status === "not-configured";
  const settled = settledLocationsOf(
    intent,
    `${source.label} at the story's landed revision ${shortRevision(revision)}`,
    retryLocations,
  );
  return {
    notice: undefined,
    shownRevision,
    locations: "locations" in settled ? settled.locations : undefined,
    unconfigured,
    explanation: unconfigured ? (
      <p className="intent-not-configured">
        No Intent locations were configured at the story&apos;s landed revision{" "}
        <code>{shortRevision(revision)}</code>.
      </p>
    ) : "unavailable" in settled ? (
      settled.unavailable
    ) : undefined,
  };
}
