// Intent's Files column as a sidebar (`./SidebarDrawer.tsx`). Where the page
// has room it is docked beside the reader and keeps the developer's kept
// choice for that view. Where room is tight (`./intent-browser.css`) it lies
// over a full-size reader as a drawer: each newly entered view starts with
// the drawer closed, and choosing a file closes it to expose the reading
// while the list keeps its folders and scroll for the next opening.

import { type ReactNode, useCallback, useState } from "react";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { DrawerBackdrop, useDrawerKeys } from "./SidebarDrawer.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import { useMediaQuery } from "./useMediaQuery.ts";

// The room below which `./intent-browser.css` places Files over the reader.
const drawerRoom = "(max-width: 52rem)";

// The Files place a view shows, how its toggle changes it, and how its
// drawer closes once a file is chosen.
export type IntentFilesPlace = FileBrowserPlace & {
  readonly onShow: (shown: boolean) => void;
  readonly onFileChosen: () => void;
  readonly backdrop: ReactNode;
};

export function useIntentFiles(id: string): IntentFilesPlace {
  const [docked, setDocked] = useKeptReading("filesShown", () => true);
  // The view whose drawer is open; another view starts closed.
  const [drawerOf, setDrawerOf] = useState<string | undefined>(undefined);
  const narrow = useMediaQuery(drawerRoom);
  const open = narrow && drawerOf === id;
  const shown = narrow ? open : docked;
  const onShow = useCallback(
    (next: boolean) => {
      if (narrow) setDrawerOf(next ? id : undefined);
      else setDocked(next);
    },
    [narrow, id, setDocked],
  );
  const close = useCallback(() => {
    setDrawerOf(undefined);
  }, []);
  useDrawerKeys({ open, sidebarId: id, close });
  const onFileChosen = useCallback(() => {
    if (narrow) close();
  }, [narrow, close]);
  return {
    id,
    shown,
    onShow,
    onFileChosen,
    backdrop: <DrawerBackdrop open={open} sidebarId={id} onDismiss={close} />,
  };
}
