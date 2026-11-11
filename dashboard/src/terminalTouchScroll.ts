import type { Terminal } from "@xterm/xterm";
import { drawnRowHeight } from "./terminalDrawnRow.ts";

// Pointer tracking in which the session's application takes the wheel.
const wheelTracking: readonly string[] = ["vt200", "drag", "any"];

type Place = { readonly x: number; readonly y: number };

// Gives xterm one wheel step per row at `place`, which it reports to the
// application in the form the application asked for. The steps are given to
// xterm's own element and do not bubble to the page around it.
function wheelAt(terminal: Terminal, rows: number, place: Place) {
  for (let step = 0; step < Math.abs(rows); step += 1) {
    terminal.element?.dispatchEvent(
      new WheelEvent("wheel", {
        clientX: place.x,
        clientY: place.y,
        deltaY: Math.sign(rows),
        deltaMode: WheelEvent.DOM_DELTA_LINE,
        cancelable: true,
      }),
    );
  }
}

// One-finger movement scrolls the output wherever it is held, instead of the
// surrounding page. While the terminal reports that the session's application
// takes the wheel, each row of travel is one wheel step where the finger went
// down. In every other state it moves the terminal's own scrollback, since
// xterm turns a wheel on the alternate screen into arrow keys. Keep partial
// rows between moves, and leave multi-touch gestures to the browser.
export function listenToTerminalTouchScroll(
  screen: HTMLElement,
  terminal: Terminal,
): () => void {
  // Where the finger went down, and where it was last seen.
  let finger: { readonly down: Place; y: number } | undefined;
  let touchDistance = 0;
  const touchStarted = (event: TouchEvent) => {
    const touch = event.touches.length === 1 ? event.touches[0] : undefined;
    finger = touch && {
      down: { x: touch.clientX, y: touch.clientY },
      y: touch.clientY,
    };
    touchDistance = 0;
  };
  const touchMoved = (event: TouchEvent) => {
    const touch = event.touches.length === 1 ? event.touches[0] : undefined;
    if (finger === undefined || touch === undefined) {
      finger = undefined;
      return;
    }
    const rowHeight = drawnRowHeight(terminal);
    if (rowHeight <= 0) return;
    const distance = finger.y - touch.clientY;
    if (distance === 0) return;
    touchDistance += distance;
    finger.y = touch.clientY;
    const rows = Math.trunc(touchDistance / rowHeight);
    if (rows !== 0) {
      if (wheelTracking.includes(terminal.modes.mouseTrackingMode)) {
        wheelAt(terminal, rows, finger.down);
      } else {
        terminal.scrollLines(rows);
      }
      touchDistance -= rows * rowHeight;
    }
    event.preventDefault();
  };
  const touchEnded = () => {
    finger = undefined;
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
