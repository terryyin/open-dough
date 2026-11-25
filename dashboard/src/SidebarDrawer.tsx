// A sidebar's drawer presentation: when the sidebar lies over the page, a
// backdrop over the whole window, banner included, takes the complete outside
// click or tap and only closes the drawer, so nothing under it acts. The
// drawer's active toggle stays reachable through a hole in the backdrop.
// While the drawer is open over the page, Escape closes it and returns focus
// to that toggle, and Tab wraps within the drawer and that toggle. A key
// pressed inside an open dialog stays the dialog's (`./pageShortcuts.ts`); a
// docked sidebar, a closed drawer or an unmounted owner holds no boundary.
// Each view keeps its own sidebar's content, preference and toggle, and its
// style shows the backdrop only where it places the sidebar over the page
// (`./sidebar-drawer.css`).

import { useEffect, useLayoutEffect, useState } from "react";
import { isInsideOpenDialog } from "./pageShortcuts.ts";
import "./sidebar-drawer.css";

// Whether the sidebar element is currently presented as a drawer.
export const liesOverPage = (sidebar: HTMLElement | null) =>
  sidebar !== null && getComputedStyle(sidebar).position === "fixed";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

const tabbableWithin = (sidebar: HTMLElement) =>
  [...sidebar.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => element.getClientRects().length > 0,
  );

export type SidebarDrawer = {
  readonly open: boolean;
  readonly sidebarId: string;
  // The toggle that answers for the drawer where it is shown.
  readonly toggle: () => HTMLElement | undefined;
  readonly close: () => void;
};

// Escape and Tab containment for an open drawer over the page.
export function useDrawerKeys({
  open,
  sidebarId,
  toggle,
  close,
}: SidebarDrawer) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isInsideOpenDialog(event.target)) return;
      const sidebar = document.getElementById(sidebarId);
      if (sidebar === null || !liesOverPage(sidebar)) return;
      const button = toggle();
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        button?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const ring = [
        ...(button === undefined ? [] : [button]),
        ...tabbableWithin(sidebar),
      ];
      if (ring.length === 0) return;
      // The ring decides every step: the toggle and the drawer need not be
      // neighbours in document order.
      const at = ring.indexOf(document.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const next =
        at === -1
          ? event.shiftKey
            ? ring.length - 1
            : 0
          : (at + step + ring.length) % ring.length;
      event.preventDefault();
      ring[next]?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [open, sidebarId, toggle, close]);
}

// The backdrop's clip: the whole window less the toggle's box.
function useToggleHole(open: boolean, toggle: () => HTMLElement | undefined) {
  const [hole, setHole] = useState<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const button = toggle();
      const box = button?.getBoundingClientRect();
      const width = String(innerWidth);
      const height = String(innerHeight);
      const outer = `M0 0H${width}V${height}H0Z`;
      setHole(
        box === undefined || box.width === 0
          ? undefined
          : `path(evenodd, "${outer} M${String(box.left)} ${String(box.top)}H${String(box.right)}V${String(box.bottom)}H${String(box.left)}Z")`,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    const button = toggle();
    if (button !== undefined) observer.observe(button);
    addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      removeEventListener("resize", measure);
    };
  }, [open, toggle]);
  return hole;
}

export function DrawerBackdrop({
  open,
  toggle,
  onDismiss,
}: {
  readonly open: boolean;
  readonly toggle: () => HTMLElement | undefined;
  readonly onDismiss: () => void;
}) {
  const hole = useToggleHole(open, toggle);
  if (!open) return null;
  // The click ends the gesture its press began, so nothing beneath acts.
  return (
    <div
      className="sidebar-drawer-backdrop"
      aria-hidden="true"
      style={hole === undefined ? undefined : { clipPath: hole }}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onClick={onDismiss}
    />
  );
}
