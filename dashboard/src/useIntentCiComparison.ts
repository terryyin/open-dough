// A selected story's CI comparison as Intent's CI evidence owner reads it
// (`./IntentCiEvidence.tsx`), through `./authenticatedIntentCiComparisonRead.ts`.
// A story is read when it becomes the active identity and again on Check
// again (`checkAgain`); a Taken story also re-reads when the observed tip
// (`head`) moves after the first observation, matching the judged-branch head
// trigger. Final done answers are remembered on the server, so Check again on
// one asks GitHub nothing; answers with anything unavailable are read afresh
// on the next read, and Taken answers are never remembered past a head change.
// `checkedAgain` counts the Check again reads answered, so the endpoint
// proofs the comparison shows are read again with each
// (`./useIntentCiComparisonEntries.ts`).

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  comparisonReadingKey,
  createCiComparisonReading,
  createSelectedCiComparisonReading,
  type ComparisonReadState,
} from "./ciComparisonReading.ts";
import { useIntentCiReads } from "./pageReads.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import {
  selectedCiComparisonKey,
  type CiComparisonRange,
  type SelectedCiComparisonAnswer,
} from "./selectedCiComparison.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

export type ComparisonReading<Answer = StoryCiComparisonAnswer> = {
  readonly shown: Answer | undefined;
  readonly reading: boolean;
  readonly failed: string | undefined;
  // Reads the comparison again; ignored while a read is in progress.
  readonly checkAgain: () => void;
  // Check again reads answered for this identity.
  readonly checkedAgain: number;
};

export function useIntentCiComparison(
  source: PublishedSource,
  identity: string | undefined,
  // Observed tip for a Taken comparison; undefined for done stories.
  head?: string,
): ComparisonReading {
  const { readComparison } = useIntentCiReads();
  const [owner] = useState(() => createCiComparisonReading(readComparison));
  const reading = useCurrentReading(
    owner,
    comparisonReadingKey(source, identity),
  );
  useEffect(() => {
    void owner.select(source, identity, head);
  }, [owner, source, identity, head]);
  return reading;
}

export function useSelectedIntentCiComparison(
  source: PublishedSource,
  identity: string | undefined,
  range: CiComparisonRange | undefined,
): ComparisonReading<SelectedCiComparisonAnswer> {
  const { readSelectedComparison } = useIntentCiReads();
  const [owner] = useState(() =>
    createSelectedCiComparisonReading(
      readSelectedComparison ??
        (() =>
          Promise.reject(
            new Error("The selected CI comparison could not be read"),
          )),
    ),
  );
  const key =
    identity === undefined || range === undefined
      ? undefined
      : selectedCiComparisonKey(source, identity, range);
  const reading = useCurrentReading(owner, key);
  const start = range?.start;
  const end = range?.end;
  useEffect(() => {
    const target =
      identity === undefined || start === undefined || end === undefined
        ? undefined
        : { identity, range: { start, end } };
    void owner.select(source, target);
  }, [owner, source, identity, start, end]);
  return reading;
}

function useCurrentReading<Answer>(
  owner: {
    readonly subscribe: (listener: () => void) => () => void;
    readonly getSnapshot: () => ComparisonReadState<Answer>;
    readonly dispose: () => void;
    readonly checkAgain: () => Promise<void> | undefined;
  },
  key: string | undefined,
): ComparisonReading<Answer> {
  const state = useSyncExternalStore(
    owner.subscribe,
    owner.getSnapshot,
    owner.getSnapshot,
  );
  useEffect(
    () => () => {
      owner.dispose();
    },
    [owner],
  );
  const current = state.key === key;
  return {
    shown: current ? state.shown : undefined,
    reading: current ? state.reading : true,
    failed: current ? state.failed : undefined,
    checkAgain: () => {
      if (current) void owner.checkAgain();
    },
    checkedAgain: current ? state.checkedAgain : 0,
  };
}
