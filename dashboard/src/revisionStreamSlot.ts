// Whether this page may hold a revision-stream delivery slot. The route's
// navigation protocol (`performance` navigation timing `nextHopProtocol`)
// decides the browser-wide cap: `h2` and `h3` are uncapped; anything else is
// two holders through Web Locks. A page that holds no slot keeps the
// recurring check (`./revisionCheckSchedule.ts`). Hiding or closing releases
// a held slot so a queued page can take over.

import { useEffect, useState } from "react";

export type RevisionDelivery = "check" | "stream";

// How many stream holders one browser may keep for `nextHopProtocol`.
export function revisionStreamSlotCap(nextHopProtocol: string): number {
  return nextHopProtocol === "h2" || nextHopProtocol === "h3"
    ? Number.POSITIVE_INFINITY
    : 2;
}

export function navigationNextHopProtocol(): string {
  const [entry] = performance.getEntriesByType("navigation") as
    PerformanceNavigationTiming[] | [];
  return entry?.nextHopProtocol ?? "";
}

export function revisionStreamSlotLockName(index: number): string {
  return `open-dough-revision-stream-slot-${index}`;
}

// Lock names for the capped (non-multiplexing) budget of two.
export function revisionStreamSlotLockNames(
  cap = revisionStreamSlotCap("http/1.1"),
): readonly string[] {
  const count = Number.isFinite(cap) ? cap : 0;
  const names: string[] = [];
  for (let index = 0; index < count; index += 1) {
    names.push(revisionStreamSlotLockName(index));
  }
  return names;
}

// Observation chooses delivery from whether it holds a slot. Stream delivery
// is not wired yet, so every page — holder or not — keeps the check.
export function revisionDeliveryForSlot(holdsSlot: boolean): RevisionDelivery {
  if (holdsSlot) {
    return "check";
  }
  return "check";
}

function waitUntilAborted(signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    signal.addEventListener(
      "abort",
      () => {
        resolve();
      },
      { once: true },
    );
  });
}

// True while this visible page holds a stream slot (or the route is uncapped).
export function useRevisionStreamSlot(wantSlot: boolean): boolean {
  const [held, setHeld] = useState(() => {
    if (typeof performance === "undefined") {
      return false;
    }
    return !Number.isFinite(revisionStreamSlotCap(navigationNextHopProtocol()));
  });
  useEffect(() => {
    if (!wantSlot) {
      setHeld(false);
      return;
    }
    const cap = revisionStreamSlotCap(navigationNextHopProtocol());
    if (!Number.isFinite(cap)) {
      setHeld(true);
      return;
    }
    const locks = navigator.locks;
    const release = new AbortController();
    let settled = false;
    const hold = async () => {
      for (let index = 0; index < cap; index += 1) {
        if (release.signal.aborted) {
          return;
        }
        const acquired = { value: false };
        await locks.request(
          revisionStreamSlotLockName(index),
          { ifAvailable: true, signal: release.signal },
          async (lock) => {
            if (lock === null) {
              return;
            }
            acquired.value = true;
            settled = true;
            setHeld(true);
            await waitUntilAborted(release.signal);
          },
        );
        if (acquired.value) {
          return;
        }
      }
      if (!settled) {
        setHeld(false);
      }
      const attempts = Array.from({ length: cap }, () => new AbortController());
      for (const [index, attempt] of attempts.entries()) {
        void locks
          .request(
            revisionStreamSlotLockName(index),
            {
              signal: AbortSignal.any([release.signal, attempt.signal]),
            },
            async () => {
              for (const [other, peer] of attempts.entries()) {
                if (other !== index) {
                  peer.abort();
                }
              }
              settled = true;
              setHeld(true);
              await waitUntilAborted(release.signal);
            },
          )
          .catch(() => {
            // Queued request cancelled by a sibling win or page cleanup.
          });
      }
      await waitUntilAborted(release.signal);
    };
    void hold().catch(() => {
      // Request aborted on cleanup.
    });
    return () => {
      release.abort();
      setHeld(false);
    };
  }, [wantSlot]);
  return held;
}

// The observation's delivery choice for the current visibility.
export function useRevisionDelivery(wantSlot: boolean): RevisionDelivery {
  return revisionDeliveryForSlot(useRevisionStreamSlot(wantSlot));
}
