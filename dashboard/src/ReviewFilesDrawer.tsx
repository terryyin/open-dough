// A review's Files sidebar (`./FilesSidebar.tsx`). The review body's own
// measured room decides its place, not the window: a narrow Review inside a
// wide frame is narrow. With room the sidebar is docked beside the diff and
// keeps the reviewer's choice. Where room is tight
// (`./story-review-workarea.css`) it lies over the diff as a drawer while
// the tree keeps its folders and scroll. The backdrop precedes the review
// body in the review panel, which rises over the page while the
// drawer is open (`./story-review.css`), so the whole window outside the
// drawer and its toggle takes one dismissal.

import { type RefObject, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import { type FilesSidebar, useFilesSidebar } from "./FilesSidebar.tsx";

// The body's content width below which `./story-review-workarea.css` places
// Files over the diff (its container query's 34.75rem).
const drawerRoomRem = 34.75;

function useNarrowRoom(body: RefObject<HTMLElement | null>) {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = body.current;
    if (element === null) return undefined;
    const isNarrow = () => {
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const style = getComputedStyle(element);
      const content =
        element.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      return content < drawerRoomRem * rem;
    };
    let placed = isNarrow();
    setNarrow(placed);
    // Placed in the frame the room crosses the threshold, so a drawer never
    // shows open over a newly narrow review. Other resizes render nothing,
    // so they flush no other pending work while the observer reports.
    const observer = new ResizeObserver(() => {
      if (isNarrow() === placed) return;
      placed = !placed;
      flushSync(() => {
        setNarrow(placed);
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [body]);
  return narrow;
}

export function useReviewFiles(
  id: string,
  body: RefObject<HTMLElement | null>,
): FilesSidebar {
  const [docked, setDocked] = useState(true);
  return useFilesSidebar({
    id,
    narrow: useNarrowRoom(body),
    docked,
    setDocked,
    overPage: true,
  });
}
