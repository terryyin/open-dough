import type { PublishedWork } from "./publishedWork.ts";

// Keyboard focus across a replaced snapshot. A card is rebuilt when its work
// changes group or order, which would drop focus to the page; focus follows
// the work's identity instead, never a position on screen.

// What can hold focus is marked here and nowhere else: the card of one work
// entry, its recorded links by role, and the stages, which receive focus when
// the work that held it is not in the new snapshot. WorkStages spreads these
// marks onto what it renders. A card and the stages are focusable only so
// that focus can be returned to them, so they stay out of the tab order.
const workAttribute = "data-work";
const workLinkAttribute = "data-work-link";
const stagesAttribute = "data-work-stages";

export function workCardMarks(identity: string) {
  return { [workAttribute]: identity, tabIndex: -1 } as const;
}

export function workLinkMarks(role: string) {
  return { [workLinkAttribute]: role } as const;
}

export const stagesMarks = { [stagesAttribute]: true, tabIndex: -1 } as const;

export type FocusedWork = {
  readonly identity: string;
  // The card's accessible name, which WorkStages gives as the work's title.
  readonly title: string;
  // Which recorded link held focus; undefined when the card itself did.
  readonly link: string | undefined;
};

export function focusedWork(): FocusedWork | undefined {
  const focused = document.activeElement;
  const card = focused?.closest<HTMLElement>(`[${workAttribute}]`);
  const identity = card?.getAttribute(workAttribute);
  if (!focused || !card || !identity) {
    return undefined;
  }
  return {
    identity,
    title: card.getAttribute("aria-label") ?? identity,
    link: focused.getAttribute(workLinkAttribute) ?? undefined,
  };
}

// Focus returns to the same link of the same work, or to its card when that
// link is no longer offered. When the work is not shown at all, focus goes to
// the stage so the keyboard position stays inside the work overview.
export function returnFocusTo(held: FocusedWork): void {
  const card = [
    ...document.querySelectorAll<HTMLElement>(`[${workAttribute}]`),
  ].find((shown) => shown.getAttribute(workAttribute) === held.identity);
  if (!card) {
    document.querySelector<HTMLElement>(`[${stagesAttribute}]`)?.focus();
    return;
  }
  const link =
    held.link === undefined
      ? undefined
      : [...card.querySelectorAll<HTMLElement>(`a[${workLinkAttribute}]`)].find(
          (shown) => shown.getAttribute(workLinkAttribute) === held.link,
        );
  (link ?? card).focus();
}

// Membership arrives before derived links. Retain a missing role while its
// preparation loads, only if focus stays on that work's fallback card.
export function restoreSnapshotFocus(
  held: FocusedWork | undefined,
  deferred: FocusedWork | undefined,
  work: PublishedWork | undefined,
): FocusedWork | undefined {
  const current = focusedWork();
  const wanted =
    held ??
    (deferred &&
    current?.identity === deferred.identity &&
    document.activeElement?.hasAttribute(workAttribute)
      ? deferred
      : undefined);
  if (!wanted) return undefined;
  returnFocusTo(wanted);
  const entry = [...(work?.taken ?? []), ...(work?.backlog ?? [])].find(
    (item) => item.identity === wanted.identity,
  );
  return wanted.link !== undefined &&
    focusedWork()?.link === undefined &&
    entry?.preparation?.status === "loading"
    ? wanted
    : undefined;
}
