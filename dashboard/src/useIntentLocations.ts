// The Intent locations of the published work's revision
// (`./IntentPerspective.tsx`), read through the authenticated read boundary
// (`./authenticatedIntentRead.ts`): reading, failed with the read problem
// that says why, or the answer, with manual or scheduled Retry. Locations
// are read per revision:
// the published work's detail completing at the same revision replaces the
// work, but neither reads them again nor remounts the browser and its
// selection.

import { useEffect, useState } from "react";
import {
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
type IntentLocationsFailure = {
  readonly failed: ReadProblem | undefined;
};

export function useIntentLocations(
  source: PublishedSource,
  revision: string | undefined,
) {
  const [intent, setIntent] = useState<
    IntentLocations | "loading" | IntentLocationsFailure
  >(revision === undefined ? { status: "not-configured" } : "loading");
  const { retry, retryRead, recordSettled } = useIntentReadRecovery(
    source,
    revision,
  );
  useEffect(() => {
    if (revision === undefined) {
      setIntent({ status: "not-configured" });
      return;
    }
    const controller = new AbortController();
    setIntent("loading");
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (controller.signal.aborted) return;
        recordSettled(
          locations.status === "settings-problem"
            ? locations.recovery
            : undefined,
        );
        setIntent(locations);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const failed = error instanceof ReadProblem ? error : undefined;
        recordSettled(intentRecoveryOf(failed));
        setIntent({ failed });
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, retry, recordSettled]);

  return { intent, retryLocations: retryRead };
}
