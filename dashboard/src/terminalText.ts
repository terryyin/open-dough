// What a terminal shows, read as text for the paused text
// (./TerminalPausedText.tsx). The readiness message the attachment sends
// (./attachedTerminal.ts) is a different read with its own contract.
import type { Terminal } from "@xterm/xterm";
import { drawnRowHeight } from "./terminalDrawnRow.ts";

export type ShownTerminalText = {
  // The lines the terminal shows, one per row, each ending at the last cell
  // its application printed.
  readonly text: string;
  // The terminal's own font and row height, so text set with them lies where
  // the terminal showed it.
  readonly fontFamily: string | undefined;
  readonly fontSize: number | undefined;
  readonly rowHeight: number;
};

// Reads the rows the terminal shows now, wherever its scrollback stands and
// whichever screen its application uses. An attachment that ended or
// disconnected still shows its remaining screen.
export function shownTerminalText(terminal: Terminal): ShownTerminalText {
  const buffer = terminal.buffer.active;
  const { fontFamily, fontSize } = terminal.options;
  return {
    text: Array.from(
      { length: terminal.rows },
      (...[, row]) =>
        buffer.getLine(buffer.viewportY + row)?.translateToString(true) ?? "",
    ).join("\n"),
    fontFamily,
    fontSize,
    rowHeight: drawnRowHeight(terminal),
  };
}
