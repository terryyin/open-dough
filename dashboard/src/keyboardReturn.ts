// The side panel's one keyboard return (`./pageSidePanel.ts`): once the page
// has answered an operation, the keyboard goes back to the control that
// asked while the page still shows it, else to its home, such as the
// session's entry wherever it now lives. A return to a session's entry first
// asks the page's Recently done range for it (`./recentlyDoneRange.ts`), so a
// saved Done session beyond the shown entries takes the keyboard once the
// entries through it are read; a newer destination, or the developer's own
// move meanwhile, keeps the keyboard where it is. A return is given once,
// and only while the panel shows what it showed when asked.
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import type { RecentlyDoneRange } from "./recentlyDoneRange.ts";

export type KeyboardReturn<Shown> = {
  readonly control: HTMLElement;
  readonly shows: Shown | undefined;
  readonly home?: () => HTMLElement | null;
  // The session whose entry is the home, which the range is asked for.
  readonly session?: LaunchRecord;
};

type Asked<Shown> = KeyboardReturn<Shown> & { readonly demand?: number };

export function useKeyboardReturn<Shown>(
  shown: RefObject<{ readonly request: Shown } | undefined>,
  range: RecentlyDoneRange,
): (next: KeyboardReturn<Shown>) => void {
  const [returning, setReturning] = useState<Asked<Shown> | undefined>();
  const returned = useRef<Asked<Shown> | undefined>(undefined);
  useLayoutEffect(() => {
    if (
      returning === undefined ||
      returned.current === returning ||
      shown.current?.request !== returning.shows
    )
      return undefined;
    const give = (element: HTMLElement | null | undefined) => {
      returned.current = returning;
      element?.focus();
    };
    // A control the page no longer shows, as in a hidden sidebar, cannot
    // take the keyboard.
    if (returning.control.getClientRects().length > 0) {
      give(returning.control);
      return undefined;
    }
    const { session, demand } = returning;
    if (session !== undefined && demand === undefined) {
      setReturning({ ...returning, demand: range.demand(session) });
      return undefined;
    }
    const answer = demand === undefined ? "reached" : range.answerOf(demand);
    if (answer === "pending" && demand !== undefined) {
      return range.givenUpOnOwnMove(demand, () => {
        setReturning(undefined);
      });
    }
    give(answer === "superseded" ? undefined : returning.home?.());
    return undefined;
  }, [returning, range.destination]);
  return setReturning;
}
