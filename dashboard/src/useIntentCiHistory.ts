// Project Intent's CI wall time history as its CI evidence owner reads it
// (`./IntentCiEvidence.tsx`), through
// `./authenticatedIntentCiHistoryRead.ts`: read with each read of the trunk's
// judgment (`./useIntentCiJudgment.ts` names each one's round) -- when Intent
// shows Project Intent, when the trunk is observed at a new revision, and on
// Check again -- and never on time alone, or while there is no round. A later
// read keeps the history shown until it answers; one that fails is said
// beside it.

import { useEffect, useState } from "react";
import { readIntentCiHistory } from "./authenticatedIntentCiHistoryRead.ts";
import type { MeasuredHistory } from "./landedCiHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";

const unreadHistoryReason = "The CI wall time history could not be read";

// The history shown, if any has been read for the source, and why the
// latest read failed, if it did.
export type HistoryReading = {
  readonly shown: MeasuredHistory | undefined;
  readonly failed: string | undefined;
};

export function useIntentCiHistory(
  source: PublishedSource,
  round: string | undefined,
): HistoryReading | undefined {
  const [shown, setShown] = useState<MeasuredHistory | undefined>(undefined);
  const [failed, setFailed] = useState<string | undefined>(undefined);
  // Another source's history is never shown as this one's.
  const [readFor, setReadFor] = useState(source.id);
  if (readFor !== source.id) {
    setReadFor(source.id);
    setShown(undefined);
    setFailed(undefined);
  }

  useEffect(() => {
    if (round === undefined) return;
    const controller = new AbortController();
    void readIntentCiHistory(source, controller.signal).then(
      (history) => {
        if (controller.signal.aborted) return;
        setShown(history);
        setFailed(undefined);
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setFailed(
          error instanceof Error && error.message !== ""
            ? error.message
            : unreadHistoryReason,
        );
      },
    );
    return () => {
      controller.abort();
    };
  }, [source, round]);

  if (round === undefined) return undefined;
  return readFor === source.id
    ? { shown, failed }
    : { shown: undefined, failed: undefined };
}
