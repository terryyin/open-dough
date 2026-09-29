// What page-wide keyboard shortcuts leave alone: a key pressed inside an open
// dialog, as the launch dialog or the badge legend, which keeps its own
// keyboard. Project arrow navigation (`./projectKeyboardNavigation.ts`) and
// the Sessions sidebar's Command+B (`./SessionSidebar.tsx`) share it.

export function isInsideOpenDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("dialog[open]") !== null;
}
