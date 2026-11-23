// Disposable reading state for one story or revision pair. The authenticated reader
// and server still own response validation, comparison rules and final memory.
import type {
  readIntentCiComparison,
  readSelectedIntentCiComparison,
} from "./authenticatedIntentCiComparisonRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  selectedCiComparisonKey,
  type CiComparisonRange,
} from "./selectedCiComparison.ts";

export type ComparisonReadState<Answer> = {
  readonly key: string | undefined;
  readonly shown: Answer | undefined;
  readonly reading: boolean;
  readonly failed: string | undefined;
  readonly checkedAgain: number;
};

export const comparisonReadingKey = (
  source: PublishedSource,
  identity: string | undefined,
) => (identity === undefined ? undefined : `${source.id}#${identity}`);

type StoryRequest = {
  readonly identity: string;
  readonly head?: string | undefined;
};
type SelectedRequest = StoryRequest & { readonly range: CiComparisonRange };

function createComparisonReading<Request extends StoryRequest, Answer>(
  readComparison: (
    source: PublishedSource,
    target: Request,
    signal: AbortSignal,
  ) => Promise<Answer>,
  keyOf: (source: PublishedSource, target: Request) => string | undefined,
) {
  let selected:
    | {
        source: PublishedSource;
        target: Request | undefined;
      }
    | undefined;
  let state: ComparisonReadState<Answer> = {
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
  const publish = (next: ComparisonReadState<Answer>) => {
    state = next;
    for (const listener of listeners) listener();
  };
  const read = () => {
    controller?.abort();
    const current = selected;
    if (current?.target === undefined) return;
    const request = new AbortController();
    controller = request;
    const round = askedAgain;
    publish({ ...state, reading: true, failed: undefined });
    return readComparison(current.source, current.target, request.signal)
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
    select(source: PublishedSource, target: Request | undefined) {
      const key = target === undefined ? undefined : keyOf(source, target);
      const changed = state.key !== key;
      const previous = selected?.target;
      const reread =
        !active ||
        selected?.source !== source ||
        previous?.identity !== target?.identity ||
        (previous?.head !== undefined &&
          target?.head !== undefined &&
          previous.head !== target.head);
      selected = { source, target };
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

export function createCiComparisonReading(
  readComparison: typeof readIntentCiComparison,
) {
  const owner = createComparisonReading(
    (source, target: StoryRequest, signal) =>
      readComparison(source, target.identity, signal),
    (source, target) => comparisonReadingKey(source, target.identity),
  );
  return {
    ...owner,
    select(
      source: PublishedSource,
      identity: string | undefined,
      head?: string,
    ) {
      return owner.select(
        source,
        identity === undefined ? undefined : { identity, head },
      );
    },
  };
}

export function createSelectedCiComparisonReading(
  readComparison: typeof readSelectedIntentCiComparison,
) {
  return createComparisonReading(
    (source, target: SelectedRequest, signal) =>
      readComparison(source, target.identity, target.range, signal),
    (source, target) =>
      selectedCiComparisonKey(source, target.identity, target.range),
  );
}
