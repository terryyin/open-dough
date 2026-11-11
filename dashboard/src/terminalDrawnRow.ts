// How tall the terminal draws one row, for what moves or lies by its rows:
// the one-finger swipe (./terminalTouchScroll.ts) and the paused text
// (./terminalText.ts).
import type { Terminal } from "@xterm/xterm";

// Zero while the terminal's element has no height of its own.
export function drawnRowHeight(terminal: Terminal): number {
  return (terminal.element?.clientHeight ?? 0) / terminal.rows;
}
