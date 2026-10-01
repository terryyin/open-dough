// Following the launch attempts the server runs now (`./launchAttempts.ts`):
// each is waited for (`awaitAttemptChange`), again after each read while it
// still runs, and its change -- publication noted or outcome settled -- or the
// end of a bounded wait asks for a read of it.

import { useEffect, useRef } from "react";
import { awaitAttemptChange } from "./agentLaunchClient.ts";

// `running` names the attempts the server runs now; `reads` counts the reads
// answered so far; `reread` asks for a prompt read.
export function useAttemptChangeWaits(
  running: readonly string[],
  reads: number,
  reread: () => void,
): void {
  const runningKey = running.join(" ");
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
    for (const id of runningKey === "" ? [] : runningKey.split(" ")) {
      if (waiting.current.has(id)) continue;
      waiting.current.add(id);
      void awaitAttemptChange(id, ended).then((answer) => {
        waiting.current.delete(id);
        // Without an answer, the next read at its own pace waits again.
        if (answer !== undefined && !ended.aborted) reread();
      });
    }
  }, [runningKey, reads, reread]);
}
