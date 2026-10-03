// The action's side of a launch dialog (`LaunchDialog`): its button, whether
// the dialog is open, and the keyboard's return. A dialog closed without an
// accepted launch returns the keyboard to the button once it can take it
// again: at once, or when a launch still in flight has answered. A dialog
// closed at handoff, whose startup goes on without it while the button is
// unavailable, leaves the keyboard on the startup's status (`handoff`), an
// enabled place that says what is under way; when that startup ends, the
// button takes the keyboard back only if it still rests there
// (`keyboardRestsOn`) and nothing else still holds the button unavailable
// (an open session: Mark as done / Delete place the keyboard themselves).

import { useEffect, useRef, useState, type RefObject } from "react";
import { keyboardRestsOn } from "./launchHandoff.ts";

export function useLaunchDialogLauncher(
  starting: boolean,
  // Where the keyboard goes at handoff while the button is unavailable.
  handoff: () => HTMLElement | null | undefined,
  // Lasting unavailability after startup (open session, unread evidence).
  // While set when startup ends, a deferred reclaim is dropped rather than
  // waiting to fire when it clears.
  heldUnavailable = false,
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
    const blocked = starting || heldUnavailable;
    if (returnsFocus.current === "handoff") {
      returnsFocus.current = "after-startup";
      if (blocked && keyboardRestsOn()) target?.focus();
    }
    if (starting) return;
    const when = returnsFocus.current;
    returnsFocus.current = undefined;
    if (heldUnavailable) return;
    const restsOnHandoff = keyboardRestsOn(target);
    if (when === "at-once" || restsOnHandoff) launcher.current?.focus();
  }, [open, starting, heldUnavailable, handoff]);
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
