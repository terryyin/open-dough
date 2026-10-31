// Keep a chosen part of the page readable while layout and native scrolling
// settle, until the developer moves around the page themselves.
import { readingBounds } from "./boardScroll.ts";
import { showColumnHolding } from "./columnPaging.ts";
import { prefersReducedMotion } from "./reducedMotion.ts";

// What tells that the developer moved around the page themselves.
const ownMoves = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

// Scrolls a part of the page, such as a work's card, into view, smoothly or,
// when the developer asks for reduced motion, at once, leaving the keyboard
// where it is; a Board Column that hides it shows first. It keeps the
// part's beginning in view while the page changes size around it, as when
// facts read after the stories lengthen the cards above it, until the developer
// scrolls, points, types, moves the keyboard elsewhere on the Board, or the
// returned stop is called.
export function keepInView(element: Element): () => void {
  const content = element.closest(".board-row") ?? element;
  const region = element.closest(".board-scroll, .roster-scroll");
  const show = () => {
    window.addEventListener("scroll", progressed, true);
    window.addEventListener("scrollend", settled, true);
    showColumnHolding(element);
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const regionEl = element.closest<HTMLElement>(
      ".board-scroll, .roster-scroll",
    );
    if (
      regionEl !== null &&
      document.querySelector(".page-maximized") !== null
    ) {
      // While maximized/covering, prefer scrollTop so the reading edge is set
      // even when scrollIntoView is unreliable against the hidden page column.
      const at = element.getBoundingClientRect();
      const bounds = readingBounds(element);
      const margin =
        Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
      const top = Math.max(
        0,
        regionEl.scrollTop + (at.top - bounds.top - margin),
      );
      regionEl.scrollTop = top;
      element.scrollIntoView({ block: "nearest", behavior: "auto" });
    } else {
      element.scrollIntoView({ block: "start", behavior });
    }
    progressed();
  };
  // The page's size as the part was brought into view; only a change from it
  // moves the page again, including one already made when observing first
  // reports it, as when a hidden column shows.
  const sizeOf = () => {
    return [content, region]
      .map((part) => {
        const at = part?.getBoundingClientRect();
        return `${String(at?.width)} ${String(at?.height)}`;
      })
      .join(" ");
  };
  const readable = () => {
    const at = element.getBoundingClientRect();
    const bounds = readingBounds(element);
    const visibleOn = (start: number, end: number, low: number, high: number) =>
      ((start + end) / 2 >= low && (start + end) / 2 <= high) ||
      (start <= low && end >= high);
    return (
      at.top >= bounds.top &&
      at.top <= bounds.bottom &&
      visibleOn(at.left, at.right, bounds.left, bounds.right)
    );
  };
  const stopSettling = () => {
    window.removeEventListener("scroll", progressed, true);
    window.removeEventListener("scrollend", settled, true);
  };
  const progressed = () => {
    if (readable()) stopSettling();
  };
  const settled = () => {
    if (readable()) stopSettling();
    else show();
  };
  let size = sizeOf();
  // A new reveal may race the completion of an earlier native scroll. Keep
  // following completion until it first reaches a reading place. Later
  // navigation can then scroll to its next control before its input arrives.
  show();
  const resized = new ResizeObserver(() => {
    const now = sizeOf();
    if (now === size) return;
    size = now;
    show();
  });
  resized.observe(content);
  if (region) resized.observe(region);
  // Focus elsewhere on the Board (as when Inspect receives the keyboard after
  // Mark as done homed here) ends keeping: otherwise showColumnHolding keeps
  // pulling this part back and the new focus can stay clipped in a hidden
  // column. Focus returned to banner chrome (Sessions after Close) is not a
  // Board move; keep following layout through covering→Close so the reading
  // place lands. Pointer and keys inside the Side panel (including Close) are
  // likewise not the developer's Board move.
  const inSidePanel = (target: EventTarget | null) =>
    target instanceof Element && target.closest(".side-panel") !== null;
  const onBoard = (target: EventTarget | null) =>
    target instanceof Element &&
    target.closest(".board-scroll, .roster-scroll") !== null;
  let stopOwn = () => {};
  const stopKeeping = () => {
    stopSettling();
    resized.disconnect();
    window.removeEventListener("focusin", focusMoved, true);
  };
  const end = () => {
    stopOwn();
    stopKeeping();
  };
  const focusMoved = (event: FocusEvent) => {
    const next = event.target;
    if (next instanceof Node && element.contains(next)) return;
    if (inSidePanel(next) || !onBoard(next)) return;
    end();
  };
  window.addEventListener("focusin", focusMoved, true);
  stopOwn = untilOwnMove(stopKeeping, (event) => inSidePanel(event.target));
  return end;
}

// Calls `moved` once the developer scrolls, points, or types, unless the
// returned stop is called first.
export function untilOwnMove(
  moved: (event: Event) => void,
  except?: (event: Event) => boolean,
): () => void {
  const stop = () => {
    for (const move of ownMoves) {
      window.removeEventListener(move, heard, true);
    }
  };
  const heard = (event: Event) => {
    if (except?.(event) === true) return;
    stop();
    moved(event);
  };
  for (const move of ownMoves) {
    window.addEventListener(move, heard, true);
  }
  return stop;
}
