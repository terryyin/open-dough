// The width of a review's file sidebar beside its diff
// (`./StoryReviewWorkarea.tsx`). The reviewer keeps one preferred width,
// chosen by dragging the Files divider or with its Left and Right keys, and it
// serves every review opened afterwards in this browser, also after a reload,
// kept in its disposable storage the way the side panel's width is
// (`./sidePanelWidth.ts`). Until one is chosen the sidebar is 16rem wide, and
// opening a review keeps nothing. What the sidebar takes is derived from that
// preference and the work area's width less the gap between the panes:
// neither the sidebar nor the diff becomes narrower than its usable minimum.
// A limit the room sets never changes the preference. Where the panes stack
// (`./story-review.css`) the style sheet ignores this width.

import type { RefObject } from "react";
import { useMeasuredRoom } from "./measuredRoom.ts";
import {
  shareOfRoom,
  useChoiceWithin,
  usePreferredSize,
} from "./sharedRoom.ts";
import type { DividerRange } from "./ResizeDivider.tsx";

// Each pane's usable minimum and the sidebar's width until one is chosen, in
// rem.
const sidebarMinimum = 12;
const diffMinimum = 18;
const defaultWidth = 16;
// How far one Left or Right key moves the divider, in rem.
const keyStep = 1;

// Where this browser keeps the preferred width, in CSS px.
const preferredWidthKey = "open-dough.storyReview.filesWidth";

// The work area's width less the gap between the panes.
const readRoom = (workarea: HTMLElement, rem: number) => ({
  width:
    workarea.clientWidth -
    (parseFloat(getComputedStyle(workarea).columnGap) || 0),
  rem,
});

// The sidebar's width, in CSS px, once the room is measured, and the Files
// divider's range while the room offers one.
export function useFileSidebarWidth(
  workarea: RefObject<HTMLElement | null>,
  shown: boolean,
): { width: number | undefined; range: DividerRange | undefined } {
  const [preferred, prefer] = usePreferredSize(preferredWidthKey);
  const room = useMeasuredRoom(workarea, shown, readRoom);
  const share =
    room &&
    shareOfRoom(room.width, preferred ?? defaultWidth * room.rem, {
      floor: sidebarMinimum * room.rem,
      otherFloor: diffMinimum * room.rem,
      step: keyStep * room.rem,
    });
  // The reviewer's choice, within the bounds the room sets now.
  const choose = useChoiceWithin(share, prefer);
  return { width: share?.size, range: share && { ...share, choose } };
}
