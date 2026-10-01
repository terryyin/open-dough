import type { PublishedWork } from "./publishedWork.ts";

// Keyboard focus across a replaced snapshot. A card is rebuilt when its work
// changes group or order, which would drop focus to the page; focus follows
// the work's identity instead, never a position on screen. The same marks
// find a work's card to bring into view (`workCard`, `keepInView`).

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
  return focused ? workHolding(focused) : undefined;
}

// The work whose card holds `focused`, as focus on it would be held.
export function workHolding(focused: Element): FocusedWork | undefined {
  const card = focused.closest<HTMLElement>(`[${workAttribute}]`);
  const identity = card?.getAttribute(workAttribute);
  if (!card || !identity) {
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
  const card = workCard(held.identity);
  if (!card) {
    focusStages();
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

// The work's card, while the page shows it.
export function workCard(identity: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(`[${workAttribute}]`)].find(
    (shown) => shown.getAttribute(workAttribute) === identity,
  );
}

// What tells that the developer moved around the page themselves.
const ownMoves = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

// Scrolls a part of the page, such as a work's card, into view, smoothly or,
// when the developer asks for reduced motion, at once, leaving the keyboard
// where it is. It keeps the part in view while the page changes size around
// it, as when facts read after the stories lengthen the cards above it,
// until the developer scrolls, points, or types, or the returned stop is
// called.
export function keepInView(element: Element): () => void {
  const show = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollIntoView({
      block: "center",
      behavior: reduced ? "auto" : "smooth",
    });
  };
  show();
  let observed = false;
  const resized = new ResizeObserver(() => {
    // Observing reports the page's size once; only later changes move it.
    if (observed) show();
    observed = true;
  });
  resized.observe(document.body);
  const stop = () => {
    resized.disconnect();
    for (const move of ownMoves) {
      window.removeEventListener(move, stop, true);
    }
  };
  for (const move of ownMoves) {
    window.addEventListener(move, stop, true);
  }
  return stop;
}

// Said once when a new snapshot no longer lists the work that held focus.
export function unlistedNotice(
  held: FocusedWork | undefined,
  work: PublishedWork,
): string {
  return held &&
    ![...work.taken, ...work.backlog].some(
      (entry) => entry.identity === held.identity,
    )
    ? `${held.title} is no longer listed in the published work.`
    : "";
}

// The stages hold the keyboard position when no particular work does.
export function focusStages(): void {
  document.querySelector<HTMLElement>(`[${stagesAttribute}]`)?.focus();
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
  // Focus still within the work's card, kept across the snapshot, stays.
  const kept = document.activeElement;
  if (
    held !== undefined &&
    kept !== null &&
    kept !== workCard(wanted.identity) &&
    workCard(wanted.identity)?.contains(kept) === true
  )
    return undefined;
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
