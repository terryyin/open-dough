// Which of the dashboard columns show (./DashboardColumns.tsx). The page's
// own width decides how many whole columns fit: the stylesheet says so as
// `--columns-shown` on the row's frame (./dashboard-columns.css), from the
// `page` container's width alone, and this reads it whenever the frame
// resizes. The position is one fact, the leftmost shown column the developer
// chose; the width only limits it, so the row never rests past the last
// column, and the chosen position comes back when the width allows it again.
// A hidden column also shows when keyboard focus lands in it, or when a part
// of it is to be brought into view (`showColumnHolding`, ./workFocus.ts
// `keepInView`): the view moves the fewest columns that show the column
// holding that element in the page (`dashboardColumnMark`), so a dialog
// opened from a card belongs to the card's column wherever the window shows
// it. Which columns are hidden follows from the same facts (`hidden`), so that
// hidden columns add nothing to the page's length; focus that showed a column
// is brought into sight once that column has its length again.

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { keep, readKept } from "./keptPreference.ts";
import { prefersReducedMotion } from "./reducedMotion.ts";

export type ColumnPaging = {
  // The row's frame, whose width and stylesheet decide what fits, and the
  // row itself, whose columns show by moving it.
  readonly frame: RefObject<HTMLDivElement | null>;
  readonly row: RefObject<HTMLDivElement | null>;
  // How many whole columns show, and the leftmost of them.
  readonly shown: number;
  readonly leftmost: number;
  // Moves the view one column toward the end (1) or the start (-1), as a
  // brief slide that lasts until the row says it has ended (`slid`); a width
  // change moves it at once.
  readonly move: (step: 1 | -1) => void;
  readonly sliding: boolean;
  readonly slid: (event: SyntheticEvent) => void;
  // The columns, counted from 0, that are neither shown nor sliding out of
  // view.
  readonly hidden: readonly number[];
};

// How many of the `columns` the frame's stylesheet says fit right now.
function columnsShown(frame: Element, columns: number): number {
  const shown = Number.parseInt(
    getComputedStyle(frame).getPropertyValue("--columns-shown"),
    10,
  );
  return Math.min(columns, Number.isNaN(shown) ? 1 : shown);
}

// The leftmost shown column for a chosen `position`, limited so the row never
// rests past the last of the `columns` while `shown` of them show.
function leftmostOf(position: number, columns: number, shown: number) {
  return Math.max(0, Math.min(position, columns - shown));
}

// The columns, counted from 0, outside every one of the views, each the
// `shown` columns from its leftmost.
function hiddenFrom(views: readonly number[], shown: number, columns: number) {
  return [...Array(columns).keys()].filter((column) =>
    views.every((leftmost) => column < leftmost || column >= leftmost + shown),
  );
}

// The position this browser keeps, if a usable one is kept, and otherwise the
// one chosen on this page, even where the browser keeps nothing.
const positionKey = "open-dough.dashboardColumns.position";
let chosenOnPage = 0;

function readPosition(): number {
  const kept = readKept(positionKey);
  if (kept === undefined) return chosenOnPage;
  const position = Number(kept);
  return Number.isInteger(position) && position > 0 ? position : 0;
}

function keepPosition(position: number) {
  chosenOnPage = position;
  keep(positionKey, String(position));
}

// Asked of the dashboard columns by a part of the page about to be brought
// into view, which bubbles to the row that holds it; elsewhere nothing hears.
const showHolding = "dashboard-columns-show";

// Shows the dashboard column that holds `element` before it is brought into
// view, as focus landing in it would.
export function showColumnHolding(element: Element): void {
  element.dispatchEvent(new Event(showHolding, { bubbles: true }));
}

// Marks a region of the page as one of the dashboard columns, set where each
// column renders.
const columnAttribute = "data-dashboard-column";
export const dashboardColumnMark = { [columnAttribute]: "" } as const;

// Which of the row's columns, counted from 0 in the row's order, holds
// `element` in the page, wherever it shows on the screen; none when no column
// holds it.
function columnHolding(row: Element, element: Element): number | undefined {
  const holding = element.closest(`[${columnAttribute}]`);
  if (holding === null) return undefined;
  const column = [...row.querySelectorAll(`[${columnAttribute}]`)].indexOf(
    holding,
  );
  return column < 0 ? undefined : column;
}

export function useColumnPaging(columns: number): ColumnPaging {
  const frame = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(columns);
  const [position, setPosition] = useState(readPosition);
  const [sliding, setSliding] = useState(false);
  // Where a slide started, whose columns stay until it ends.
  const [slidFrom, setSlidFrom] = useState(0);
  const leftmost = leftmostOf(position, columns, shown);
  // Focus that landed in a hidden column, brought into sight once it shows.
  const focused = useRef<Element | undefined>(undefined);

  useLayoutEffect(() => {
    const measured = frame.current;
    if (!measured) return undefined;
    const measure = () => {
      setShown(columnsShown(measured, columns));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measured);
    return () => {
      observer.disconnect();
    };
  }, [columns]);

  // The view moves to a position as a slide, unless the developer asked for
  // reduced motion, where it moves at once and no slide is left waiting to
  // end.
  const moveTo = useCallback((to: number, from: number) => {
    setPosition(to);
    keepPosition(to);
    setSlidFrom(from);
    setSliding(!prefersReducedMotion());
  }, []);
  const move = useCallback(
    (step: 1 | -1) => {
      moveTo(leftmostOf(leftmost + step, columns, shown), leftmost);
    },
    [moveTo, leftmost, columns, shown],
  );
  // Focus or a reveal in a hidden column moves the view the fewest columns
  // that show it, as many as the page shows right now; the chosen position
  // stays while the column already shows.
  useLayoutEffect(() => {
    const moved = row.current;
    const measured = frame.current;
    if (!moved || !measured) return undefined;
    const show = (event: Event) => {
      if (!(event.target instanceof Element)) return;
      const column = columnHolding(moved, event.target);
      if (column === undefined) return;
      const fit = columnsShown(measured, columns);
      const from = leftmostOf(position, columns, fit);
      const to =
        column < from ? column : column >= from + fit ? column - fit + 1 : from;
      if (to === from) return;
      if (event.type === "focusin") focused.current = event.target;
      moveTo(to, from);
    };
    for (const asked of ["focusin", showHolding]) {
      moved.addEventListener(asked, show);
    }
    return () => {
      for (const asked of ["focusin", showHolding]) {
        moved.removeEventListener(asked, show);
      }
    };
  }, [moveTo, columns, position]);

  // The browser scrolled the focus into view while its column was hidden, so
  // within the page as long as the shown columns were: now that the column
  // has its length, the focus is brought the rest of the way, as little as
  // shows it.
  useLayoutEffect(() => {
    const target = focused.current;
    focused.current = undefined;
    if (target === undefined || target !== document.activeElement) return;
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  const slid = useCallback((event: SyntheticEvent) => {
    if (event.target === event.currentTarget) setSliding(false);
  }, []);

  const hidden = hiddenFrom(
    sliding ? [leftmost, slidFrom] : [leftmost],
    shown,
    columns,
  );
  return { frame, row, shown, leftmost, move, sliding, slid, hidden };
}
