// Where a sidebar stands as its room places it, read from its toggle in one
// browser turn: hidden, docked beside its reader, open as a drawer over it,
// or pending. Pending is the moment just after the room narrows, while a
// docked sidebar still claims to be shown but the page's style already lays
// it over its reader without its drawer's backdrop; its owner then starts the
// drawer closed. The backdrop precedes the sidebar, or the part of its view
// that holds it. Self-contained, so Playwright can evaluate it in the page
// and mounted tests can call it directly.
export type SidebarPlacement = "hidden" | "docked" | "drawer" | "pending";

export function sidebarPlacement(toggle: Element): SidebarPlacement {
  if (toggle.getAttribute("aria-expanded") !== "true") return "hidden";
  const sidebar = document.getElementById(
    toggle.getAttribute("aria-controls") ?? "",
  );
  if (
    sidebar === null ||
    !["fixed", "absolute"].includes(getComputedStyle(sidebar).position)
  )
    return "docked";
  return sidebar.closest(".sidebar-drawer-backdrop + *") === null
    ? "pending"
    : "drawer";
}
