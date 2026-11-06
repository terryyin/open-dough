// A selected done story's CI comparison as Intent's CI evidence owner reads
// it (`./IntentCiEvidence.tsx`), through `./authenticatedIntentCiComparisonRead.ts`.
// Read once per identity while active; a completed answer is immutable on the
// server, so nothing is polled.

import { useEffect, useState } from "react";
import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

export type ComparisonReading = {
  readonly shown: StoryCiComparisonAnswer | undefined;
  readonly reading: boolean;
  readonly failed: string | undefined;
};

const unreadReason = "The CI comparison could not be read";

export function useIntentCiComparison(
  source: PublishedSource,
  identity: string | undefined,
): ComparisonReading {
  const key = identity === undefined ? undefined : `${source.id}#${identity}`;
  const [shown, setShown] = useState<StoryCiComparisonAnswer | undefined>(
    undefined,
  );
  const [reading, setReading] = useState(true);
  const [failed, setFailed] = useState<string | undefined>(undefined);
  const [readFor, setReadFor] = useState(key);
  if (readFor !== key) {
    setReadFor(key);
    setShown(undefined);
    setReading(true);
    setFailed(undefined);
  }

  useEffect(() => {
    if (identity === undefined) return;
    const controller = new AbortController();
    setReading(true);
    setFailed(undefined);
    void readIntentCiComparison(source, identity, controller.signal)
      .then((answer) => {
        if (controller.signal.aborted) return;
        setShown(answer);
        setReading(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setShown(undefined);
        setFailed(
          error instanceof Error && error.message !== ""
            ? error.message
            : unreadReason,
        );
        setReading(false);
      });
    return () => {
      controller.abort();
    };
  }, [source, identity]);

  const current = readFor === key;
  return {
    shown: current ? shown : undefined,
    reading: current ? reading : true,
    failed: current ? failed : undefined,
  };
}
