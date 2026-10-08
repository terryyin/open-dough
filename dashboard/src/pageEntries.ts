// The entries the keyboard can be put on in the page's lists, by the marks
// that name them: a session entry by its session, a done story's card by its
// story, and a work card by its work. With them the page finds an entry again
// once it has rendered the list anew: to bring a session's entry into view,
// to give the keyboard a home once an entry is deleted, and to keep Recently
// done's entry holding the keyboard across a refresh
// (`./recentlyDoneFocus.ts`).

import type { HeldEntry } from "./recentlyDoneRange.ts";
import { workCard } from "./workFocus.ts";

// The attribute by which a session entry names the session it shows.
const showsSessionAttribute = "data-shows-session";

export function showsSession(sessionKey: string) {
  return { [showsSessionAttribute]: sessionKey };
}

// The attribute by which a done story's card in Recently done names its
// story. The card is focusable only so the keyboard can be put on it, so it
// stays out of the tab order.
const doneStoryAttribute = "data-done-story";

export function doneStoryMarks(identity: string) {
  return { [doneStoryAttribute]: identity, tabIndex: -1 } as const;
}

// What the keyboard can be put on in a list of entries: a session entry by its
// session, or a done story's card by its story, so it is found again once the
// page has rendered the list anew.
type Entry = { readonly attribute: string; readonly value: string };

const entryMarks = [
  showsSessionAttribute,
  doneStoryAttribute,
  "data-work",
] as const;

// The entry an element is, by its mark.
function entryOf(element: Element | null | undefined): Entry | undefined {
  for (const attribute of entryMarks) {
    const value = element?.getAttribute(attribute);
    if (value !== null && value !== undefined) return { attribute, value };
  }
  return undefined;
}

// The entry beside the one a control is in, in the same list: a card's
// sessions, a done story's sessions, or either standalone column list, where
// a story card is an entry as a session is. The nearest after it, else the
// nearest before it; with none, the done story's card holding the list, for
// the last of its sessions. A list item's entry is its first marked element,
// which for a done story's card is the card, not a session inside it.
function entryBeside(control: HTMLElement): Entry | undefined {
  const item = control.closest("li");
  const marked = entryMarks.map((attribute) => `[${attribute}]`).join(", ");
  for (const step of [
    "nextElementSibling",
    "previousElementSibling",
  ] as const) {
    for (let sibling = item?.[step]; sibling; sibling = sibling[step]) {
      const entry = entryOf(sibling.querySelector(marked));
      if (entry !== undefined) return entry;
    }
  }
  return entryOf(item?.closest(`[${doneStoryAttribute}]`));
}

// The marked entry within the list or column that contained the operation.
function entryShown(
  entry: Entry | undefined,
  within: string,
): HTMLElement | null {
  return entry === undefined
    ? null
    : document.querySelector<HTMLElement>(
        `${within} [${entry.attribute}="${CSS.escape(entry.value)}"]`,
      );
}

// Where the keyboard goes once the entry a control is in is deleted: the entry
// beside it while the page still shows it (`entryBeside`), else its story's
// card (for a card's entry) or the containing column. Read the neighbours before the
// delete; the answer is looked up afterwards.
export function deletedEntryHome(
  control: HTMLElement,
  identity: string | undefined,
): () => HTMLElement | null {
  const beside = entryBeside(control);
  const column =
    control.closest(".recently-done") !== null
      ? ".recently-done"
      : `.stage[aria-labelledby="${control.closest(".stage")?.getAttribute("aria-labelledby")}"]`;
  const within =
    control.closest(".card-sessions") !== null ? ".card-sessions" : column;
  return () =>
    entryShown(beside, within) ??
    (identity === undefined ? undefined : workCard(identity)) ??
    document.querySelector<HTMLElement>(column);
}

// The Recently done entry an element is in: the nearest session entry or done
// story's card holding it, and that entry while Recently done shows it.
export function heldEntryOf(element: Element): HeldEntry | undefined {
  const entry = entryOf(
    element.closest(`[${showsSessionAttribute}], [${doneStoryAttribute}]`),
  );
  if (entry === undefined) return undefined;
  return entry.attribute === doneStoryAttribute
    ? { story: entry.value }
    : { session: entry.value };
}

export const heldEntryShown = (held: HeldEntry) =>
  entryShown(
    held.story === undefined
      ? { attribute: showsSessionAttribute, value: held.session }
      : { attribute: doneStoryAttribute, value: held.story },
    ".recently-done",
  );

// The actual entry across all dashboard columns. The sidebar is navigation,
// so it does not compete with the session's one column home.
export function sessionEntry(sessionKey: string): HTMLElement | null {
  return entryShown(
    { attribute: showsSessionAttribute, value: sessionKey },
    ".dashboard-columns",
  );
}
