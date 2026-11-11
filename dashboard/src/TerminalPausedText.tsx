// The terminal's output paused as ordinary page text, so a phone's own
// selection and Copy work on it: the output counterpart of the composer
// (./TerminalComposer.tsx). Select on the key toolbar (./TerminalKeyToolbar.tsx)
// pauses and returns. Pausing reads what the terminal shows once and keeps
// it; the live terminal stays attached and sized beneath, so pausing and
// returning send the session nothing and output that arrives meanwhile shows
// on return. The text lies over the screen, outside it, where one-finger
// movement is the browser's own and not the terminal's swipe
// (./terminalTouchScroll.ts). It adds no selection, highlight, Copy control
// or announcement of its own.

import { useState } from "react";
import "./terminal-paused-text.css";
import type { ShownTerminalText } from "./terminalText.ts";

// `read` gives what the terminal shows now, or nothing when no terminal is
// mounted; Select then stays off.
export function usePausedTerminalText(
  read: () => ShownTerminalText | undefined,
) {
  const [paused, setPaused] = useState<ShownTerminalText>();
  return {
    paused,
    pauseOrReturn: () => {
      setPaused(paused === undefined ? read() : undefined);
    },
  };
}

export function TerminalPausedText({
  paused,
}: {
  readonly paused: ShownTerminalText | undefined;
}) {
  if (paused === undefined) return null;
  const { text, fontFamily, fontSize, rowHeight } = paused;
  return (
    <pre
      className="terminal-paused-text"
      style={{
        fontFamily,
        fontSize,
        lineHeight: rowHeight > 0 ? `${String(rowHeight)}px` : undefined,
      }}
    >
      {text}
    </pre>
  );
}
