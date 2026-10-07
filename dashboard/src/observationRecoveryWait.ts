// Page-local recovery wait for the published observation: hide releases only
// this page's outstanding recovery ask without ending a shared upstream read.
// Due time and backoff step stay in `./transientRecovery.ts`; the schedule that
// asks again is `./limitRecovery.ts`.

import { useEffect, useRef } from "react";
import type { Visibility } from "./pageVisibility.ts";

export function useObservationRecoveryWait({
  visibility,
  onReleased,
}: {
  readonly visibility: Visibility;
  // Restore the attempt and settle the observation after hide aborts the ask.
  readonly onReleased: () => void;
}): {
  // Bind the AbortController for the current read effect; returns its cleanup.
  readonly bindRead: (reading: AbortController) => () => void;
  // Whether the current ask is a recovery ask hide may release alone.
  readonly setRecoveryAsk: (active: boolean) => void;
} {
  const outstandingRead = useRef<AbortController | undefined>(undefined);
  const recoveryAsk = useRef(false);

  useEffect(() => {
    if (visibility !== "hidden" || !recoveryAsk.current) {
      return;
    }
    outstandingRead.current?.abort();
    recoveryAsk.current = false;
    onReleased();
  }, [visibility, onReleased]);

  return {
    bindRead(reading) {
      outstandingRead.current = reading;
      return () => {
        reading.abort();
        if (outstandingRead.current === reading) {
          outstandingRead.current = undefined;
        }
      };
    },
    setRecoveryAsk(active) {
      recoveryAsk.current = active;
    },
  };
}
