// The side panel's own frame icon controls, shared by whatever it shows, as
// a terminal (`./TerminalPanel.tsx`) or a story review
// (`./StoryReviewPanel.tsx`): Maximize or Restore, and Close, which
// Command+Shift+Escape also does page-wide, from inside a terminal too, except
// inside an open dialog or System settings (`useCommandShortcut`). The content
// leads them with its own operations. The final report
// (`./SessionResultPanel.tsx`) keeps its own Close button with the same
// shortcut.

import { Maximize2, Minimize2, X } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { useCommandShortcut } from "./pageShortcuts.ts";

const closeShortcut = { key: "Escape", shift: true } as const;
export const closeShortcutLabel = "⌘⇧Esc";

// Closes whatever the panel shows by Command+Shift+Escape.
export function usePanelCloseShortcut(onClose: () => void): void {
  useCommandShortcut(closeShortcut, onClose);
}

export function PanelControls({
  maximized,
  onMaximize,
  onClose,
}: {
  // Whether the panel takes the page column's room, and how it asks to
  // change that.
  readonly maximized: boolean;
  readonly onMaximize: (maximized: boolean) => void;
  readonly onClose: () => void;
}) {
  usePanelCloseShortcut(onClose);
  return (
    <>
      <IconButton
        label={maximized ? "Restore" : "Maximize"}
        icon={maximized ? Minimize2 : Maximize2}
        onClick={() => {
          onMaximize(!maximized);
        }}
      />
      <IconButton
        label="Close"
        shortcut={closeShortcutLabel}
        icon={X}
        align="end"
        onClick={onClose}
      />
    </>
  );
}
