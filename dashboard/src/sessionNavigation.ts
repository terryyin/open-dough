// Reveal the chosen session's actual entry or containing active card once its
// project's stories are shown, keeping it visible until the developer moves.
import { useLayoutEffect, useRef, useState } from "react";
import { launchSubject, type LaunchRecord } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { sessionEntry } from "./pageSessions.ts";
import type { RecentlyDoneRange } from "./recentlyDoneRange.ts";
import { keepInView, workCard } from "./workFocus.ts";

type Going = { readonly to: LaunchRecord; readonly demand?: number };

export function useSessionNavigation(
  selected: string,
  shownSource: string | undefined,
  range: RecentlyDoneRange,
) {
  // Going to a session: its project's stories, its terminal where it opens
  // one, and, once that project's membership is known, its actual session
  // entry brought into view. An active story card holds its open sessions;
  // standalone entries and closed sessions are revealed in their current home,
  // which for a saved Done session beyond Recently done's shown entries the
  // page's range first extends through (`./recentlyDoneRange.ts`). Each going
  // is its own, so going again to the same session reveals again.
  const [going, setGoing] = useState<Going>();
  const revealed = useRef<Going | undefined>(undefined);
  useLayoutEffect(() => {
    if (going === undefined || revealed.current === going) {
      return;
    }
    // A going still waiting for its project's stories is dropped once the
    // developer chooses another project's; its terminal stays.
    if (selected !== going.to.request.source) {
      setGoing(undefined);
      return;
    }
    if (shownSource !== going.to.request.source) {
      return;
    }
    if (going.demand === undefined) {
      setGoing({ ...going, demand: range.demand(going.to) });
      return;
    }
    const answer = range.answerOf(going.demand);
    // A newer journey's destination, or the developer's own move while the
    // entries before it are read, takes over.
    if (answer === "superseded") {
      setGoing(undefined);
      return;
    }
    if (answer === "pending") {
      const { demand } = going;
      return range.givenUpOnOwnMove(demand, () => {
        setGoing(undefined);
      });
    }
    const { identity } = launchSubject(going.to.request);
    const entry = sessionEntry(sessionKey(going.to.session));
    const shown =
      entry?.closest<HTMLElement>("[data-work]") ??
      entry ??
      (identity === undefined ? undefined : workCard(identity)) ??
      null;
    // Nothing to reveal yet leaves the going to a later rendering.
    if (shown === null) return;
    revealed.current = going;
    // Kept in view until the developer moves, goes elsewhere, or another
    // project's stories are shown.
    return keepInView(shown);
  }, [going, selected, shownSource, range.destination]);
  return (record: LaunchRecord) => {
    setGoing({ to: record });
  };
}
