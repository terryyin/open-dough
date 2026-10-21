// A System settings section's view of one machine-local setting: the last
// answered value, the problem to show, and whether a change is in flight.
// `read` runs on mount and on `retryRead`; a change supersedes any read still
// pending, so an older read never replaces what the change answered. `read`
// must be stable across renders.
import { useCallback, useEffect, useRef, useState } from "react";

export type LocalSetting<T> = {
  // Undefined until a read or change answers.
  readonly value: T | undefined;
  readonly problem: string | undefined;
  readonly reportProblem: (message: string) => void;
  readonly busy: boolean;
  readonly retryRead: () => void;
  // Shows the value `request` answers; a failure's message becomes `problem`.
  // Nothing runs while another change is in flight.
  readonly change: (request: () => Promise<T>) => Promise<void>;
};

function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useLocalSetting<T>(
  read: () => Promise<T>,
  readFailure: string,
  changeFailure: string,
): LocalSetting<T> {
  const [value, setValue] = useState<T>();
  const [problem, setProblem] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [reads, setReads] = useState(0);
  const readRevision = useRef(0);
  useEffect(() => {
    let current = true;
    const revision = ++readRevision.current;
    setProblem(undefined);
    void read().then(
      (answer) => {
        if (current && revision === readRevision.current) setValue(answer);
      },
      (error: unknown) => {
        if (current && revision === readRevision.current)
          setProblem(message(error, readFailure));
      },
    );
    return () => {
      current = false;
    };
  }, [read, readFailure, reads]);
  const retryRead = useCallback(() => {
    setReads((count) => count + 1);
  }, []);
  async function change(request: () => Promise<T>): Promise<void> {
    if (busy) return;
    // The change owns subsequent feedback; an older read is only a snapshot.
    readRevision.current += 1;
    setBusy(true);
    setProblem(undefined);
    try {
      setValue(await request());
    } catch (error) {
      setProblem(message(error, changeFailure));
    } finally {
      setBusy(false);
    }
  }
  return {
    value,
    problem,
    reportProblem: setProblem,
    busy,
    retryRead,
    change,
  };
}
