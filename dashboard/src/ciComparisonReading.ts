// Disposable reading state for one selected story. The authenticated reader
// and server still own response validation, comparison rules and final memory.
import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

export type ComparisonReadState = {
  readonly key: string | undefined;
  readonly shown: StoryCiComparisonAnswer | undefined;
  readonly reading: boolean;
  readonly failed: string | undefined;
  readonly checkedAgain: number;
};

export const comparisonReadingKey = (
  source: PublishedSource,
  identity: string | undefined,
) => (identity === undefined ? undefined : `${source.id}#${identity}`);

export function createCiComparisonReading() {
  let selected:
    | {
        source: PublishedSource;
        identity: string | undefined;
        head: string | undefined;
      }
    | undefined;
  let state: ComparisonReadState = {
    key: undefined,
    shown: undefined,
    reading: true,
    failed: undefined,
    checkedAgain: 0,
  };
  let askedAgain = 0;
  let controller: AbortController | undefined;
  let active = false;
  const listeners = new Set<() => void>();
  const publish = (next: ComparisonReadState) => {
    state = next;
    for (const listener of listeners) listener();
  };
  const read = () => {
    controller?.abort();
    const current = selected;
    if (current?.identity === undefined) return;
    const request = new AbortController();
    controller = request;
    const round = askedAgain;
    publish({ ...state, reading: true, failed: undefined });
    return readIntentCiComparison(
      current.source,
      current.identity,
      request.signal,
    )
      .then((shown) => {
        if (request.signal.aborted) return;
        publish({ ...state, shown, checkedAgain: round, reading: false });
      })
      .catch((error: unknown) => {
        if (request.signal.aborted) return;
        publish({
          ...state,
          shown: undefined,
          reading: false,
          failed:
            error instanceof Error && error.message !== ""
              ? error.message
              : "The CI comparison could not be read",
        });
      });
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    select(
      source: PublishedSource,
      identity: string | undefined,
      head?: string,
    ) {
      const key = comparisonReadingKey(source, identity);
      const changed = state.key !== key;
      const reread =
        !active ||
        selected?.source !== source ||
        selected.identity !== identity ||
        (selected.head !== undefined &&
          head !== undefined &&
          selected.head !== head);
      selected = { source, identity, head };
      active = true;
      if (changed) {
        askedAgain = 0;
        publish({
          key,
          shown: undefined,
          reading: true,
          failed: undefined,
          checkedAgain: 0,
        });
      }
      if (changed || reread) return read();
      return undefined;
    },
    checkAgain() {
      if (!active || state.reading) return;
      askedAgain += 1;
      return read();
    },
    dispose() {
      active = false;
      controller?.abort();
    },
  };
}
