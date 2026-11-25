// Whether the window matches a CSS media query, kept current as the window
// changes: for the few places that decide in code what the page's style
// decides at the same breakpoint, such as the side panel covering a narrow
// page (`./sidePanelWidth.ts`) and Intent's Files drawer
// (`./IntentFilesDrawer.tsx`).

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const watch = useCallback(
    (changed: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", changed);
      return () => {
        list.removeEventListener("change", changed);
      };
    },
    [query],
  );
  return useSyncExternalStore(watch, () => window.matchMedia(query).matches);
}
