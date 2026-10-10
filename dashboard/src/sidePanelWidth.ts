// The side panel's width beside the page (`./PageFrame.tsx`). The developer
// keeps one preferred width, chosen by dragging the panel's edge or with its
// Left and Right keys (`./SidePanelEdge.tsx`), and it serves whatever the
// panel shows, across closing and reopening, the Sessions sidebar, and
// Maximize/Restore, and is kept in this browser's disposable storage, so a
// reload recovers it. Until one is chosen, or where the browser keeps none,
// the panel takes half the room. What the panel takes is derived from that
// preference and the room the page and the panel share, beside the sidebar
// when it is open: neither becomes narrower than its usable minimum. Where
// that room cannot hold both, or the window is narrow, the panel stacks above
// the page and offers no edge. A limit the room sets never changes the
// preference, so more room recovers it.

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { flushSync } from "react-dom";
import { keep, readKept } from "./keptPreference.ts";
import { shareOfRoom, sizeWithin } from "./sharedRoom.ts";

// The frame's narrow window, where the Sessions sidebar overlays the page
// (`./session-sidebar.css`) and the panel stacks above it.
const narrowWindow = "(max-width: 800px)";

// Each side's usable minimum, in rem: the narrowest width the page reflows to
// (320 CSS px at 400% zoom), which also holds the panel header's identity
// beside its icon controls, a terminal line of useful length, and a review's
// file list above its diff.
const panelMinimum = 20;
const pageMinimum = 20;
// How far one Left or Right key moves the edge, in rem.
const keyStep = 2;

type SidePanelLayout =
  | { readonly arrangement: "stacked" }
  | {
      readonly arrangement: "split";
      readonly width: number;
      readonly minimum: number;
      readonly maximum: number;
      readonly step: number;
    };

// The preferred width this browser keeps, in CSS px, if a usable one is kept.
const preferredWidthKey = "open-dough.sidePanel.width";

function readPreferredWidth(): number | undefined {
  const kept = Number(readKept(preferredWidthKey));
  return Number.isFinite(kept) && kept > 0 ? kept : undefined;
}

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
  if (narrow || share === undefined) return { arrangement: "stacked" };
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
// Sessions sidebar's column while the sidebar is open.
type Room = { readonly width: number; readonly rem: number };

// Measured as soon as the panel opens or the sidebar opens or closes, before
// the change is painted, and again whenever either box changes size.
function useRoom(
  frame: RefObject<HTMLElement | null>,
  shown: boolean,
  sidebarOpen: boolean,
) {
  const [room, setRoom] = useState<Room | undefined>();
  useLayoutEffect(() => {
    const element = frame.current;
    if (!shown || element === null) return;
    const sidebar = element.querySelector<HTMLElement>(".session-sidebar");
    const measure = () => {
      setRoom({
        width: element.clientWidth - (sidebar?.offsetWidth ?? 0),
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
      });
    };
    measure();
    // A window resize is laid out anew before it is painted, so the page is
    // never shown squeezed beside a panel sized for more room.
    const observer = new ResizeObserver(() => {
      flushSync(measure);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [frame, shown, sidebarOpen]);
  return room;
}

// The edge's width and how it changes, while the panel offers one.
type SidePanelEdgeState = Extract<SidePanelLayout, { arrangement: "split" }> & {
  readonly choose: (width: number) => void;
};

// Whether the panel stacks above the page, and otherwise its edge.
export function useSidePanelWidth(
  frame: RefObject<HTMLElement | null>,
  shown: boolean,
  sidebarOpen: boolean,
): { stacked: boolean; edge: SidePanelEdgeState | undefined } {
  const [preferred, setPreferred] = useState(readPreferredWidth);
  const narrow = useSyncExternalStore(watchNarrow, () => narrowQuery().matches);
  const room = useRoom(frame, shown, sidebarOpen);
  const layout: SidePanelLayout | undefined =
    room === undefined
      ? narrow
        ? { arrangement: "stacked" }
        : undefined
      : sidePanelLayout(room.width, preferred, room.rem, narrow);
  const split = layout?.arrangement === "split" ? layout : undefined;
  const minimum = split?.minimum;
  const maximum = split?.maximum;
  // The developer's choice, within the bounds the room sets now.
  const choose = useCallback(
    (width: number) => {
      if (minimum === undefined || maximum === undefined) return;
      const chosen = sizeWithin(width, minimum, maximum);
      setPreferred(chosen);
      keep(preferredWidthKey, String(chosen));
    },
    [minimum, maximum],
  );
  return {
    stacked: layout?.arrangement === "stacked",
    edge: split && { ...split, choose },
  };
}

const EdgeContext = createContext<SidePanelEdgeState | undefined>(undefined);
export const SidePanelEdgeOnPage = EdgeContext.Provider;
export const useSidePanelEdge = () => useContext(EdgeContext);
