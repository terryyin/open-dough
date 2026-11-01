// The page's reads of this machine's host status (`./hostStatus.ts`) while
// it watches: while `watching` and the page is visible, a read at once, then
// one per check interval (`./revisionCheckSchedule.ts`), the pace and
// visibility rule of the machine's sessions reads (`./agentLaunches.ts`). A
// hidden page, or one no longer watching, asks nothing; one seen again, or
// watching again, asks at once. Undefined until the first read answers.

import { useEffect, useRef, useState } from "react";
import { readHostStatus, type HostStatus } from "./hostStatus.ts";
import { usePageVisibility } from "./pageVisibility.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";

export function useHostStatus(watching: boolean): HostStatus | undefined {
  const [status, setStatus] = useState<HostStatus>();
  const [reads, setReads] = useState(0);
  const { visibility, settleRevealed } = usePageVisibility();
  // Whether a read has answered since watching last began.
  const answered = useRef(false);
  useEffect(() => {
    if (!watching) {
      answered.current = false;
      return;
    }
    if (visibility === "hidden") return;
    let current = true;
    const unwanted = new AbortController();
    const read = () => {
      void readHostStatus(unwanted.signal).then((answer) => {
        if (!current) return;
        answered.current = true;
        setStatus(answer);
        settleRevealed();
        setReads((settled) => settled + 1);
      });
    };
    const prompt = visibility === "revealed" || !answered.current;
    if (prompt) read();
    const waiting = prompt ? undefined : setTimeout(read, checkIntervalMs);
    return () => {
      current = false;
      clearTimeout(waiting);
      unwanted.abort();
    };
  }, [watching, visibility, reads, settleRevealed]);
  return status;
}
