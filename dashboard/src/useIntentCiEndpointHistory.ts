// One local read lifecycle for a selected Done endpoint and optional scope.
// A failure retains that selection's last answer; a new selection hides it.
import { useEffect, useState } from "react";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { PublishedSource } from "./publishedSource.ts";

export function useIntentCiEndpointHistory<History>({
  source,
  endpoint,
  scope = "",
  checkedAgain,
  read,
  unreadReason,
}: {
  readonly source: PublishedSource | undefined;
  readonly endpoint: ScopeHistoryEndpoint | undefined;
  readonly scope?: string;
  readonly checkedAgain?: number | undefined;
  readonly read: (
    source: PublishedSource,
    endpoint: ScopeHistoryEndpoint,
    signal: AbortSignal,
  ) => Promise<History>;
  readonly unreadReason: string;
}) {
  const revision = endpoint?.revision;
  const at = endpoint?.at;
  const key = `${source?.id ?? ""}#${scope}#${revision ?? ""}#${at ?? ""}`;
  const [round, setRound] = useState(0);
  const [reading, setReading] = useState<{
    readonly key: string;
    readonly shown?: History;
    readonly failed?: string;
  }>({ key });

  useEffect(() => {
    if (source === undefined || revision === undefined || at === undefined)
      return;
    const controller = new AbortController();
    void read(source, { revision, at }, controller.signal).then(
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
                : unreadReason,
          }));
      },
    );
    return () => {
      controller.abort();
    };
  }, [source, revision, at, key, read, unreadReason, round, checkedAgain]);

  return {
    ...(reading.key === key ? reading : {}),
    retry: () => {
      setRound((value) => value + 1);
    },
  };
}
