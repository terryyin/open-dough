// The side panel's own frame icon controls, shared by whatever it shows, as
// a terminal (`./Terminal.tsx`) or a story review
// (`./StoryReview.tsx`): Maximize or Restore, and Close, which
// Command+Shift+Escape also does page-wide, from inside a terminal too, except
// inside an open dialog or System settings (`useCommandShortcut`). The content
// leads them with its own operations. The final report
// (`./FinalReport.tsx`) keeps its own Close button with the same
// shortcut.

import { Maximize2, Minimize2, X } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { useCommandShortcut } from "./pageShortcuts.ts";

const closeShortcut = { key: "Escape", shift: true } as const;
export const sidePanelCloseShortcutLabel = "⌘⇧Esc";

// Closes whatever the panel shows by Command+Shift+Escape.
export function useSidePanelCloseShortcut(onClose: () => void): void {
  useCommandShortcut(closeShortcut, onClose);
}

export function SidePanelControls({
  maximized,
  onMaximize,
  onClose,
  offerMaximize = true,
}: {
  // Whether the panel takes the page column's room, and how it asks to
  // change that.
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  readonly onClose: () => void;
  // False while the panel covers the page (no usable split): Maximize/Restore
  // is not offered there.
  readonly offerMaximize?: boolean;
}) {
  useSidePanelCloseShortcut(onClose);
  return (
    <>
      {offerMaximize && (
        <IconButton
          label={maximized ? "Restore" : "Maximize"}
          icon={maximized ? Minimize2 : Maximize2}
          onClick={() => {
            onMaximize(!maximized);
          }}
        />
      )}
      <IconButton
        label="Close"
        shortcut={sidePanelCloseShortcutLabel}
        icon={X}
        align="end"
        onClick={onClose}
      />
    </>
  );
}
