// The side panel's own frame icon controls, shared by whatever it shows, as
// a terminal (`./TerminalPanel.tsx`) or a story review
// (`./StoryReviewPanel.tsx`): Maximize or Restore, and Close, which
// Command+Shift+Escape also does page-wide, from inside a terminal too, except
// inside an open dialog or System settings (`useCommandShortcut`). The content
// leads them with its own operations.

import { Maximize2, Minimize2, X } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { useCommandShortcut } from "./pageShortcuts.ts";

const closeShortcut = { key: "Escape", shift: true } as const;

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
  useCommandShortcut(closeShortcut, onClose);
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
        shortcut="⌘⇧Esc"
        icon={X}
        align="end"
        onClick={onClose}
      />
    </>
  );
}
