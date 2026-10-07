// Recently done's two range actions (`./RecentlyDone.tsx` places them): at
// the end of the list, how much of it shows and the action that shows the
// next ten older entries; beside the heading, while more than ten show, the
// one that shows only the latest ten again. Both ask the page's range
// (`./recentlyDoneRange.ts`) through the list's view.

import { useLayoutEffect, useRef, type RefObject } from "react";
import { entryCount } from "./columnSummary.ts";
import { doneBatch } from "./recentlyDoneRange.ts";
import type { RecentlyDoneView } from "./recentlyDoneView.ts";
import { prefersReducedMotion } from "./reducedMotion.ts";

const entriesWord = (count: number) => (count === 1 ? "entry" : "entries");

// How much of the list shows, and the one action that shows the next ten
// older entries, naming how many are older. Once every entry shows, it says
// so, and the keyboard that asked for the last of them stays there.
export function ShownRange({ view }: { readonly view: RecentlyDoneView }) {
  const { shown, older, column, details, reveal } = view;
  const action = useRef<HTMLButtonElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const asked = useRef(false);
  const all = shown.length + older;
  useLayoutEffect(() => {
    if (older === 0 && asked.current) {
      asked.current = false;
      statement.current?.focus({ preventScroll: true });
    }
  });
  if (older === 0 && shown.length <= doneBatch) {
    return null;
  }
  const next = Math.min(older, doneBatch);
  const reading = details.reading;
  return (
    <div className="recently-done-range">
      <p className="quiet">
        {column.entries === undefined
          ? `Showing ${String(shown.length)} ${entriesWord(shown.length)}.`
          : `Showing ${String(shown.length)} of ${entryCount(all)}.`}
      </p>
      {older > 0 ? (
        <button
          ref={action}
          type="button"
          className="frame-button"
          aria-disabled={reading}
          onClick={() => {
            if (reading) return;
            asked.current = document.activeElement === action.current;
            reveal();
          }}
        >
          {reading
            ? "Reading done stories…"
            : next < older
              ? `Show ${String(next)} of ${String(older)} older entries`
              : `Show the ${String(older)} older ${entriesWord(older)}`}
        </button>
      ) : (
        <p ref={statement} tabIndex={-1}>
          {reading
            ? "Reading done stories…"
            : column.entries === undefined
              ? `All ${String(shown.length)} ${entriesWord(shown.length)} listed so far are shown.`
              : `All ${entryCount(all)} are shown.`}
        </p>
      )}
    </div>
  );
}

// Beside the heading, so it is reached without passing the older entries:
// shows only the latest ten again, reading nothing, then brings the heading
// into view and keeps the keyboard on the action while it is offered, else
// at the start of Recently done.
export function ShowLatest({
  view,
  section,
}: {
  readonly view: RecentlyDoneView;
  readonly section: RefObject<HTMLElement | null>;
}) {
  const { shown, collapse } = view;
  const asked = useRef(false);
  const offered = shown.length > doneBatch;
  useLayoutEffect(() => {
    if (!asked.current) return;
    asked.current = false;
    const start = section.current;
    if (!offered) start?.focus({ preventScroll: true });
    start?.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  });
  if (!offered) return null;
  return (
    <button
      type="button"
      className="frame-button"
      onClick={() => {
        asked.current = true;
        collapse();
      }}
    >
      Show latest {doneBatch}
    </button>
  );
}
