// How many of Recently done's entries the developer has asked to see: the
// one requested prefix of its combined newest-first entries
// (`./recentlyDoneView.ts`), which alone decides which done records are read
// (`./doneDetails.ts`). It starts at the first ten and grows only when the
// developer asks for the next ten; scrolling, resizing, and paging the
// columns ask for nothing. It is how the page presents the project, not
// anything read: it belongs to the project shown and starts again at ten for
// another project or a reload.

import { useState } from "react";

// How many entries the list starts with, and each reveal adds.
export const doneBatch = 10;

export function useRecentlyDoneRange(sourceId: string) {
  const [range, setRange] = useState({ sourceId, requested: doneBatch });
  const requested = range.sourceId === sourceId ? range.requested : doneBatch;
  return {
    requested,
    // Asks for the next ten entries after the `shown` ones.
    reveal: (shown: number) => {
      setRange({ sourceId, requested: shown + doneBatch });
    },
  };
}

// The first `requested` of `entries`, and how many follow them.
export function shownPrefix<T>(entries: readonly T[], requested: number) {
  const shown = entries.slice(0, requested);
  return { shown, older: entries.length - shown.length };
}
