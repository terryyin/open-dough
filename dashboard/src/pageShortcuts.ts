// Page-wide Command shortcuts: the Sessions sidebar's Command+B
// (`./SessionSidebar.tsx`) and the side panel's Command+Shift+Escape
// (`./PanelControls.tsx`). Each is listened for while capturing, so the page
// answers it before any control on it, the terminal included, handles the
// key, and takes it from the browser and from those controls; a held key acts
// once. What they leave alone: a key pressed inside an open dialog, as the
// launch dialog or the badge legend, which keeps its own keyboard. Project
// arrow navigation (`./projectKeyboardNavigation.ts`) shares that. Machine
// settings suspends these dashboard shortcuts even when blank-space clicks
// leave the keyboard on the body outside its controls.

import { useEffect, useRef } from "react";

export function isInsideOpenDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("dialog[open]") !== null;
}

// Command with exactly this key, and Shift only when asked for.
export type CommandShortcut = {
  readonly key: string;
  readonly shift?: boolean;
};

const matches = (event: KeyboardEvent, key: string, shift: boolean) =>
  event.metaKey &&
  !event.ctrlKey &&
  !event.altKey &&
  event.shiftKey === shift &&
  event.key.toLowerCase() === key.toLowerCase();

export function useCommandShortcut(
  shortcut: CommandShortcut,
  act: () => void,
): void {
  const acting = useRef(act);
  useEffect(() => {
    acting.current = act;
  }, [act]);
  const { key, shift = false } = shortcut;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !matches(event, key, shift) ||
        isInsideOpenDialog(event.target) ||
        document.querySelector(".system-settings") !== null
      ) {
        return;
      }
      // Taken from the browser and from every control below the window, the
      // terminal included, whose xterm would otherwise still send the key to
      // the session: it ignores a prevented default, and turns any Escape,
      // whatever the modifiers, into ESC.
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) {
        acting.current();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [key, shift]);
}
