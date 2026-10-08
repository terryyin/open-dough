// The keyboard in Recently done's list across a refresh. The entry holding it
// is noted on the page's range (`./recentlyDoneRange.ts`), which keeps it
// shown wherever a refresh places it (`./recentlyDoneView.ts`), until the
// keyboard moves elsewhere on the page. When a refresh removes that entry,
// the keyboard goes to the entry holding its session, if a done story's card
// now does, else to the entry that took its place, else to the last entry
// shown, else to the start of Recently done; never to the page itself.

import {
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type RefObject,
} from "react";
import { heldEntryOf, heldEntryShown } from "./pageEntries.ts";
import type { HeldEntry } from "./recentlyDoneRange.ts";

const keyboardLeftThePage = () =>
  document.activeElement === null || document.activeElement === document.body;

// The list's focus handlers, given the entry `held` as the list's view says,
// noted with `hold`, and the Recently done `section`.
export function useHeldEntryFocus(
  {
    held,
    hold,
  }: {
    readonly held: HeldEntry | undefined;
    readonly hold: (entry: HeldEntry | undefined) => void;
  },
  section: RefObject<HTMLElement | null>,
) {
  const list = useRef<HTMLOListElement>(null);
  // What held the keyboard, and the place among the shown entries of the
  // entry holding it, as of the last time either was seen.
  const holder = useRef<Element | null>(null);
  const place = useRef(0);

  useLayoutEffect(() => {
    const element = holder.current;
    if (held === undefined || element === null) return;
    const entries = [...(list.current?.children ?? [])];
    const shownEntry = heldEntryShown(held);
    const at = entries.findIndex(
      (item) => shownEntry !== null && item.contains(shownEntry),
    );
    if (at >= 0) place.current = at;
    if (element.isConnected || !keyboardLeftThePage()) return;
    const home =
      shownEntry ??
      entries[
        Math.min(place.current, entries.length - 1)
      ]?.querySelector<HTMLElement>("article");
    if (home !== null && home !== undefined) {
      home.focus();
      return;
    }
    holder.current = null;
    hold(undefined);
    section.current?.focus();
  });

  return {
    ref: list,
    onFocus: (event: FocusEvent) => {
      holder.current = event.target;
      hold(heldEntryOf(event.target));
    },
    onBlur: (event: FocusEvent) => {
      const left = event.target;
      const next = event.relatedTarget;
      if (next instanceof Node && list.current?.contains(next)) return;
      // An entry a refresh removed takes the keyboard with it; the list
      // keeps it then. Anything else is the developer moving it.
      setTimeout(() => {
        if (!left.isConnected) return;
        if (list.current?.contains(document.activeElement) === true) return;
        hold(undefined);
      });
    },
  };
}
