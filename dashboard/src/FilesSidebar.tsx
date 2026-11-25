// A Files sidebar (`./SidebarDrawer.tsx`) as its view places it
// (`./IntentFilesDrawer.tsx`, `./ReviewFilesDrawer.tsx`): docked where the
// view has room, keeping the view's own choice; a drawer where room is
// tight. Each newly entered view, and each entry into tight room, starts the
// drawer closed to leave the reader available, and choosing a file closes it
// to expose that reading.

import { type ReactNode, useCallback, useState } from "react";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { DrawerBackdrop, useDrawerKeys } from "./SidebarDrawer.tsx";

export type FilesSidebar = FileBrowserPlace & {
  readonly onShow: (shown: boolean) => void;
  readonly onFileChosen: () => void;
  readonly backdrop: ReactNode;
};

export function useFilesSidebar({
  id,
  narrow,
  docked,
  setDocked,
  overPage = false,
}: {
  readonly id: string;
  // Whether the view's room places Files over its reader.
  readonly narrow: boolean;
  readonly docked: boolean;
  readonly setDocked: (shown: boolean) => void;
  readonly overPage?: boolean;
}): FilesSidebar {
  // The view whose drawer is open; another view starts closed.
  const [drawerOf, setDrawerOf] = useState<string | undefined>(undefined);
  const [wasNarrow, setWasNarrow] = useState(narrow);
  if (wasNarrow !== narrow) {
    setWasNarrow(narrow);
    if (narrow) setDrawerOf(undefined);
  }
  const open = narrow && drawerOf === id;
  const close = useCallback(() => {
    setDrawerOf(undefined);
  }, []);
  useDrawerKeys({ open, sidebarId: id, close });
  const onShow = useCallback(
    (next: boolean) => {
      if (narrow) setDrawerOf(next ? id : undefined);
      else setDocked(next);
    },
    [narrow, id, setDocked],
  );
  const onFileChosen = useCallback(() => {
    if (narrow) close();
  }, [narrow, close]);
  return {
    id,
    shown: narrow ? open : docked,
    onShow,
    onFileChosen,
    backdrop: (
      <DrawerBackdrop
        open={open}
        sidebarId={id}
        onDismiss={close}
        overPage={overPage}
      />
    ),
  };
}
