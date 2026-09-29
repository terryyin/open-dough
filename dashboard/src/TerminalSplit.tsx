// The page with its one terminal: while a session is open, the page shows on
// the left and the terminal panel (`./TerminalPanel.tsx`) on the right. The
// open session is held here, above the project selection, so choosing another
// project leaves it open; opening another session takes its place, and a
// reload starts with none. Closing returns the keyboard to the control that
// opened it, while that control is still on the page.

import { useCallback, useState, type ReactNode } from "react";
import { TerminalPanel } from "./TerminalPanel.tsx";
import {
  TerminalOpener,
  type OpenTerminal,
  type TerminalOpening,
} from "./terminalOpening.ts";
import "./agent-terminal.css";

export function TerminalSplit({ children }: { readonly children: ReactNode }) {
  const [terminal, setTerminal] = useState<TerminalOpening | undefined>();
  const openTerminal = useCallback<OpenTerminal>((opening) => {
    setTerminal((current) =>
      current?.record.session.sessionId === opening.record.session.sessionId
        ? current
        : opening,
    );
  }, []);
  const closeTerminal = () => {
    setTerminal(undefined);
    if (terminal?.opener.isConnected) {
      terminal.opener.focus();
    }
  };

  // The page keeps one element structure whether or not a terminal is open,
  // so opening one never remounts the page or loses what it had open.
  return (
    <TerminalOpener value={openTerminal}>
      <div className={terminal ? "page-split" : undefined}>
        <div className="page-column">{children}</div>
        {terminal && (
          <TerminalPanel
            key={terminal.record.session.sessionId}
            record={terminal.record}
            onClose={closeTerminal}
          />
        )}
      </div>
    </TerminalOpener>
  );
}
