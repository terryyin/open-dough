import { useLayoutEffect, useRef } from "react";

const isHorizontal = (x: number, y: number) => Math.abs(x) > Math.abs(y) * 1.3;

// Recognize a completed, single-finger Board swipe. Paging owns the position;
// this owner only separates deliberate horizontal browsing from vertical reading.
export function useBoardSwipe(move: (step: 1 | -1) => void) {
  const view = useRef<HTMLDivElement>(null);
  const suppressClickUntil = useRef(0);
  useLayoutEffect(() => {
    const area = view.current;
    if (!area) return undefined;
    let finger:
      { id: number; x: number; y: number; horizontal?: boolean } | undefined;
    const start = (event: TouchEvent) => {
      suppressClickUntil.current = 0;
      const touch = event.touches[0];
      finger =
        event.touches.length === 1 && touch
          ? { id: touch.identifier, x: touch.clientX, y: touch.clientY }
          : undefined;
    };
    const drag = (event: TouchEvent) => {
      if (!finger) return;
      if (event.touches.length !== 1) {
        finger = undefined;
        return;
      }
      const touch = event.touches[0];
      if (!touch || touch.identifier !== finger.id) return;
      const x = Math.abs(touch.clientX - finger.x);
      const y = Math.abs(touch.clientY - finger.y);
      if (finger.horizontal === undefined && Math.max(x, y) >= 12)
        finger.horizontal = isHorizontal(x, y);
      if (finger.horizontal && event.cancelable) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      const begun = finger;
      finger = undefined;
      if (!begun?.horizontal) return;
      const touch = [...event.changedTouches].find(
        ({ identifier }) => identifier === begun.id,
      );
      if (!touch) return;
      const x = touch.clientX - begun.x;
      const y = touch.clientY - begun.y;
      if (event.cancelable) event.preventDefault();
      suppressClickUntil.current = performance.now() + 500;
      if (Math.abs(x) >= 48 && isHorizontal(x, y)) move(x < 0 ? 1 : -1);
    };
    const cancel = () => {
      finger = undefined;
    };
    const click = (event: MouseEvent) => {
      // A browser compatibility click belongs to the swipe, never its card.
      // Keyboard activation (detail zero) and the next ordinary tap stay usable.
      if (event.detail > 0 && performance.now() < suppressClickUntil.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    area.addEventListener("touchstart", start, { passive: true });
    area.addEventListener("touchmove", drag, { passive: false });
    area.addEventListener("touchend", end, { passive: false });
    area.addEventListener("touchcancel", cancel);
    area.addEventListener("click", click, true);
    return () => {
      area.removeEventListener("touchstart", start);
      area.removeEventListener("touchmove", drag);
      area.removeEventListener("touchend", end);
      area.removeEventListener("touchcancel", cancel);
      area.removeEventListener("click", click, true);
    };
  }, [move]);
  return view;
}
