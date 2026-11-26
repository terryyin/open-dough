// Intent's locations as the project follows them (`./ProjectIntentReading.tsx`):
// read at Intent's reading revision, behind whose notice a newer observed
// revision waits until **Show latest** (`./IntentRevisionNotice.tsx`). Once
// they settle (work read, answer shown), the configured locations to browse,
// or the explanation shown in their place (`./IntentLocationsUnavailable.tsx`),
// as it is while work is unknown or the locations are still read.

import type { ReactNode } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import {
  LocationsNotConfigured,
  settledLocationsOf,
} from "./IntentLocationsUnavailable.tsx";
import {
  IntentRevisionNotice,
  useIntentReadingRevision,
} from "./IntentRevisionNotice.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  useIntentLocations,
  type FailedLocationsUpdate,
} from "./useIntentLocations.ts";

// A reading shown at `revision` as the revision notice states it: whether it
// is updating, the failed update and its Retry.
type ShownReading = {
  readonly revision: string | undefined;
  readonly updating: boolean;
  readonly failedUpdate: FailedLocationsUpdate | undefined;
  readonly onRetry: () => void;
};

// What the notice follows: Intent's reading revision, the failed read of its
// locations and their Retry, and the notice for a shown reading beside the
// observed revision and its Show latest.
export type FollowedRevision = {
  readonly reading: string | undefined;
  readonly failedUpdate: FailedLocationsUpdate | undefined;
  readonly retryLocations: () => void;
  readonly noticeFor: (shown: ShownReading) => ReactNode;
};

export type ShownIntentLocations = {
  readonly notice: ReactNode;
  // Present while the reading follows the project's observed revision.
  readonly follow?: FollowedRevision;
  readonly reading?: true;
  // The revision whose locations are shown, once one is.
  readonly shownRevision: string | undefined;
  readonly locations: readonly IntentLocation[] | undefined;
  // What shows in place of the locations browser until it can show.
  readonly explanation: ReactNode;
  // Whether the settled answer is that no locations are configured, when a
  // compared story's changed files still list outside every location.
  readonly unconfigured: boolean;
};

export function useShownIntentLocations(
  source: PublishedSource,
  work: PublishedWork | undefined,
): ShownIntentLocations {
  const observed = work?.revision;
  const { reading, showLatest } = useIntentReadingRevision(observed);
  const { intent, shownRevision, updating, failedUpdate, retryLocations } =
    useIntentLocations(source, reading);
  const noticeFor = (shown: ShownReading) => (
    <IntentRevisionNotice
      shown={shown.revision}
      observed={observed}
      updating={shown.updating}
      failedUpdate={shown.failedUpdate}
      onShowLatest={showLatest}
      onRetry={shown.onRetry}
    />
  );
  const settled =
    work === undefined || intent === "loading"
      ? undefined
      : settledLocationsOf(intent, source.label, retryLocations);
  return {
    notice: noticeFor({
      revision: shownRevision,
      updating,
      failedUpdate,
      onRetry: retryLocations,
    }),
    follow: { reading, failedUpdate, retryLocations, noticeFor },
    ...(settled === undefined ? { reading: true } : {}),
    shownRevision,
    locations:
      settled !== undefined && "locations" in settled
        ? settled.locations
        : undefined,
    unconfigured:
      settled !== undefined &&
      intent !== "loading" &&
      "status" in intent &&
      intent.status === "not-configured",
    explanation:
      work === undefined ? (
        <LocationsNotConfigured label={source.label} />
      ) : settled === undefined ? (
        <p className="quiet">Reading Intent locations…</p>
      ) : "unavailable" in settled ? (
        settled.unavailable
      ) : undefined,
  };
}
