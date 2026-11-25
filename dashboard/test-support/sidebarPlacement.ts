// Where a sidebar stands as the window's width places it, read from its
// toggle in one browser turn: hidden, docked beside the page, open as a
// drawer over it, or pending. Pending is the moment just after the window
// narrows, while a docked sidebar still claims to be shown but the page's
// style already lays it over the page without its drawer's backdrop; its
// owner then starts the drawer closed. Self-contained, so Playwright can
// evaluate it in the page and mounted tests can call it directly.
export type SidebarPlacement = "hidden" | "docked" | "drawer" | "pending";

export function sidebarPlacement(toggle: Element): SidebarPlacement {
  if (toggle.getAttribute("aria-expanded") !== "true") return "hidden";
  const sidebar = document.getElementById(
    toggle.getAttribute("aria-controls") ?? "",
  );
  if (sidebar === null || getComputedStyle(sidebar).position !== "fixed")
    return "docked";
  return sidebar.previousElementSibling?.matches(".sidebar-drawer-backdrop")
    ? "drawer"
    : "pending";
}
