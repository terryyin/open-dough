// The room a resizable area shares (`./sharedRoom.ts`), as an area's box
// shows it: the side panel's frame (`./sidePanelWidth.ts`), the Sessions
// sidebar (`./sessionsSidebarHeights.ts`) and a review's work area
// (`./reviewFileSidebarWidth.ts`). It is read as soon as measuring starts or
// `remeasure` changes, before that is painted, and again whenever the area or
// another box it names changes size. A resize is laid out anew before it is
// painted, so no area is shown sized for more room than it has. Each caller
// owns what its room is: `read` takes the area's box and the root font size
// in CSS px, and must keep its identity across renders, as `observed` must.

import { useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";

// The boxes whose resizing changes the room: by default, the area's own.
type Observed = (area: HTMLElement) => Iterable<Element | null>;
const areaItself: Observed = (area) => [area];

export function useMeasuredRoom<Room>(
  area: RefObject<HTMLElement | null>,
  measuring: boolean,
  read: (area: HTMLElement, rem: number) => Room,
  {
    observed = areaItself,
    remeasure,
  }: { readonly observed?: Observed; readonly remeasure?: unknown } = {},
): Room | undefined {
  const [room, setRoom] = useState<Room | undefined>();
  useLayoutEffect(() => {
    const element = area.current;
    if (!measuring || element === null) return;
    const measure = () => {
      setRoom(
        read(
          element,
          parseFloat(getComputedStyle(document.documentElement).fontSize),
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(() => {
      flushSync(measure);
    });
    for (const box of observed(element))
      if (box !== null) observer.observe(box);
    return () => {
      observer.disconnect();
    };
  }, [area, measuring, read, observed, remeasure]);
  return room;
}
