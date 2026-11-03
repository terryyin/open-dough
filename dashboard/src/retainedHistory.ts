// The page's one owner of the machine's sessions history
// (`./machineSessionsReads.ts`): the full entries of retained done sessions,
// whose listing facts alone the overview carries (`./doneSessionListing.ts`).
// Nothing reads it until a developer opens or acts on a retained session or
// expands Recently done sessions; each such opening reads it once, and only
// when the overview names a history revision the page does not hold. Until a
// read answers, or when it fails, every retained session shows its listing
// facts as before, and the next opening asks again.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { withRetainedDetail } from "./doneSessionListing.ts";
import type { LaunchWithState } from "./launchRecord.ts";
import { readSessionsHistorySince } from "./machineSessionsReads.ts";
import { sessionKey } from "./sessionReference.ts";

type HeldHistory = {
  readonly revision: string;
  readonly entries: ReadonlyMap<string, LaunchWithState>;
};

export type RetainedHistory = {
  // The machine's sessions with each retained one's full entry once read.
  readonly records: readonly LaunchWithState[];
  // Asks for the history when the page does not hold its named revision.
  readonly readHistory: () => void;
};

// `known` are the overview's sessions, and `named` the history revision its
// latest full answer names, if any.
export function useRetainedHistory(
  known: readonly LaunchWithState[],
  named: string | undefined,
): RetainedHistory {
  const [held, setHeld] = useState<HeldHistory>();
  // What a read asked now goes by: the history held and the revision named.
  const heldNow = useRef<HeldHistory | undefined>(undefined);
  const namedNow = useRef(named);
  useEffect(() => {
    namedNow.current = named;
  }, [named]);
  const reading = useRef(false);
  const readHistory = useCallback(() => {
    const holding = heldNow.current;
    if (
      reading.current ||
      (holding !== undefined && holding.revision === namedNow.current)
    )
      return;
    reading.current = true;
    void readSessionsHistorySince(holding?.revision).then((answer) => {
      reading.current = false;
      if (answer === undefined) return;
      const now: HeldHistory | undefined =
        "unchanged" in answer
          ? holding && { ...holding, revision: answer.revision }
          : {
              revision: answer.revision,
              entries: new Map(
                answer.records.map((entry) => [
                  sessionKey(entry.session),
                  entry,
                ]),
              ),
            };
      heldNow.current = now;
      setHeld(now);
    });
  }, []);
  const records = useMemo(
    () =>
      held === undefined
        ? known
        : known.map((record) =>
            withRetainedDetail(
              record,
              held.entries.get(sessionKey(record.session)),
            ),
          ),
    [known, held],
  );
  return { records, readHistory };
}

// Asks the page's history read, wherever a retained session is opened or
// acted on; nothing outside a page.
export const RetainedHistoryOnPage = createContext<() => void>(() => {
  // Outside a page nothing holds the history.
});

export const useReadRetainedHistory = () => useContext(RetainedHistoryOnPage);
