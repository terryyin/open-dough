// Which of the dashboard columns show (./DashboardColumns.tsx). The page's
// own width decides how many whole columns fit: the stylesheet says so as
// `--columns-shown` on the row's frame (./dashboard-columns.css), from the
// `page` container's width alone, and this reads it whenever the frame
// resizes. The position is one fact, the leftmost shown column the developer
// chose; the width only limits it, so the row never rests past the last
// column, and the chosen position comes back when the width allows it again.
// A hidden column also shows when keyboard focus lands in it, or when a part
// of it is to be brought into view (`showColumnHolding`, ./workFocus.ts
// `keepInView`): the view moves the fewest columns that show it.

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type SyntheticEvent,
} from "react";
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

// Asked of the dashboard columns by a part of the page about to be brought
// into view, which bubbles to the row that holds it; elsewhere nothing hears.
const showHolding = "dashboard-columns-show";

// Shows the dashboard column that holds `element` before it is brought into
// view, as focus landing in it would.
export function showColumnHolding(element: Element): void {
  element.dispatchEvent(new Event(showHolding, { bubbles: true }));
}

// Which of the row's equal columns holds `element`: where it starts across
// the row, which moves as a whole, so a hidden column answers as a shown one.
function columnHolding(row: Element, element: Element, columns: number) {
  const across = row.getBoundingClientRect();
  const column = Math.floor(
    ((element.getBoundingClientRect().left - across.left) * columns) /
      across.width,
  );
  return Math.max(0, Math.min(column, columns - 1));
}

export function useColumnPaging(columns: number): ColumnPaging {
  const frame = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(columns);
  const [position, setPosition] = useState(0);
  const [sliding, setSliding] = useState(false);
  const leftmost = leftmostOf(position, columns, shown);

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
  const moveTo = useCallback((to: number) => {
    setPosition(to);
    setSliding(!prefersReducedMotion());
  }, []);
  const move = useCallback(
    (step: 1 | -1) => {
      moveTo(leftmostOf(leftmost + step, columns, shown));
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
      const column = columnHolding(moved, event.target, columns);
      const fit = columnsShown(measured, columns);
      const from = leftmostOf(position, columns, fit);
      const to =
        column < from ? column : column >= from + fit ? column - fit + 1 : from;
      if (to !== from) moveTo(to);
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

  const slid = useCallback((event: SyntheticEvent) => {
    if (event.target === event.currentTarget) setSliding(false);
  }, []);

  return { frame, row, shown, leftmost, move, sliding, slid };
}
