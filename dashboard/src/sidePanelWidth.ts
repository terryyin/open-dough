// The side panel's width beside the page (`./PageFrame.tsx`). The developer
// keeps one preferred width, chosen by dragging the panel's divider or with its
// Left and Right keys (`./PanelDivider.tsx`), and it serves whatever the
// panel shows, across closing and reopening, the Sessions sidebar, and
// Maximize/Restore, and is kept in this browser's disposable storage, so a
// reload recovers it. Until one is chosen, or where the browser keeps none,
// the panel takes half the room. What the panel takes is derived from that
// preference and the room the page and the panel share, beside the sidebar
// when it is open: neither becomes narrower than its usable minimum. Where
// that room cannot hold both, or the window is narrow, the panel covers the
// page column (shown maximized) and offers no divider. A limit the room sets
// never changes the preference, so more room recovers it.

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { useMeasuredRoom } from "./measuredRoom.ts";
import {
  shareOfRoom,
  useChoiceWithin,
  usePreferredSize,
} from "./sharedRoom.ts";

// The frame's narrow window, where the Sessions sidebar overlays the page
// (`./sessions-sidebar.css`) and the panel covers the page column.
const narrowWindow = "(max-width: 800px)";

// Each side's usable minimum, in rem: the narrowest width the page reflows to
// (320 CSS px at 400% zoom), which also holds the panel header's identity
// beside its icon controls, a terminal line of useful length, and a review's
// file list above its diff.
const panelMinimum = 20;
const pageMinimum = 20;
// How far one Left or Right key moves the divider, in rem.
const keyStep = 2;

type SidePanelLayout =
  | { readonly arrangement: "covering" }
  | {
      readonly arrangement: "split";
      readonly width: number;
      readonly minimum: number;
      readonly maximum: number;
      readonly step: number;
    };

// Where this browser keeps the preferred width, in CSS px.
const preferredWidthKey = "open-dough.sidePanel.width";

// The panel's arrangement and width, in CSS px, in the room the page and the
// panel share, for the preferred width, if one was chosen.
function sidePanelLayout(
  room: number,
  preferred: number | undefined,
  rem: number,
  narrow: boolean,
): SidePanelLayout {
  const share = shareOfRoom(room, preferred, {
    floor: panelMinimum * rem,
    otherFloor: pageMinimum * rem,
    step: keyStep * rem,
  });
  if (narrow || share === undefined) return { arrangement: "covering" };
  const { size: width, minimum, maximum, step } = share;
  return { arrangement: "split", width, minimum, maximum, step };
}

const narrowQuery = () => window.matchMedia(narrowWindow);
const watchNarrow = (changed: () => void) => {
  const query = narrowQuery();
  query.addEventListener("change", changed);
  return () => {
    query.removeEventListener("change", changed);
  };
};

// The room the page and the panel share in the frame: its width, less the
// Sessions sidebar's column while the sidebar is open. Measured as soon as the
// panel opens or the sidebar opens or closes, and whenever the frame changes
// size, so the page is never shown squeezed beside a panel sized for more
// room.
const readRoom = (frame: HTMLElement, rem: number) => ({
  width:
    frame.clientWidth -
    (frame.querySelector<HTMLElement>(".sessions-sidebar")?.offsetWidth ?? 0),
  rem,
});

// The width controlled by the Panel divider, while it is offered.
type PanelDividerState = Extract<SidePanelLayout, { arrangement: "split" }> & {
  readonly choose: (width: number) => void;
};

// Whether the panel covers the page column, and otherwise its divider.
export function useSidePanelWidth(
  frame: RefObject<HTMLElement | null>,
  shown: boolean,
  sessionsSidebarOpen: boolean,
): { covering: boolean; divider: PanelDividerState | undefined } {
  const [preferred, prefer] = usePreferredSize(preferredWidthKey);
  const narrow = useSyncExternalStore(watchNarrow, () => narrowQuery().matches);
  const room = useMeasuredRoom(frame, shown, readRoom, {
    remeasure: sessionsSidebarOpen,
  });
  const layout: SidePanelLayout | undefined =
    room === undefined
      ? narrow
        ? { arrangement: "covering" }
        : undefined
      : sidePanelLayout(room.width, preferred, room.rem, narrow);
  const split = layout?.arrangement === "split" ? layout : undefined;
  // The developer's choice, within the bounds the room sets now.
  const choose = useChoiceWithin(split, prefer);
  return {
    covering: layout?.arrangement === "covering",
    divider: split && { ...split, choose },
  };
}

const DividerContext = createContext<PanelDividerState | undefined>(undefined);
export const PanelDividerOnPage = DividerContext.Provider;
export const usePanelDivider = () => useContext(DividerContext);
