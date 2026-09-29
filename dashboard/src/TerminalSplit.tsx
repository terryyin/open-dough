// The page with its one terminal: while a session is open, the page shows on
// the left and the terminal panel (`./TerminalPanel.tsx`) on the right. The
// open session is held here, above the project selection, so choosing another
// project leaves it open; opening another session takes its place, and a
// reload starts with none. Closing returns the keyboard to the control that
// opened it, and so does marking the session done, once the boundary has
// marked it; when that control is gone, as a card's Started goes once its
// session stops, the keyboard goes to the session's Recent sessions entry. A
// panel another session has already replaced moves no focus when it closes.

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import { TerminalPanel } from "./TerminalPanel.tsx";
import {
  recentSessionControl,
  TerminalOpener,
  type OpenTerminal,
  type TerminalOpening,
} from "./terminalOpening.ts";
import "./agent-terminal.css";

export function TerminalSplit({
  markDone,
  children,
}: {
  // Marks a recorded session done, answering whether it was marked.
  readonly markDone: (record: LaunchRecord) => Promise<boolean>;
  readonly children: ReactNode;
}) {
  const [terminal, setTerminal] = useState<TerminalOpening | undefined>();
  const openTerminal = useCallback<OpenTerminal>((opening) => {
    setTerminal((current) =>
      current?.record.session.sessionId === opening.record.session.sessionId
        ? current
        : opening,
    );
  }, []);
  // The terminal on the page, and one just closed whose keyboard returns once
  // the page, and any change its closing brought, is shown without it.
  const shown = useRef<TerminalOpening | undefined>(undefined);
  const returning = useRef<TerminalOpening | undefined>(undefined);
  useLayoutEffect(() => {
    shown.current = terminal;
    const closed = returning.current;
    returning.current = undefined;
    if (closed === undefined || terminal !== undefined) {
      return;
    }
    const control = closed.opener.isConnected
      ? closed.opener
      : recentSessionControl(closed.record.session.sessionId);
    control?.focus();
  }, [terminal]);
  const closeTerminal = (closed: TerminalOpening) => {
    if (shown.current !== closed) {
      return;
    }
    returning.current = closed;
    setTerminal(undefined);
  };
  const markTerminalDone = async (open: TerminalOpening) => {
    const marked = await markDone(open.record);
    if (marked) {
      closeTerminal(open);
    }
    return marked;
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
            onClose={() => {
              closeTerminal(terminal);
            }}
            onMarkDone={() => markTerminalDone(terminal)}
          />
        )}
      </div>
    </TerminalOpener>
  );
}
