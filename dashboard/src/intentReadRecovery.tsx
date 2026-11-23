// Intent's contribution to the page's existing read recovery schedule. A
// failed reader stays unanswered during its reread, and one reader answering
// cannot clear another's wait. The page supplies visibility and the standing
// limit, so Intent starts no timer of its own when the page already owns the
// schedule. Mounted outside that page, Intent creates its own schedule.

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
import { usePageVisibility, type Visibility } from "./pageVisibility.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { ReadProblem } from "./readProblem.ts";
import { noteLimitUntil, standingLimit } from "./readingLimit.ts";
import {
  TransientRecoveryOnPage,
  useOptionalTransientRecoverySchedule,
  useTransientRecoveryDue,
  useTransientRecoverySchedule,
} from "./transientRecovery.ts";

type Recovery = "limited" | "transient" | undefined;

// Notes an Intent reader's failed read and answers how it recovers: a limited
// answer also holds the page's standing limit until it resumes, which Intent's
// limited reread waits on.
export function noteFailedIntentRead(
  problem: ReadProblem | undefined,
): Recovery {
  if (problem?.limited === undefined) return problem?.recovery;
  noteLimitUntil(problem.limited.resumesAt);
  return "limited";
}

const intentRecovery = createContext<{
  readonly transientDue: boolean;
  readonly limitedDue: boolean;
  readonly record: (reader: symbol, recovery: Recovery) => void;
} | null>(null);

function IntentReadRecoveryBody({
  visibility,
  limitStands,
  children,
}: {
  readonly visibility: Visibility;
  readonly limitStands: boolean;
  readonly children: ReactNode;
}) {
  const schedule = useTransientRecoverySchedule();
  const unanswered = useRef(new Set<symbol>());
  const transientDue = useTransientRecoveryDue(
    "intent",
    visibility,
    limitStands,
  );
  const limitedDue = visibility !== "hidden" && !limitStands;
  const record = useCallback(
    (reader: symbol, recovery: Recovery) => {
      if (recovery !== undefined) {
        unanswered.current.add(reader);
        if (recovery === "transient") schedule.noteFailure("intent");
      } else if (
        unanswered.current.delete(reader) &&
        unanswered.current.size === 0
      ) {
        schedule.clearFailure("intent");
      }
    },
    [schedule],
  );
  return (
    <intentRecovery.Provider value={{ transientDue, limitedDue, record }}>
      {children}
    </intentRecovery.Provider>
  );
}

export function IntentReadRecovery({
  visibility,
  limitStands,
  children,
}: {
  readonly visibility: Visibility;
  readonly limitStands: boolean;
  readonly children: ReactNode;
}) {
  const existing = useOptionalTransientRecoverySchedule();
  if (existing === null) {
    return (
      <TransientRecoveryOnPage>
        <IntentReadRecoveryBody
          visibility={visibility}
          limitStands={limitStands}
        >
          {children}
        </IntentReadRecoveryBody>
      </TransientRecoveryOnPage>
    );
  }
  return (
    <IntentReadRecoveryBody visibility={visibility} limitStands={limitStands}>
      {children}
    </IntentReadRecoveryBody>
  );
}

// A reader mounted outside the page's recovery schedule recovers on the
// document's own visibility and the standing limit, with its own schedule.
export function IntentReadRecoveryOfItsOwn({
  children,
}: {
  readonly children: ReactNode;
}) {
  const recovery = useContext(intentRecovery);
  const { visibility } = usePageVisibility();
  if (recovery !== null) return children;
  return (
    <IntentReadRecovery
      visibility={visibility}
      limitStands={standingLimit() !== undefined}
    >
      {children}
    </IntentReadRecovery>
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
  const schedule = useTransientRecoverySchedule();
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
        schedule.isDue("intent")) ||
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
