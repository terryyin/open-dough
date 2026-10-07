// How many of Recently done's entries the developer has asked to see: the
// one requested prefix of its combined newest-first entries
// (`./recentlyDoneView.ts`), which alone decides which done records are read
// (`./doneDetails.ts`). It starts at the first ten and grows only when the
// developer asks for the next ten, or when a journey lands on a done entry
// beyond it; scrolling, resizing, and paging the columns ask for nothing. It
// is how the page presents the project, not anything read: it belongs to the
// project shown and starts again at ten for another project or a reload.
//
// The page keeps one range (`./PageFrame.tsx`), so the journeys that end on
// a session's entry -- the side panel's keyboard return
// (`./pageSidePanel.ts`) and a sidebar choice's reveal
// (`./sessionNavigation.ts`) -- ask it for their destination before they look
// for the entry (`sessionEntry`). The list answers each destination: it
// extends the range exactly through that entry, never shortening a longer
// one, and says it is reached once the entries through it are read, or that
// Recently done does not hold it. Only the newest destination is answered; an
// earlier one is superseded.

import { createContext, useContext, useState } from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";
import { untilOwnMove } from "./workFocus.ts";

// How many entries the list starts with, and each reveal adds.
export const doneBatch = 10;

// A journey's destination: the session whose entry it lands on, in its
// project, and what the list answered about it.
type Destination = {
  readonly id: number;
  readonly sourceId: string;
  readonly session: string;
  readonly answer?: "reached" | "absent";
};

type Range = {
  readonly sourceId: string | undefined;
  readonly requested: number;
  readonly destination?: Destination;
};

// Where a demanded destination stands: still being read, its entry shown,
// not in Recently done, or replaced by a newer destination.
export type DestinationAnswer = "pending" | "reached" | "absent" | "superseded";

let demands = 0;

// The page's one range, for the project whose stories it shows.
export function useRecentlyDoneRange(shownSource: string | undefined) {
  const [range, setRange] = useState<Range>({
    sourceId: shownSource,
    requested: doneBatch,
  });
  // Another project's stories start again at ten, and supersede any
  // destination still to be answered.
  if (shownSource !== undefined && range.sourceId !== shownSource) {
    setRange({ sourceId: shownSource, requested: doneBatch });
  }
  const { destination } = range;
  // Answers the destination `id` with `answer`, or extends the range through
  // `through` entries while it is still read.
  const settle = (
    id: number,
    through: number,
    answer?: "reached" | "absent",
  ) => {
    setRange((last) => {
      const asked = last.destination;
      if (asked?.id !== id || asked.answer !== undefined) return last;
      const requested =
        last.sourceId === asked.sourceId
          ? Math.max(last.requested, through)
          : last.requested;
      if (answer === undefined && requested === last.requested) return last;
      return {
        ...last,
        requested,
        destination: answer === undefined ? asked : { ...asked, answer },
      };
    });
  };
  return {
    requestedOf: (sourceId: string) =>
      range.sourceId === sourceId ? range.requested : doneBatch,
    // Asks for the next ten entries after the `shown` ones.
    reveal: (sourceId: string, shown: number) => {
      setRange((last) => ({ ...last, sourceId, requested: shown + doneBatch }));
    },
    // Asks the list for the entry of `record`'s session in its project;
    // answers the demand, by which its answer is found (`answerOf`).
    demand: (record: LaunchRecord): number => {
      demands += 1;
      const id = demands;
      const sourceId = record.request.source;
      const session = sessionKey(record.session);
      setRange((last) => ({
        ...last,
        destination: { id, sourceId, session },
      }));
      return id;
    },
    // While the destination `id` is still to be answered, the developer's
    // own move gives it up, keeping the entries already shown, and calls
    // `gaveUp`; the returned stop ends the wait first.
    givenUpOnOwnMove: (id: number, gaveUp: () => void) =>
      untilOwnMove(() => {
        setRange((last) =>
          last.destination?.id === id && last.destination.answer === undefined
            ? { sourceId: last.sourceId, requested: last.requested }
            : last,
        );
        gaveUp();
      }),
    answerOf: (id: number): DestinationAnswer => {
      if (destination?.id !== id) return "superseded";
      if (destination.sourceId !== range.sourceId) return "absent";
      return destination.answer ?? "pending";
    },
    // The destination still to be answered for `sourceId`'s list.
    wanted: (sourceId: string) =>
      destination?.answer === undefined && destination?.sourceId === sourceId
        ? destination
        : undefined,
    settle,
    // Changes whenever a destination is demanded or answered.
    destination,
  };
}

export type RecentlyDoneRange = ReturnType<typeof useRecentlyDoneRange>;

export const RecentlyDoneRangeOnPage = createContext<
  RecentlyDoneRange | undefined
>(undefined);

// The page's range, which every Recently done is inside.
export function usePageRange(): RecentlyDoneRange {
  const range = useContext(RecentlyDoneRangeOnPage);
  if (range === undefined) {
    throw new Error("Recently done is shown outside the page's PageFrame.");
  }
  return range;
}

// The first `requested` of `entries`, and how many follow them.
export function shownPrefix<T>(entries: readonly T[], requested: number) {
  const shown = entries.slice(0, requested);
  return { shown, older: entries.length - shown.length };
}
