// One local read lifecycle for an observed trunk or Done endpoint and scope.
// A failure retains that selection's last answer; a new selection hides it.
import { useEffect, useState } from "react";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import { intentCiHistorySourceKey } from "./intentCiHistorySourceKey.ts";
import type { PublishedSource } from "./publishedSource.ts";

// A scope owner can keep its last answered reading in its existing page state.
// Callers that omit it retain the original mount-local history behavior.
export type EndpointHistoryAnswer<History> = {
  readonly key: string;
  readonly shown: History;
  readonly answeredAt: string;
};

export function useIntentCiEndpointHistory<History>({
  source,
  endpoint,
  scope = "",
  checkedAgain,
  read,
  unreadReason,
  kept,
  onAnswer,
}: {
  readonly source: PublishedSource | undefined;
  readonly endpoint: ScopeHistoryEndpoint | undefined;
  readonly scope?: string;
  readonly checkedAgain?: number | string | undefined;
  readonly read: (
    source: PublishedSource,
    endpoint: ScopeHistoryEndpoint,
    signal: AbortSignal,
  ) => Promise<History>;
  readonly unreadReason: string;
  readonly kept?: EndpointHistoryAnswer<History> | undefined;
  readonly onAnswer?: (answer: EndpointHistoryAnswer<History>) => void;
}) {
  const revision = endpoint?.revision;
  const at = endpoint?.at;
  const key = `${intentCiHistorySourceKey(source)}#${scope}#${revision ?? ""}#${at ?? ""}`;
  const [round, setRound] = useState(0);
  const [answeredHere, setAnsweredHere] = useState(false);
  const [reading, setReading] = useState<{
    readonly key: string;
    readonly shown?: History;
    readonly failed?: string | undefined;
    readonly answeredAt?: string;
    readonly reading: boolean;
  }>(() => ({ ...(kept ?? { key }), reading: false }));

  useEffect(() => {
    if (source === undefined || revision === undefined || at === undefined)
      return;
    const controller = new AbortController();
    setReading((prior) => ({
      ...(prior.key === key ? prior : {}),
      key,
      reading: true,
      failed: undefined,
    }));
    void read(source, { revision, at }, controller.signal).then(
      (shown) => {
        if (!controller.signal.aborted) {
          const answer = { key, shown, answeredAt: new Date().toISOString() };
          setReading({ ...answer, reading: false });
          setAnsweredHere(true);
          onAnswer?.(answer);
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setReading((prior) => ({
            key,
            ...(prior.key === key && prior.shown !== undefined
              ? {
                  shown: prior.shown,
                  ...(prior.answeredAt === undefined
                    ? {}
                    : { answeredAt: prior.answeredAt }),
                }
              : {}),
            reading: false,
            failed:
              error instanceof Error && error.message !== ""
                ? error.message
                : unreadReason,
          }));
      },
    );
    return () => {
      controller.abort();
    };
  }, [
    source,
    revision,
    at,
    key,
    read,
    unreadReason,
    round,
    checkedAgain,
    onAnswer,
  ]);

  return {
    ...(reading.key === key ? reading : {}),
    previouslyRetrieved:
      reading.key === key &&
      reading.shown !== undefined &&
      (!answeredHere || reading.reading || reading.failed !== undefined),
    retry: () => {
      setRound((value) => value + 1);
    },
  };
}
