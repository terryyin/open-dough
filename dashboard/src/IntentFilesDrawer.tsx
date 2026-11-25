// Intent's Files column as a sidebar (`./SidebarDrawer.tsx`). Where the page
// has room it is docked beside the reader and keeps the developer's kept
// choice for that view. Where room is tight (`./intent-browser.css`) it lies
// over a full-size reader as a drawer, and the list keeps its folders and
// scroll for the next opening.

import { type FilesSidebar, useFilesSidebar } from "./FilesSidebar.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import { useMediaQuery } from "./useMediaQuery.ts";

// The room below which `./intent-browser.css` places Files over the reader.
const drawerRoom = "(max-width: 52rem)";

export function useIntentFiles(id: string): FilesSidebar {
  const [docked, setDocked] = useKeptReading("filesShown", () => true);
  return useFilesSidebar({
    id,
    narrow: useMediaQuery(drawerRoom),
    docked,
    setDocked,
  });
}
