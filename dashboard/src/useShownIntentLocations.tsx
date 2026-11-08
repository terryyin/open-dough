// Intent's locations as the perspective shows them (`./IntentPerspective.tsx`):
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
import { useIntentLocations } from "./useIntentLocations.ts";

export type ShownIntentLocations = {
  readonly notice: ReactNode;
  // The revision whose locations are shown, once one is.
  readonly shownRevision: string | undefined;
  readonly settled: boolean;
  readonly locations: readonly IntentLocation[] | undefined;
  // What shows in place of the locations browser until it can show.
  readonly explanation: ReactNode;
};

export function useShownIntentLocations(
  source: PublishedSource,
  work: PublishedWork | undefined,
): ShownIntentLocations {
  const observed = work?.revision;
  const { reading, showLatest } = useIntentReadingRevision(observed);
  const { intent, shownRevision, updating, failedUpdate, retryLocations } =
    useIntentLocations(source, reading);
  const notice = (
    <IntentRevisionNotice
      shown={shownRevision}
      observed={observed}
      updating={updating}
      failedUpdate={failedUpdate}
      onShowLatest={showLatest}
      onRetry={retryLocations}
    />
  );
  const settled =
    work === undefined || intent === "loading"
      ? undefined
      : settledLocationsOf(intent, source.label, retryLocations);
  return {
    notice,
    shownRevision,
    settled: settled !== undefined,
    locations:
      settled !== undefined && "locations" in settled
        ? settled.locations
        : undefined,
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
