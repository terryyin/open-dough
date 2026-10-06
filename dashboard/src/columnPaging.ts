// Which of the dashboard columns show (./DashboardColumns.tsx). The page's
// own width decides how many whole columns fit: the stylesheet says so as
// `--columns-shown` on the row's frame (./dashboard-columns.css), from the
// `page` container's width alone, and this reads it whenever the frame
// resizes. The position is one fact, the leftmost shown column the developer
// chose; the width only limits it, so the row never rests past the last
// column, and the chosen position comes back when the width allows it again.

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type SyntheticEvent,
} from "react";

export type ColumnPaging = {
  // The row's frame, whose width and stylesheet decide what fits.
  readonly frame: RefObject<HTMLDivElement | null>;
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

function columnsShown(frame: Element): number {
  const shown = Number.parseInt(
    getComputedStyle(frame).getPropertyValue("--columns-shown"),
    10,
  );
  return Number.isNaN(shown) ? 1 : shown;
}

export function useColumnPaging(columns: number): ColumnPaging {
  const frame = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(columns);
  const [position, setPosition] = useState(0);
  const [sliding, setSliding] = useState(false);
  const leftmost = Math.max(0, Math.min(position, columns - shown));

  useLayoutEffect(() => {
    const measured = frame.current;
    if (!measured) return undefined;
    const measure = () => {
      setShown(Math.min(columns, columnsShown(measured)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measured);
    return () => {
      observer.disconnect();
    };
  }, [columns]);

  const move = useCallback(
    (step: 1 | -1) => {
      setPosition(Math.max(0, Math.min(leftmost + step, columns - shown)));
      setSliding(true);
    },
    [leftmost, columns, shown],
  );
  const slid = useCallback((event: SyntheticEvent) => {
    if (event.target === event.currentTarget) setSliding(false);
  }, []);

  return { frame, shown, leftmost, move, sliding, slid };
}
