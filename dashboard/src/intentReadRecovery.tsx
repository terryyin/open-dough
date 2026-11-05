// Intent's contribution to the page's existing read recovery schedule. A
// failed reader stays unanswered during its reread, and one reader answering
// cannot clear another's wait. The page supplies visibility and the standing
// limit, so Intent starts no timer of its own.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Visibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { ReadProblem } from "./readProblem.ts";
import { standingLimit } from "./readingLimit.ts";
import {
  clearTransientFailure,
  noteTransientFailure,
  transientRecoveryIsDue,
  useTransientRecoveryDue,
} from "./transientRecovery.ts";

type Recovery = "limited" | "transient" | undefined;

export function intentRecoveryOf(problem: ReadProblem | undefined): Recovery {
  return problem?.limited === undefined ? problem?.recovery : "limited";
}

const intentRecovery = createContext<{
  readonly transientDue: boolean;
  readonly limitedDue: boolean;
  readonly record: (reader: symbol, recovery: Recovery) => void;
} | null>(null);

export function IntentReadRecovery({
  visibility,
  limitStands,
  children,
}: {
  readonly visibility: Visibility;
  readonly limitStands: boolean;
  readonly children: ReactNode;
}) {
  const unanswered = useRef(new Set<symbol>());
  const transientDue = useTransientRecoveryDue(
    "intent",
    visibility,
    limitStands,
  );
  const limitedDue = visibility !== "hidden" && !limitStands;
  const record = useCallback((reader: symbol, recovery: Recovery) => {
    if (recovery !== undefined) {
      unanswered.current.add(reader);
      if (recovery === "transient") noteTransientFailure("intent");
    } else if (
      unanswered.current.delete(reader) &&
      unanswered.current.size === 0
    ) {
      clearTransientFailure("intent");
    }
  }, []);
  return (
    <intentRecovery.Provider value={{ transientDue, limitedDue, record }}>
      {children}
    </intentRecovery.Provider>
  );
}

// Owns the Retry request for one reader at its current source and revision.
// A Retry consumes the settled failure that triggered it but keeps the
// shared wait until the reader reports an answer or leaves.
export function useIntentReadRecovery(
  source: PublishedSource,
  revision: string | undefined,
) {
  const recovery = useContext(intentRecovery);
  if (recovery === null) throw new Error("Intent read recovery is missing.");
  const { transientDue, limitedDue, record } = recovery;
  const reader = useMemo(() => Symbol(), [source, revision]);
  const active = useRef<symbol | undefined>(reader);
  const failure = useRef<Recovery>(undefined);
  const [retry, setRetry] = useState(0);

  useLayoutEffect(() => {
    active.current = reader;
    return () => {
      active.current = undefined;
      failure.current = undefined;
      record(reader, undefined);
    };
  }, [reader, record]);

  const recordSettled = useCallback(
    (outcome: Recovery) => {
      if (active.current !== reader) return;
      failure.current = outcome;
      record(reader, outcome);
    },
    [reader, record],
  );

  const retryRead = useCallback(() => {
    failure.current = undefined;
    setRetry((n) => n + 1);
  }, []);

  useEffect(() => {
    // Another settlement can change the shared wait before this effect runs.
    const due =
      (failure.current === "transient" &&
        transientDue &&
        transientRecoveryIsDue("intent")) ||
      (failure.current === "limited" && limitedDue);
    if (
      due &&
      document.visibilityState !== "hidden" &&
      standingLimit() === undefined
    ) {
      retryRead();
    }
  });

  return { retry, retryRead, recordSettled };
}
