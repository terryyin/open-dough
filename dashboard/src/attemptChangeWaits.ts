// Following the launch attempts the server runs now (`./launchAttempts.ts`):
// each is waited for (`awaitAttemptChange`), again after each read while it
// still runs, and its change -- publication noted, worker noted or outcome
// settled -- or the end of a bounded wait asks for a read of it. Each wait
// names the changes its observation counted, so one told between that read
// and this wait asks for a read too.

import { useEffect, useRef } from "react";
import {
  agentChangedEndpoint,
  changedAnswerSchema,
  type AttemptObservation,
} from "./agentLaunch.ts";

// A running attempt as last observed: which, and the changes counted then.
type Observed = Pick<AttemptObservation, "id" | "changes">;

// Waits for an accepted attempt to change after its observation, which
// answers at once if it already has: whether it changed, or undefined when no
// trustworthy answer came.
async function awaitAttemptChange(
  { id, changes }: Observed,
  signal: AbortSignal,
): Promise<boolean | undefined> {
  try {
    const response = await fetch(
      `${agentChangedEndpoint}?${new URLSearchParams({
        attempt: id,
        ...(changes === undefined ? {} : { seen: String(changes) }),
      }).toString()}`,
      { signal },
    );
    if (!response.ok) return undefined;
    const answer = changedAnswerSchema.safeParse(await response.json());
    return answer.success ? answer.data.changed : undefined;
  } catch {
    return undefined;
  }
}

// `running` holds the attempts the server runs now, as last observed;
// `reads` counts the reads answered so far; `reread` asks for a prompt read.
export function useAttemptChangeWaits(
  running: readonly Observed[],
  reads: number,
  reread: () => void,
): void {
  // The same text while what is observed stays the same, whatever array
  // holds it.
  const runningKey = JSON.stringify(
    running.map(({ id, changes }): Observed => ({ id, changes })),
  );
  const waiting = useRef(new Set<string>());
  const unmounted = useRef(new AbortController());
  useEffect(() => {
    const ended = new AbortController();
    unmounted.current = ended;
    return () => {
      ended.abort();
    };
  }, []);
  useEffect(() => {
    const ended = unmounted.current.signal;
    for (const observed of JSON.parse(runningKey) as readonly Observed[]) {
      const { id } = observed;
      if (waiting.current.has(id)) continue;
      waiting.current.add(id);
      void awaitAttemptChange(observed, ended).then((answer) => {
        waiting.current.delete(id);
        // Without an answer, the next read at its own pace waits again.
        if (answer !== undefined && !ended.aborted) reread();
      });
    }
  }, [runningKey, reads, reread]);
}
