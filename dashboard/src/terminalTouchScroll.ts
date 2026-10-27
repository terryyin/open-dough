import type { Terminal } from "@xterm/xterm";

// The terminal scrollbar handles wheel input; one-finger movement needs to
// move its own scrollback instead of the surrounding page. Keep partial
// rows between moves, and leave multi-touch gestures to the browser.
export function listenToTerminalTouchScroll(
  screen: HTMLElement,
  terminal: Terminal,
): () => void {
  let touchY: number | undefined;
  let touchDistance = 0;
  const touchStarted = (event: TouchEvent) => {
    touchY = event.touches.length === 1 ? event.touches[0]?.clientY : undefined;
    touchDistance = 0;
  };
  const touchMoved = (event: TouchEvent) => {
    const finger = event.touches.length === 1 ? event.touches[0] : undefined;
    if (touchY === undefined || finger === undefined) {
      touchY = undefined;
      return;
    }
    const rowHeight = (terminal.element?.clientHeight ?? 0) / terminal.rows;
    if (rowHeight <= 0) return;
    const distance = touchY - finger.clientY;
    if (distance === 0) return;
    touchDistance += distance;
    touchY = finger.clientY;
    const rows = Math.trunc(touchDistance / rowHeight);
    if (rows !== 0) {
      terminal.scrollLines(rows);
      touchDistance -= rows * rowHeight;
    }
    event.preventDefault();
  };
  const touchEnded = () => {
    touchY = undefined;
  };
  screen.addEventListener("touchstart", touchStarted, { passive: true });
  screen.addEventListener("touchmove", touchMoved, { passive: false });
  screen.addEventListener("touchend", touchEnded);
  screen.addEventListener("touchcancel", touchEnded);
  return () => {
    screen.removeEventListener("touchstart", touchStarted);
    screen.removeEventListener("touchmove", touchMoved);
    screen.removeEventListener("touchend", touchEnded);
    screen.removeEventListener("touchcancel", touchEnded);
  };
}
