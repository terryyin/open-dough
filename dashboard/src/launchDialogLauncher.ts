// The action's side of a launch dialog (`LaunchDialog`): its button, whether
// the dialog is open, and the keyboard's return. A closed dialog returns the
// keyboard to the button once it can take it again: at once, or when a launch
// still in flight has answered.

import { useEffect, useRef, useState, type RefObject } from "react";

export function useLaunchDialogLauncher(starting: boolean): {
  readonly launcher: RefObject<HTMLButtonElement | null>;
  readonly open: boolean;
  readonly openDialog: () => void;
  // Whether a launched session took the keyboard.
  readonly closeDialog: (launched: boolean) => void;
} {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const returnsFocus = useRef(false);
  useEffect(() => {
    if (!open && !starting && returnsFocus.current) {
      returnsFocus.current = false;
      launcher.current?.focus();
    }
  }, [open, starting]);
  return {
    launcher,
    open,
    openDialog: () => {
      setOpen(true);
    },
    closeDialog: (launched) => {
      returnsFocus.current = !launched;
      setOpen(false);
    },
  };
}
