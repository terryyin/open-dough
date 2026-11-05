// The Intent locations of Intent's reading revision
// (`./IntentPerspective.tsx`), read through the authenticated read boundary
// (`./authenticatedIntentRead.ts`): reading, failed with the read problem
// that says why, or the answer, with manual or scheduled Retry. Locations
// are read per revision and only when the reading revision changes, never
// because a newer revision is observed. Moving the reading to another
// revision keeps the shown answer, with the revision it is of, while the new
// one is read (`updating`), so the browser and its reading stay in place.

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

// The answer shown and the revision it is of.
type ShownLocations = {
  readonly revision: string;
  readonly intent: IntentLocations | IntentLocationsFailure;
};

export function useIntentLocations(
  source: PublishedSource,
  revision: string | undefined,
) {
  const [shown, setShown] = useState<ShownLocations | undefined>(undefined);
  const { retry, retryRead, recordSettled } = useIntentReadRecovery(
    source,
    revision,
  );
  useEffect(() => {
    if (revision === undefined) return;
    const controller = new AbortController();
    // A Retry reads as reading; another revision's answer stays shown.
    setShown((was) =>
      was === undefined || was.revision === revision || "failed" in was.intent
        ? undefined
        : was,
    );
    void readIntentLocationsAt(source, revision, controller.signal)
      .then((locations) => {
        if (controller.signal.aborted) return;
        recordSettled(
          locations.status === "settings-problem"
            ? locations.recovery
            : undefined,
        );
        setShown({ revision, intent: locations });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const failed = error instanceof ReadProblem ? error : undefined;
        recordSettled(intentRecoveryOf(failed));
        setShown({ revision, intent: { failed } });
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, retry, recordSettled]);

  const intent: IntentLocations | "loading" | IntentLocationsFailure =
    revision === undefined
      ? { status: "not-configured" }
      : (shown?.intent ?? "loading");
  return {
    intent,
    // The revision the shown answer is of, and whether another is being read.
    shownRevision: revision === undefined ? undefined : shown?.revision,
    updating:
      revision !== undefined &&
      shown !== undefined &&
      shown.revision !== revision,
    retryLocations: retryRead,
  };
}
