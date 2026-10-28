// Progressive range for the Sessions sidebar's Recently done section. Separate
// from Board Recently done (`./recentlyDoneRange.ts`): that module owns
// project-specific published stories, ten-entry explicit loading and
// asynchronous story detail reads. Here the page already holds every retained
// Done machine record; scrolling this list alone reveals another batch of up
// to 20 while remembering the oldest reached identity so a refresh that admits
// a newer completion does not evict older entries already shown. Collapse,
// sidebar hide and project changes keep the range for the page; reload starts
// again at the initial 20.
import { useCallback, useState } from "react";
import {
  recentlyDoneSessionsInitialLimit,
  type LaunchWithState,
} from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";

export const recentlyDoneSessionsBatch = recentlyDoneSessionsInitialLimit;

export type RecentlyDoneSessionsRange = {
  readonly requested: number;
  readonly oldestReachedKey: string | undefined;
};

export const initialRecentlyDoneSessionsRange =
  (): RecentlyDoneSessionsRange => ({
    requested: recentlyDoneSessionsInitialLimit,
    oldestReachedKey: undefined,
  });

// How many of the completion-ordered Done sessions to show for this range.
export function recentlyDoneSessionsShownCount(
  ordered: readonly LaunchWithState[],
  range: RecentlyDoneSessionsRange,
): number {
  let count = Math.min(range.requested, ordered.length);
  if (range.oldestReachedKey !== undefined) {
    const at = ordered.findIndex(
      (record) => sessionKey(record.session) === range.oldestReachedKey,
    );
    if (at >= 0) count = Math.max(count, at + 1);
  }
  return count;
}

// Extends the range by one batch when the developer reaches the list end.
// End of history leaves the range unchanged. Returns whether it grew.
export function extendRecentlyDoneSessionsRange(
  ordered: readonly LaunchWithState[],
  range: RecentlyDoneSessionsRange,
): { readonly range: RecentlyDoneSessionsRange; readonly grew: boolean } {
  const shown = recentlyDoneSessionsShownCount(ordered, range);
  if (shown >= ordered.length) return { range, grew: false };
  const requested = Math.min(shown + recentlyDoneSessionsBatch, ordered.length);
  const oldest = ordered[requested - 1];
  return {
    grew: true,
    range: {
      requested,
      oldestReachedKey:
        oldest === undefined
          ? range.oldestReachedKey
          : sessionKey(oldest.session),
    },
  };
}

export function useRecentlyDoneSessionsRange() {
  const [range, setRange] = useState(initialRecentlyDoneSessionsRange);
  const revealOlder = useCallback((ordered: readonly LaunchWithState[]) => {
    setRange((current) => {
      const next = extendRecentlyDoneSessionsRange(ordered, current);
      return next.grew ? next.range : current;
    });
  }, []);
  return { range, revealOlder };
}
