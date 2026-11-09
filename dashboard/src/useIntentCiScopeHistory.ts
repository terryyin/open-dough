// One scope's locally collected history, independent of the live comparison.
// A failed read keeps its last answer and retries only on the reader's action.

import { useEffect, useState } from "react";
import { readIntentCiScopeHistory } from "./authenticatedIntentCiHistoryRead.ts";
import type { CiScopeHistory, ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";

export function useIntentCiScopeHistory(
  source: PublishedSource | undefined,
  path: string,
  endpoint: ScopeHistoryEndpoint | undefined,
) {
  const revision = endpoint?.revision;
  const at = endpoint?.at;
  const key = `${source?.id ?? ""}#${path}#${revision ?? ""}#${at ?? ""}`;
  const [round, setRound] = useState(0);
  const [reading, setReading] = useState<{
    readonly key: string;
    readonly shown?: CiScopeHistory;
    readonly failed?: string;
  }>({ key });

  useEffect(() => {
    if (source === undefined || revision === undefined || at === undefined)
      return;
    const controller = new AbortController();
    void readIntentCiScopeHistory(
      source,
      path,
      { revision, at },
      controller.signal,
    ).then(
      (shown) => {
        if (!controller.signal.aborted) setReading({ key, shown });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setReading((prior) => ({
            key,
            ...(prior.key === key && prior.shown !== undefined
              ? { shown: prior.shown }
              : {}),
            failed:
              error instanceof Error && error.message !== ""
                ? error.message
                : "The collected test execution time history could not be read.",
          }));
      },
    );
    return () => {
      controller.abort();
    };
  }, [source, path, revision, at, key, round]);

  return {
    ...(reading.key === key ? reading : {}),
    retry: () => {
      setRound((value) => value + 1);
    },
  };
}
