import { showColumnHolding } from "./columnPaging.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { prefersReducedMotion } from "./reducedMotion.ts";

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
  // Captured before a snapshot update; a reader can scroll away while leaving
  // the keyboard on a control. Only a visible reading place is kept in view.
  readonly visible?: boolean;
};

export function focusedWork(): FocusedWork | undefined {
  const focused = document.activeElement;
  const work = focused ? workHolding(focused) : undefined;
  return work && focused ? { ...work, visible: inView(focused) } : undefined;
}

function inView(element: Element): boolean {
  const at = element.getBoundingClientRect();
  const padding = getComputedStyle(document.documentElement);
  return (
    at.height > 0 &&
    at.top >= Number.parseFloat(padding.scrollPaddingTop) &&
    at.bottom <= innerHeight - Number.parseFloat(padding.scrollPaddingBottom) &&
    at.left >= 0 &&
    at.right <= innerWidth
  );
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
// where it is; a dashboard column that hides it shows first. It keeps the
// part in view while the page changes size around it, as when facts read
// after the stories lengthen the cards above it, until the developer
// scrolls, points, or types, or the returned stop is called.
export function keepInView(element: Element): () => void {
  const show = () => {
    showColumnHolding(element);
    element.scrollIntoView({
      block: "center",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };
  // The page's size as the part was brought into view; only a change from it
  // moves the page again, including one already made when observing first
  // reports it, as when a hidden column shows.
  const sizeOf = () => {
    const { width, height } = document.body.getBoundingClientRect();
    return `${String(width)} ${String(height)}`;
  };
  let size = sizeOf();
  show();
  const resized = new ResizeObserver(() => {
    const now = sizeOf();
    if (now === size) return;
    size = now;
    show();
  });
  resized.observe(document.body);
  const stop = untilOwnMove(() => {
    resized.disconnect();
  });
  return () => {
    resized.disconnect();
    stop();
  };
}

// Calls `moved` once the developer scrolls, points, or types, unless the
// returned stop is called first.
export function untilOwnMove(moved: () => void): () => void {
  const stop = () => {
    for (const move of ownMoves) {
      window.removeEventListener(move, heard, true);
    }
  };
  const heard = () => {
    stop();
    moved();
  };
  for (const move of ownMoves) {
    window.addEventListener(move, heard, true);
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
  stages()?.focus();
}

const stages = () =>
  document.querySelector<HTMLElement>(`[${stagesAttribute}]`);

// Where the keyboard is useful once what held it left the page: the work's
// card while the page shows it, else the stages.
export function workHome(identity: string | undefined): HTMLElement | null {
  return (identity === undefined ? undefined : workCard(identity)) ?? stages();
}

// A snapshot can name a work before its derived links: a new revision keeps
// the shown preparation (`./carriedFacts.ts`), so a link goes missing only
// while preparation is still unanswered there too. Retain a missing role
// while its preparation loads, only if focus stays on that work's fallback
// card.
export function restoreSnapshotFocus(
  held: FocusedWork | undefined,
  deferred: FocusedWork | undefined,
  work: PublishedWork | undefined,
): FocusedWork | undefined {
  const current = focusedWork();
  // Enrichment captures the fallback card too. While the keyboard remains on
  // that card, keep the original deferred link as its intended destination.
  const wanted =
    (deferred &&
    current?.identity === deferred.identity &&
    document.activeElement?.hasAttribute(workAttribute)
      ? deferred
      : undefined) ?? held;
  if (!wanted) return undefined;
  // Focus captured with the snapshot is applied only once it renders, so the
  // developer may have moved it meanwhile. Focus they still hold anywhere but
  // the work's card itself stays, whether on a control within that card kept
  // across the snapshot or elsewhere on the page; only focus dropped to the
  // page or left on the fallback card returns to the wanted place.
  const card = workCard(wanted.identity);
  const kept = document.activeElement;
  if (kept !== null && kept !== document.body && kept !== card) {
    // The same control can keep focus yet be pushed out of view by new facts.
    // Reveal only what the reader could see before this update, and move only
    // far enough to keep it readable below the pinned banner.
    if (wanted.visible === true && card?.contains(kept) && !inView(kept)) {
      kept.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
    }
    return undefined;
  }
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
