// Reveal the chosen session's actual entry or containing active card once its
// project's stories are shown, keeping it visible until the developer moves.
// A Recently done sessions row selected in Development goes the same way to
// its selected session, or to its linked done story's card
// (`./recentlyDoneSelection.ts`), leaving the keyboard on the row. Moving
// around the Sessions sidebar, or closing it over the page, is not a move
// on the page, so the going holds through it.
import { useLayoutEffect, useRef, useState } from "react";
import { launchSubject, type LaunchRecord } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { sessionEntry, storyShown } from "./pageEntries.ts";
import type { RecentlyDoneRange } from "./recentlyDoneRange.ts";
import { onSessionsSidebar } from "./sessionsSidebarElements.ts";
import { keepInView, storyCard } from "./storyCardFocus.ts";

// Where a going lands: the session's entry, or, given `story`, that done
// story's card in the session's project.
type Going = {
  readonly to: LaunchRecord;
  readonly story?: string | undefined;
  readonly demand?: number;
};

// Goes to `record`'s session, or to its project's done `story`, replacing any
// earlier going; given nothing, gives up the going still under way.
export type GoToSession = (record?: LaunchRecord, story?: string) => void;

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
      setGoing({
        ...going,
        demand:
          going.story === undefined
            ? range.demand(going.to)
            : range.demandStory(going.to.request.source, going.story),
      });
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
      return range.givenUpOnOwnMove(
        demand,
        () => {
          setGoing(undefined);
        },
        onSessionsSidebar,
      );
    }
    const shown = landing(going);
    // Nothing to reveal yet leaves the going to a later rendering.
    if (shown === null) return;
    revealed.current = going;
    // Kept in view until the developer moves, goes elsewhere, or another
    // project's stories are shown.
    return keepInView(shown, onSessionsSidebar);
  }, [going, selected, shownSource, range.destination]);
  const goTo: GoToSession = (record, story) => {
    setGoing(record === undefined ? undefined : { to: record, story });
  };
  return goTo;
}

// What a going reveals, once shown: the done story's card, or the session's
// entry, its containing active card, or its story's card.
function landing(going: Going): HTMLElement | null {
  if (going.story !== undefined) return storyShown(going.story);
  const entry = sessionEntry(sessionKey(going.to.session));
  const { identity } = launchSubject(going.to.request);
  return (
    entry?.closest<HTMLElement>("[data-story-card]") ??
    entry ??
    (identity === undefined ? undefined : storyCard(identity)) ??
    null
  );
}
