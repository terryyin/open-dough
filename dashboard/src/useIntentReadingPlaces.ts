// Where Purpose and Proof were last read in one file (`./IntentFileReading.tsx`),
// so a tab or layout switch returns each to its place: Purpose by the source
// line at the top of its view, so it carries across layouts and keeps a
// positioned case in view; Proof by the reading area's offset in tabs. A new
// file starts its own places.

import { useLayoutEffect, useRef, type RefObject } from "react";
import type {
  IntentReadingLayout,
  IntentReadingTab,
} from "./IntentFileReading.tsx";

interface Places {
  path: string;
  purposeLine: string | undefined;
  proofTop: number;
}

// The first of `purpose`'s source lines in view at the top of `scroller`,
// where a line scrolled into view starts (below any scroll padding).
function lineAtTop(scroller: HTMLElement, purpose: HTMLElement) {
  if (scroller.scrollTop === 0) return undefined;
  const top =
    scroller.getBoundingClientRect().top +
    (parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0);
  for (const line of purpose.querySelectorAll<HTMLElement>(".source-line")) {
    if (line.getBoundingClientRect().bottom > top + 0.5) {
      return line.dataset.line;
    }
  }
  return undefined;
}

// Returns what to call just before a tab or layout switch: it keeps the
// places of what is shown, and the switch's render returns to them.
export function useIntentReadingPlaces({
  path,
  tab,
  layout,
  readingArea,
  purposeBody,
}: {
  readonly path: string;
  readonly tab: IntentReadingTab;
  readonly layout: IntentReadingLayout;
  // The reading area that scrolls the chosen panel with tabs.
  readonly readingArea: RefObject<HTMLDivElement | null>;
  // Purpose's body, which scrolls Purpose side by side.
  readonly purposeBody: RefObject<HTMLDivElement | null>;
}) {
  const places = useRef<Places>({ path, purposeLine: undefined, proofTop: 0 });
  // Set by a switch so its render returns to the kept places.
  const returning = useRef(false);
  const sideBySide = layout === "side-by-side";
  const proofInTabs = !sideBySide && tab === "proof";

  // What scrolls Purpose in the current layout.
  function purposeScroller() {
    return sideBySide ? purposeBody.current : readingArea.current;
  }

  function keepPlaces() {
    if (places.current.path !== path) {
      places.current = { path, purposeLine: undefined, proofTop: 0 };
    }
    if (!proofInTabs) {
      const scroller = purposeScroller();
      const body = purposeBody.current;
      if (scroller !== null && body !== null) {
        places.current.purposeLine = lineAtTop(scroller, body);
      }
    } else {
      places.current.proofTop = readingArea.current?.scrollTop ?? 0;
    }
    returning.current = true;
  }

  useLayoutEffect(() => {
    if (!returning.current) return;
    returning.current = false;
    if (places.current.path !== path) return;
    if (proofInTabs) {
      const area = readingArea.current;
      if (area !== null) area.scrollTop = places.current.proofTop;
      return;
    }
    const { purposeLine } = places.current;
    const line =
      purposeLine === undefined
        ? null
        : purposeBody.current?.querySelector(
            `.source-line[data-line="${purposeLine}"]`,
          );
    if (line instanceof HTMLElement) {
      line.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      const scroller = purposeScroller();
      if (scroller !== null) scroller.scrollTop = 0;
    }
    // Only a tab or layout switch returns to a place; a new file starts its
    // own.
  }, [tab, layout]);

  return keepPlaces;
}
