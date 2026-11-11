// Everything a terminal holds, read as text for the paused text
// (./TerminalPausedText.tsx), with the place the terminal shows. The
// readiness message the attachment sends (./attachedTerminal.ts) is a
// different read with its own contract.
import type { Terminal } from "@xterm/xterm";
import { drawnRowHeight } from "./terminalDrawnRow.ts";

export type HeldTerminalRow = {
  // The row up to the last cell its application printed.
  readonly text: string;
  // Whether the terminal wrapped this row from the one before, so that it
  // continues that row's line. A break an application drew starts a line.
  readonly continues: boolean;
};

export type HeldTerminalText = {
  // Every row the terminal holds, earliest first: the scrollback it keeps,
  // then its screen. Joined as lines they are the text the terminal's own
  // selection of them copies.
  readonly rows: readonly HeldTerminalRow[];
  // The first of those rows the terminal shows, and how many it shows.
  readonly firstShown: number;
  readonly shownRows: number;
  // The terminal's own font and row height, so text set with them lies where
  // the terminal showed it.
  readonly fontFamily: string | undefined;
  readonly fontSize: number | undefined;
  readonly rowHeight: number;
};

// Reads what the terminal holds now, wherever its scrollback stands. An
// application that has taken over the screen leaves that screen and no
// scrollback to hold. An attachment that ended or disconnected still holds
// what it showed.
export function heldTerminalText(terminal: Terminal): HeldTerminalText {
  const buffer = terminal.buffer.active;
  const { fontFamily, fontSize } = terminal.options;
  return {
    rows: Array.from({ length: buffer.length }, (...[, row]) => {
      const line = buffer.getLine(row);
      return {
        text: line?.translateToString(true) ?? "",
        continues: line?.isWrapped ?? false,
      };
    }),
    firstShown: buffer.viewportY,
    shownRows: terminal.rows,
    fontFamily,
    fontSize,
    rowHeight: drawnRowHeight(terminal),
  };
}
