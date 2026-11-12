// The terminal's output paused as ordinary page text, so a phone's own
// selection and Copy work on it: the output counterpart of the composer
// (./TerminalComposer.tsx). Select on the key toolbar (./TerminalKeyToolbar.tsx)
// pauses and returns. Pausing reads everything the terminal holds once and
// keeps it; the live terminal stays attached and sized beneath, so pausing
// and returning send the session nothing and output that arrives meanwhile
// shows on return. The text lies over the screen, outside it, where
// one-finger movement is the browser's own and not the terminal's swipe
// (./terminalTouchScroll.ts): it scrolls through what the terminal holds and
// opens with the rows the terminal shows where the terminal shows them. Every
// row is set where the terminal drew it, and a row the terminal wrapped
// continues its line without a line break in the text, so the line copies
// whole. It adds no selection, highlight, Copy control or announcement of its
// own.

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import "./terminal-paused-text.css";
import type { HeldTerminalRow, HeldTerminalText } from "./terminalText.ts";

// `read` gives what the terminal holds now, or nothing when no terminal is
// mounted; Select then stays off.
export function usePausedTerminalText(
  read: () => HeldTerminalText | undefined,
) {
  const [paused, setPaused] = useState<HeldTerminalText>();
  return {
    paused,
    pauseOrReturn: () => {
      setPaused(paused === undefined ? read() : undefined);
    },
  };
}

// Rows `from` to before `to` as page text. A row ends in a line break or,
// where the terminal wrapped it into the next, in a break that is drawn and
// not text.
function rowsAsText(
  rows: readonly HeldTerminalRow[],
  from: number,
  to: number,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let text = "";
  for (let row = from; row < to; row += 1) {
    text += rows[row]?.text ?? "";
    const next = rows[row + 1];
    if (next?.continues) {
      parts.push(text, <span key={row} className="terminal-paused-wrap" />);
      text = "";
    } else if (next !== undefined) text += "\n";
  }
  return [...parts, text];
}

export function TerminalPausedText({
  paused,
}: {
  readonly paused: HeldTerminalText | undefined;
}) {
  const text = useRef<HTMLPreElement>(null);
  const firstRow = useRef<HTMLSpanElement>(null);
  const firstShownRow = useRef<HTMLSpanElement>(null);
  // Once laid out, the text opens at the rows the terminal shows. Where the
  // browser set a row is measured, since any difference between the height it
  // gives a row and the terminal's adds up over a long scrollback. Browsers
  // scroll by whole pixels.
  useLayoutEffect(() => {
    const top = (row: RefObject<HTMLSpanElement | null>) =>
      row.current?.getBoundingClientRect().top ?? 0;
    if (text.current !== null && paused !== undefined)
      text.current.scrollTop = Math.round(top(firstShownRow) - top(firstRow));
  }, [paused]);
  if (paused === undefined) return null;
  const { rows, firstShown, shownRows, fontFamily, fontSize, rowHeight } =
    paused;
  return (
    <pre
      ref={text}
      className="terminal-paused-text"
      style={
        {
          fontFamily,
          fontSize,
          lineHeight: rowHeight > 0 ? `${String(rowHeight)}px` : undefined,
          "--terminal-shown-height": `${String(shownRows * rowHeight)}px`,
        } as CSSProperties
      }
    >
      <span ref={firstRow} className="terminal-paused-row-start" />
      {rowsAsText(rows, 0, firstShown)}
      <span ref={firstShownRow} className="terminal-paused-row-start" />
      {rowsAsText(rows, firstShown, rows.length)}
    </pre>
  );
}
