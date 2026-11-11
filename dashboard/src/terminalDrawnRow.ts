// How tall the terminal draws one row, for what moves or lies by its rows:
// the one-finger swipe (./terminalTouchScroll.ts) and the paused text
// (./terminalText.ts).
import type { Terminal } from "@xterm/xterm";

// Read from the rows as the terminal laid them out, where it draws them as
// elements: their height is often not a whole pixel, while the terminal
// rounds its own element to one. Zero while the terminal's element has no
// height of its own.
export function drawnRowHeight(terminal: Terminal): number {
  const drawn =
    terminal.element?.querySelector(".xterm-rows") ?? terminal.element;
  return (drawn?.getBoundingClientRect().height ?? 0) / terminal.rows;
}
