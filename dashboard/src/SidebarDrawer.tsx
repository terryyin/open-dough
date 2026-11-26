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

// Whether the sidebar element is currently presented as a drawer: over the
// window, or over its own panel's room (`./ReviewFilesDrawer.tsx`).
export const liesOverPage = (sidebar: HTMLElement | null) =>
  sidebar !== null &&
  ["fixed", "absolute"].includes(getComputedStyle(sidebar).position);

// One drawer is active at a time: a drawer opening over the page closes any
// other open drawer, so one outside gesture dismisses what is open.
const drawerOpened = "sidebar-drawer-opened";

// The toggle that answers for the sidebar where it is shown, among copies of
// its control, such as the banner's and the side panel header's.
export const shownToggleOf = (sidebarId: string) =>
  [
    ...document.querySelectorAll<HTMLElement>(
      `[aria-controls="${sidebarId}"][aria-expanded]`,
    ),
  ].find(
    (button) =>
      button.getClientRects().length > 0 &&
      getComputedStyle(button).visibility === "visible",
  );

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

const tabbableWithin = (sidebar: HTMLElement) =>
  [...sidebar.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => element.getClientRects().length > 0,
  );

export type SidebarDrawer = {
  readonly open: boolean;
  readonly sidebarId: string;
  readonly close: () => void;
};

// Escape and Tab containment for an open drawer over the page.
export function useDrawerKeys({ open, sidebarId, close }: SidebarDrawer) {
  useEffect(() => {
    if (!open) return undefined;
    if (liesOverPage(document.getElementById(sidebarId)))
      document.dispatchEvent(
        new CustomEvent<string>(drawerOpened, { detail: sidebarId }),
      );
    const onOther = (event: Event) => {
      const other = (event as CustomEvent<string>).detail;
      if (
        other !== sidebarId &&
        liesOverPage(document.getElementById(sidebarId))
      )
        close();
    };
    document.addEventListener(drawerOpened, onOther);
    return () => {
      document.removeEventListener(drawerOpened, onOther);
    };
  }, [open, sidebarId, close]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isInsideOpenDialog(event.target)) return;
      const sidebar = document.getElementById(sidebarId);
      if (sidebar === null || !liesOverPage(sidebar)) return;
      const button = shownToggleOf(sidebarId);
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
  }, [open, sidebarId, close]);
}

// The backdrop's clip: the whole window less the toggle's box.
function useToggleHole(open: boolean, sidebarId: string) {
  const [hole, setHole] = useState<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const box = shownToggleOf(sidebarId)?.getBoundingClientRect();
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
    const button = shownToggleOf(sidebarId);
    if (button !== undefined) observer.observe(button);
    addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      removeEventListener("resize", measure);
    };
  }, [open, sidebarId]);
  return hole;
}

export function DrawerBackdrop({
  open,
  sidebarId,
  onDismiss,
  overPage = false,
}: {
  readonly open: boolean;
  readonly sidebarId: string;
  readonly onDismiss: () => void;
  // Shown wherever it is open, for a sidebar that decides its own placement.
  readonly overPage?: boolean;
}) {
  const hole = useToggleHole(open, sidebarId);
  if (!open) return null;
  // The click ends the gesture its press began, so nothing beneath acts.
  return (
    <div
      className={
        overPage
          ? "sidebar-drawer-backdrop sidebar-drawer-over-page"
          : "sidebar-drawer-backdrop"
      }
      aria-hidden="true"
      style={hole === undefined ? undefined : { clipPath: hole }}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onClick={onDismiss}
    />
  );
}
