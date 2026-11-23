// The page's project-local backoff for eligible transient failures. Each
// contributor tracks its own unanswered reads, sharing waits of 15, 30, 60,
// then 60 seconds after settlement. A standing GitHub wait takes precedence
// (`./readingLimit.ts`), and a hidden page waits until it is seen again.
// The backoff ends when every contributor has an answer or the project is left.
// One schedule instance is owned by the mounted page (or by Intent when it
// mounts outside that page); another mount keeps its own due time and step.

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Visibility } from "./pageVisibility.ts";

const waitAfterSettlementSeconds = [15, 30, 60] as const;

export type TransientRecoveryContributor = "published-observation" | "intent";

export type TransientRecoverySchedule = {
  readonly noteFailure: (contributor: TransientRecoveryContributor) => void;
  readonly clearFailure: (contributor: TransientRecoveryContributor) => void;
  readonly clearAll: () => void;
  readonly isPending: (contributor: TransientRecoveryContributor) => boolean;
  readonly isDue: (contributor: TransientRecoveryContributor) => boolean;
  readonly recoversUntil: () => number;
  readonly subscribe: (listener: () => void) => () => void;
  readonly wake: () => void;
};

export function createTransientRecoverySchedule(): TransientRecoverySchedule {
  let recoversUntil = 0;
  let failureCount = 0;
  const pending = new Set<TransientRecoveryContributor>();
  const listeners = new Set<() => void>();

  function changed(): void {
    for (const listener of listeners) listener();
  }

  return {
    noteFailure(contributor) {
      const alreadyPending = pending.has(contributor);
      pending.add(contributor);
      const now = Date.now();
      if (now >= recoversUntil) {
        const step = Math.min(
          failureCount,
          waitAfterSettlementSeconds.length - 1,
        );
        const waitSeconds = waitAfterSettlementSeconds[step] ?? 60;
        failureCount += 1;
        recoversUntil = now + waitSeconds * 1000;
      } else if (alreadyPending) {
        return;
      }
      changed();
    },
    clearFailure(contributor) {
      if (!pending.delete(contributor)) return;
      if (pending.size === 0) {
        failureCount = 0;
        recoversUntil = 0;
      }
      changed();
    },
    clearAll() {
      pending.clear();
      failureCount = 0;
      recoversUntil = 0;
      changed();
    },
    isPending(contributor) {
      return pending.has(contributor);
    },
    isDue(contributor) {
      return pending.has(contributor) && Date.now() >= recoversUntil;
    },
    recoversUntil() {
      return recoversUntil;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    wake: changed,
  };
}

const TransientRecoveryContext =
  createContext<TransientRecoverySchedule | null>(null);

// Mounted once for the production page (or by Intent when it recovers alone).
// The shared timer wakes all contributors on this schedule.
export function TransientRecoveryOnPage({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [schedule] = useState(createTransientRecoverySchedule);
  useStandingTransientTimer(schedule);
  return createElement(
    TransientRecoveryContext.Provider,
    { value: schedule },
    children,
  );
}

function useStandingTransientTimer(schedule: TransientRecoverySchedule): void {
  const until = useSyncExternalStore(
    schedule.subscribe,
    schedule.recoversUntil,
  );
  useEffect(() => {
    if (until === 0) return;
    const left = until - Date.now();
    if (left <= 0) {
      schedule.wake();
      return;
    }
    const ending = setTimeout(schedule.wake, left);
    return () => {
      clearTimeout(ending);
    };
  }, [schedule, until]);
}

export function useOptionalTransientRecoverySchedule(): TransientRecoverySchedule | null {
  return useContext(TransientRecoveryContext);
}

export function useTransientRecoverySchedule(): TransientRecoverySchedule {
  const schedule = useOptionalTransientRecoverySchedule();
  if (schedule === null) {
    throw new Error("Transient recovery schedule is missing.");
  }
  return schedule;
}

export function useTransientRecoveryPending(
  contributor: TransientRecoveryContributor,
): boolean {
  const schedule = useTransientRecoverySchedule();
  return useSyncExternalStore(schedule.subscribe, () =>
    schedule.isPending(contributor),
  );
}

// Keep the due time while pending, including after it passes. The page's
// TransientRecoveryOnPage owns the shared wake timer.
export function useStandingTransientRecovery(): Date | undefined {
  const schedule = useTransientRecoverySchedule();
  const until = useSyncExternalStore(
    schedule.subscribe,
    schedule.recoversUntil,
  );
  return until > 0 ? new Date(until) : undefined;
}

export function useTransientRecoveryDue(
  contributor: TransientRecoveryContributor,
  visibility: Visibility,
  limitStands: boolean,
): boolean {
  const schedule = useTransientRecoverySchedule();
  const due = useSyncExternalStore(schedule.subscribe, () =>
    schedule.isDue(contributor),
  );
  return due && visibility !== "hidden" && !limitStands;
}
