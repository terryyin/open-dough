// The action's side of a launch dialog (`LaunchDialog`): its button, whether
// the dialog is open, and the keyboard's return. A dialog closed without an
// accepted launch returns the keyboard to the button once it can take it
// again: at once, or when a launch still in flight has answered, unless the
// developer has moved the keyboard elsewhere meanwhile. A dialog
// closed at handoff, whose startup goes on without it while the button is
// unavailable, leaves the keyboard on the startup's status (`handoff`), an
// enabled place that says what is under way; when that startup ends, the
// button takes the keyboard back only if it still rests there
// (`keyboardRestsOn`) and nothing else still holds the button unavailable
// (an open session: Mark as done / Delete place the keyboard themselves).
// The keyboard is placed as the change is committed, before anything
// around the action sees the status gone and takes the keyboard for itself
// (Recently done's entry, `./recentlyDoneFocus.ts`).
// Each opening mounts its own dialog. A dialog closes in the browser before
// its close event reports it, so the button can be pressed again in between;
// that press opens a new dialog, and the earlier one's late close is ignored.

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { keyboardRestsOn } from "./launchHandoff.ts";

// Open on keydown so a same-turn Board re-render after modal focus return
// cannot drop the platform's Enter/Space click synthesis.
export function openDialogFromActivation(
  open: () => void,
  blocked = false,
): {
  readonly onClick: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
} {
  return {
    onClick: open,
    onKeyDown: (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      if (blocked || event.repeat) return;
      event.preventDefault();
      open();
    },
  };
}

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
  // The open dialog's opening, which keys it; none while closed.
  readonly opening: number | undefined;
  readonly openDialog: () => void;
  // Closes the dialog of `opening`, saying whether the launch was accepted;
  // false, changing nothing, when a later opening has replaced it.
  readonly closeDialog: (opening: number, accepted: boolean) => boolean;
} {
  const launcher = useRef<HTMLButtonElement>(null);
  const openings = useRef(0);
  const [opening, setOpening] = useState<number>();
  const open = opening !== undefined;
  const returnsFocus = useRef<
    "at-once" | "handoff" | "after-startup" | undefined
  >(undefined);
  useLayoutEffect(() => {
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
    // The return follows the dialog's close event, after the developer may
    // already have moved the keyboard on; it moves the keyboard only from
    // where the closing left it. A same-turn Board update after the modal
    // unmounts can steal activation from a lone layout focus, so reclaim
    // once more after that turn if the keyboard still rests here.
    const button = launcher.current;
    const rests =
      when === "at-once" ? keyboardRestsOn(button) : keyboardRestsOn(target);
    if (!rests) return;
    button?.focus();
    queueMicrotask(() => {
      if (keyboardRestsOn(button)) button?.focus();
    });
  }, [open, starting, heldUnavailable, handoff]);
  return {
    launcher,
    opening,
    openDialog: () => {
      openings.current += 1;
      setOpening(openings.current);
    },
    closeDialog: (closing, accepted) => {
      if (closing !== openings.current) return false;
      returnsFocus.current = accepted ? "handoff" : "at-once";
      setOpening(undefined);
      return true;
    },
  };
}
