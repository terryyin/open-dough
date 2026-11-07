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

import { useEffect, useState } from "react";
import { readIntentCiComparison } from "./authenticatedIntentCiComparisonRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

export type ComparisonReading = {
  readonly shown: StoryCiComparisonAnswer | undefined;
  readonly reading: boolean;
  readonly failed: string | undefined;
  // Reads the comparison again; ignored while a read is in progress.
  readonly checkAgain: () => void;
  // Check again reads answered for this identity.
  readonly checkedAgain: number;
};

const unreadReason = "The CI comparison could not be read";

export function useIntentCiComparison(
  source: PublishedSource,
  identity: string | undefined,
  // Observed tip for a Taken comparison; undefined for done stories.
  head?: string,
): ComparisonReading {
  const key = identity === undefined ? undefined : `${source.id}#${identity}`;
  const [shown, setShown] = useState<StoryCiComparisonAnswer | undefined>(
    undefined,
  );
  const [reading, setReading] = useState(true);
  const [failed, setFailed] = useState<string | undefined>(undefined);
  const [readFor, setReadFor] = useState(key);
  // First observed tip only records it (the read already resolves the live
  // tip on the server); a later tip re-reads the provisional answer.
  const [followed, setFollowed] = useState(head);
  const [check, setCheck] = useState(0);
  const [askedAgain, setAskedAgain] = useState(0);
  const [checkedAgain, setCheckedAgain] = useState(0);
  if (readFor !== key) {
    setReadFor(key);
    setShown(undefined);
    setReading(true);
    setFailed(undefined);
    setFollowed(head);
    setCheck(0);
    setAskedAgain(0);
    setCheckedAgain(0);
  } else if (followed !== head) {
    if (followed !== undefined && head !== undefined) setCheck((n) => n + 1);
    setFollowed(head);
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
        setCheckedAgain(askedAgain);
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
  }, [source, identity, check, askedAgain]);

  const current = readFor === key;
  return {
    shown: current ? shown : undefined,
    reading: current ? reading : true,
    failed: current ? failed : undefined,
    checkAgain: () => {
      if (current && !reading) setAskedAgain((n) => n + 1);
    },
    checkedAgain: current ? checkedAgain : 0,
  };
}
