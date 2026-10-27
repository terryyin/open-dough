// How the expanded Sessions sidebar (`./SessionsSidebar.tsx`) shares its room
// among its visible lists. One calculation owns every expanded list, section
// header and usable floor: preferred-capable sections keep a disposable height
// each, chosen by dragging the divider above that section or with its Up and
// Down keys (`./ResizeDivider.tsx`); collapsing and expanding a section,
// closing and reopening the sidebar, and project and view changes keep those
// preferences, and each is kept in this browser's disposable storage, so
// expanding after a reload recovers it. Unpreferred areas — today the open
// session list — share what remains. Until a preference is chosen, or where
// the browser keeps none or an unusable one, the visible lists share the room
// equally. The room is what the sidebar's height leaves once its heading and
// every expanded section's header take theirs, as shown, so a banner or header
// that wraps leaves less. Each list keeps a usable floor: room to read and
// choose an entry, with a runner's status where that section has one. Where
// the room cannot hold every floor, dividers offer no range and the sidebar's
// own scrolling keeps every list and header in reach (`./sessions-sidebar.css`).
// A limit the room sets never changes a preference, so more room recovers it.
// Callers still size one preferred section here (Running Cursor sessions);
// further preferred sections join the same calculation without a second
// independent allocator.

import { useCallback, useLayoutEffect, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import type { DividerRange } from "./ResizeDivider.tsx";
import { sharesOfRoom, sizeWithin, usePreferredSize } from "./sharedRoom.ts";

// Where this browser keeps the preferred height, in CSS px.
const preferredHeightKey = "open-dough.sessionsSidebar.runningCursorHeight";

// Each area's usable floor, in rem: the sidebar's own, which its rows keep
// (./sessions-sidebar.css).
const areaFloor = "--sessions-sidebar-list-floor";
// How far one Up or Down key moves the divider, in rem.
const keyStep = 2;

// The room's height and each area's floor, in CSS px, and the rem they are
// measured with.
type Room = {
  readonly height: number;
  readonly floor: number;
  readonly rem: number;
};

// Header rows sit on even grid tracks (heading, then each expanded section's
// header); list rows sit on the odd tracks between them.
const headerRowHeight = (rows: readonly number[]) =>
  rows.reduce(
    (total, height, index) => (index % 2 === 0 ? total + (height || 0) : total),
    0,
  );

// The room the visible lists share in the sidebar: its height inside its
// padding, less every header row. Measured as soon as a preferred section
// expands or the sidebar opens, before that is painted, and again whenever
// the sidebar, its heading or a section header changes size.
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
          headerRowHeight(rows),
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
      ...element.querySelectorAll(".sessions-sidebar-section-header"),
    ])
      if (observed !== null) observer.observe(observed);
    return () => {
      observer.disconnect();
    };
  }, [sidebar, measuring]);
  return measuring ? room : undefined;
}

// Running Cursor content's height while that section is expanded, and the
// divider's range; both undefined while the room cannot hold every floor. The
// open session list remains the unpreferred remainder of the same calculation.
export function useRunningCursorHeight(
  sidebar: RefObject<HTMLElement | null>,
  measuring: boolean,
): { height: number | undefined; range: DividerRange | undefined } {
  const [preferred, prefer] = usePreferredSize(
    preferredHeightKey,
    "open-dough.sessionSidebar.runningCursorHeight",
  );
  const room = useRoom(sidebar, measuring);
  const shown =
    room === undefined
      ? undefined
      : sharesOfRoom(
          room.height,
          [{ floor: room.floor, preferred }],
          [room.floor],
          keyStep * room.rem,
        )?.[0];
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
