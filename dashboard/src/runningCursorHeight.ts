// How the expanded Sessions sidebar (`./SessionSidebar.tsx`) shares its room
// between the session list and Running Cursor sessions' content. The developer
// keeps one preferred height for the Cursor content, chosen by dragging the
// edge above that section or with its Up and Down keys
// (`./ResizeEdge.tsx`): collapsing and expanding the section, closing and
// reopening the sidebar, and project and view changes keep it, and it is kept
// in this browser's disposable storage, so expanding the section after a
// reload recovers it. Until one is chosen, or where the browser keeps none or
// an unusable one, the two share the room equally. The room is
// what the sidebar's height leaves once its heading and the section's header
// take theirs, as shown, so a banner or header that wraps leaves less. Each
// keeps a usable floor: room to read and choose an entry, with the runner's
// status. Where the room cannot hold both floors, the edge offers no range and
// the sidebar's own scrolling keeps both in reach (`./session-sidebar.css`).
// A limit the room sets never changes the preference, so more room recovers
// it.

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { EdgeRange } from "./ResizeEdge.tsx";
import { shareOfRoom, sizeWithin, usePreferredSize } from "./sharedRoom.ts";

// Where this browser keeps the preferred height, in CSS px.
const preferredHeightKey = "open-dough.sessionSidebar.runningCursorHeight";

// Each area's usable floor, in rem: the sidebar's own, which its rows keep
// (./session-sidebar.css).
const areaFloor = "--sidebar-list-floor";
// How far one Up or Down key moves the edge, in rem.
const keyStep = 2;

// The room's height and each area's floor, in CSS px, and the rem they are
// measured with.
type Room = {
  readonly height: number;
  readonly floor: number;
  readonly rem: number;
};

// The room the two areas share in the sidebar: its height inside its padding,
// less the rows of its heading and the section's header (its first and third
// rows). Measured as soon as the section expands or the sidebar opens, before
// that is painted, and again whenever the sidebar, its heading or the header
// changes size.
function useRoom(sidebar: RefObject<HTMLElement | null>, measuring: boolean) {
  const [room, setRoom] = useState<Room | undefined>();
  useLayoutEffect(() => {
    const element = sidebar.current;
    if (!measuring || element === null) return;
    const measure = () => {
      const style = getComputedStyle(element);
      const rows = style.gridTemplateRows.split(" ").map(parseFloat);
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      setRoom({
        height:
          element.clientHeight -
          parseFloat(style.paddingTop) -
          parseFloat(style.paddingBottom) -
          (rows[0] ?? 0) -
          (rows[2] ?? 0),
        floor: parseFloat(style.getPropertyValue(areaFloor)) * rem,
        rem,
      });
    };
    measure();
    const observer = new ResizeObserver(() => {
      flushSync(measure);
    });
    for (const observed of [
      element,
      element.querySelector("h2"),
      element.querySelector(".running-cursor-toggle"),
    ])
      if (observed !== null) observer.observe(observed);
    return () => {
      observer.disconnect();
    };
  }, [sidebar, measuring]);
  return measuring ? room : undefined;
}

// The Cursor content's height while the section is expanded, and the edge's
// range; both undefined while the room cannot hold both floors.
export function useRunningCursorHeight(
  sidebar: RefObject<HTMLElement | null>,
  measuring: boolean,
): { height: number | undefined; range: EdgeRange | undefined } {
  const [preferred, prefer] = usePreferredSize(preferredHeightKey);
  const room = useRoom(sidebar, measuring);
  const shown =
    room === undefined
      ? undefined
      : shareOfRoom(room.height, preferred, {
          floor: room.floor,
          otherFloor: room.floor,
          step: keyStep * room.rem,
        });
  const minimum = shown?.minimum;
  const maximum = shown?.maximum;
  // The developer's choice, within the bounds the room sets now.
  const choose = useCallback(
    (height: number) => {
      if (minimum === undefined || maximum === undefined) return;
      prefer(sizeWithin(height, minimum, maximum));
    },
    [minimum, maximum, prefer],
  );
  return { height: shown?.size, range: shown && { ...shown, choose } };
}
