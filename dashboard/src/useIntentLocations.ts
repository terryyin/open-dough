// The Intent locations of Intent's reading revision
// (`./IntentPerspective.tsx`), read through the authenticated read boundary
// (`./authenticatedIntentRead.ts`): reading, failed with the read problem
// that says why, or the answer, with manual or scheduled Retry. Locations
// are read per revision and only when the reading revision changes, never
// because a newer revision is observed. An answer already read on this page
// shows at once. Moving the reading to another revision keeps the shown
// answer, with the revision it is of, while the new one is read (`updating`),
// so the browser and its reading stay in place; if that read fails, the shown
// answer still stays and the failure is the update's (`failedUpdate`), retried
// with the same Retry.

import { useEffect, useState } from "react";
import {
  keptIntentLocationsAt,
  readIntentLocationsAt,
  type IntentLocations,
} from "./authenticatedIntentRead.ts";
import {
  intentRecoveryOf,
  useIntentReadRecovery,
} from "./intentReadRecovery.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";

// A failed read of the locations, carrying why it failed when the read
// boundary said so.
export type IntentLocationsFailure = {
  readonly failed: ReadProblem | undefined;
};

// The answer shown and the revision it is of.
type ShownLocations = {
  readonly revision: string;
  readonly intent: IntentLocations | IntentLocationsFailure;
};

// A failed read of the reading revision while another revision's answer
// stays shown.
export type FailedLocationsUpdate = IntentLocationsFailure & {
  readonly revision: string;
};

type LocationsRead = {
  readonly shown: ShownLocations | undefined;
  readonly failedUpdate?: FailedLocationsUpdate;
};

// Whether `shown` is another revision's answer, which stays while `revision`
// is read.
const keptWhileReading = (
  shown: ShownLocations | undefined,
  revision: string,
): shown is ShownLocations =>
  shown !== undefined &&
  shown.revision !== revision &&
  !("failed" in shown.intent);

export function useIntentLocations(
  source: PublishedSource,
  revision: string | undefined,
) {
  const [read, setRead] = useState<LocationsRead>({ shown: undefined });
  const { retry, retryRead, recordSettled } = useIntentReadRecovery(
    source,
    revision,
  );
  useEffect(() => {
    if (revision === undefined) return;
    const controller = new AbortController();
    // A Retry reads as reading; another revision's answer stays shown.
    setRead(({ shown }) => ({
      shown: keptWhileReading(shown, revision) ? shown : undefined,
    }));
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (controller.signal.aborted) return;
        recordSettled(
          locations.status === "settings-problem"
            ? locations.recovery
            : undefined,
        );
        setRead({ shown: { revision, intent: locations } });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const failed = error instanceof ReadProblem ? error : undefined;
        recordSettled(intentRecoveryOf(failed));
        setRead(({ shown }) =>
          keptWhileReading(shown, revision)
            ? { shown, failedUpdate: { revision, failed } }
            : { shown: { revision, intent: { failed } } },
        );
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, retry, recordSettled]);

  // An answer already read shows as it is rendered, before the effect runs.
  const kept =
    revision === undefined
      ? undefined
      : keptIntentLocationsAt(source, revision);
  const shown: ShownLocations | undefined =
    revision !== undefined && kept !== undefined
      ? { revision, intent: kept }
      : read.shown;
  const failedUpdate =
    kept === undefined && read.failedUpdate?.revision === revision
      ? read.failedUpdate
      : undefined;
  const intent: IntentLocations | "loading" | IntentLocationsFailure =
    revision === undefined
      ? { status: "not-configured" }
      : (shown?.intent ?? "loading");
  return {
    intent,
    // The revision the shown answer is of, whether another is being read,
    // and the failure of that read while the shown answer stays.
    shownRevision: revision === undefined ? undefined : shown?.revision,
    updating:
      revision !== undefined &&
      shown !== undefined &&
      shown.revision !== revision &&
      failedUpdate === undefined,
    failedUpdate,
    retryLocations: retryRead,
  };
}
