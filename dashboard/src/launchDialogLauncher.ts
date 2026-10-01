// The action's side of a launch dialog (`LaunchDialog`): its button, whether
// the dialog is open, and the keyboard's return. A closed dialog returns the
// keyboard to the button once it can take it again: at once, or when a
// launch still in flight has answered. After an accepted launch, whose
// startup goes on without the dialog, the button takes the keyboard back
// when that startup ends only if nothing else took it meanwhile.

import { useEffect, useRef, useState, type RefObject } from "react";

// Whether the keyboard is on no control of the page.
const keyboardIsFree = () =>
  document.activeElement === null || document.activeElement === document.body;

export function useLaunchDialogLauncher(starting: boolean): {
  readonly launcher: RefObject<HTMLButtonElement | null>;
  readonly open: boolean;
  readonly openDialog: () => void;
  // Whether the launch was accepted.
  readonly closeDialog: (accepted: boolean) => void;
} {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const returnsFocus = useRef<"at-once" | "if-free" | undefined>(undefined);
  useEffect(() => {
    if (!open && !starting && returnsFocus.current !== undefined) {
      const when = returnsFocus.current;
      returnsFocus.current = undefined;
      if (when === "at-once" || keyboardIsFree()) launcher.current?.focus();
    }
  }, [open, starting]);
  return {
    launcher,
    open,
    openDialog: () => {
      setOpen(true);
    },
    closeDialog: (accepted) => {
      returnsFocus.current = accepted ? "if-free" : "at-once";
      setOpen(false);
    },
  };
}
