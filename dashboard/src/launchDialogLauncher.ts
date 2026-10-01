// The action's side of a launch dialog (`LaunchDialog`): its button, whether
// the dialog is open, and the keyboard's return. A dialog closed without an
// accepted launch returns the keyboard to the button once it can take it
// again: at once, or when a launch still in flight has answered. A dialog
// closed at handoff, whose startup goes on without it while the button is
// unavailable, leaves the keyboard on the startup's status (`handoff`), an
// enabled place that says what is under way; when that startup ends, the
// button takes the keyboard back only if it still rests there
// (`keyboardRestsOn`).

import { useEffect, useRef, useState, type RefObject } from "react";
import { keyboardRestsOn } from "./launchHandoff.ts";

export function useLaunchDialogLauncher(
  starting: boolean,
  // Where the keyboard goes at handoff while the button is unavailable.
  handoff: () => HTMLElement | null | undefined,
): {
  readonly launcher: RefObject<HTMLButtonElement | null>;
  readonly open: boolean;
  readonly openDialog: () => void;
  // Whether the launch was accepted.
  readonly closeDialog: (accepted: boolean) => void;
} {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const returnsFocus = useRef<
    "at-once" | "handoff" | "after-startup" | undefined
  >(undefined);
  useEffect(() => {
    if (open || returnsFocus.current === undefined) return;
    const target = handoff();
    if (returnsFocus.current === "handoff") {
      returnsFocus.current = "after-startup";
      if (starting && keyboardRestsOn()) target?.focus();
    }
    if (starting) return;
    const restsOnHandoff = keyboardRestsOn(target);
    const when = returnsFocus.current;
    returnsFocus.current = undefined;
    if (when === "at-once" || restsOnHandoff) launcher.current?.focus();
  }, [open, starting, handoff]);
  return {
    launcher,
    open,
    openDialog: () => {
      setOpen(true);
    },
    closeDialog: (accepted) => {
      returnsFocus.current = accepted ? "handoff" : "at-once";
      setOpen(false);
    },
  };
}
