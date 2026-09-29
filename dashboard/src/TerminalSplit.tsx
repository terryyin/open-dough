// The page with its one terminal: while a session is open, the page shows on
// the left and the terminal panel (`./TerminalPanel.tsx`) on the right. The
// open session is held here, above the project selection, so choosing another
// project leaves it open; opening another session takes its place, and a
// reload starts with none. Mark as done, from the panel or from a card's
// session entry, is one operation here: once the boundary has marked the
// session, a panel showing it closes. Closing returns the keyboard to the
// control that opened the panel, and a card entry's mark to its own control;
// when that control is gone, as a card's entry goes once its session is
// marked done, the keyboard goes to the session's Recent sessions entry
// (`sessionKeyboardHome`). A panel another session has already replaced moves
// no focus when it closes. Once the panel shows output from a session the
// page holds as done, the page reads that session again, since the boundary
// reopens a done session its terminal attaches to
// (`../server/agentTerminals.ts`).

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import type { ProjectLaunches } from "./agentLaunches.ts";
import { TerminalPanel } from "./TerminalPanel.tsx";
import {
  sessionKeyboardHome,
  SessionsOnPage,
  type MarkSessionDone,
  type OpenTerminal,
  type TerminalOpening,
} from "./terminalOpening.ts";
import "./agent-terminal.css";

// The keyboard's return once the page shows what was asked: the control to
// return it to, the session, and the terminal the page then shows.
type KeyboardReturn = {
  readonly control: HTMLElement;
  readonly sessionId: string;
  readonly shows: TerminalOpening | undefined;
};

export function TerminalSplit({
  sessions: { markDone, readSession },
  children,
}: {
  // The recorded sessions the terminal acts on; `readSession` keeps its
  // identity across renders.
  readonly sessions: Pick<ProjectLaunches, "markDone" | "readSession">;
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
  // The terminal on the page, and where the keyboard returns once the page,
  // and any change the closing or marking brought, is shown; a return asked
  // for a page since shown with another terminal is dropped.
  const shown = useRef<TerminalOpening | undefined>(undefined);
  const [returning, setReturning] = useState<KeyboardReturn | undefined>();
  useLayoutEffect(() => {
    shown.current = terminal;
  }, [terminal]);
  useLayoutEffect(() => {
    if (returning === undefined || shown.current !== returning.shows) {
      return;
    }
    const control = returning.control.isConnected
      ? returning.control
      : sessionKeyboardHome(returning.sessionId);
    control?.focus();
  }, [returning]);
  const closeTerminal = (closed: TerminalOpening) => {
    if (shown.current !== closed) {
      return;
    }
    setTerminal(undefined);
    setReturning({
      control: closed.opener,
      sessionId: closed.record.session.sessionId,
      shows: undefined,
    });
  };
  // Marks the session done and closes the panel if it shows the session,
  // answering whether it was marked, and whether that closed the panel.
  const markClosing = async (record: LaunchRecord) => {
    if (!(await markDone(record))) {
      return "not-marked";
    }
    const open = shown.current;
    if (open?.record.session.sessionId !== record.session.sessionId) {
      return "marked";
    }
    closeTerminal(open);
    return "closed";
  };
  const attached = useCallback(
    (record: LaunchRecord) => {
      if (record.doneAt !== undefined) {
        void readSession(record);
      }
    },
    [readSession],
  );
  const markSessionDone: MarkSessionDone = async ({ record, opener }) => {
    const marked = await markClosing(record);
    if (marked === "marked") {
      setReturning({
        control: opener,
        sessionId: record.session.sessionId,
        shows: shown.current,
      });
    }
    return marked !== "not-marked";
  };

  // The page keeps one element structure whether or not a terminal is open,
  // so opening one never remounts the page or loses what it had open.
  return (
    <SessionsOnPage value={{ openTerminal, markDone: markSessionDone }}>
      <div className={terminal ? "page-split" : undefined}>
        <div className="page-column">{children}</div>
        {terminal && (
          <TerminalPanel
            key={terminal.record.session.sessionId}
            record={terminal.record}
            onAttached={attached}
            onClose={() => {
              closeTerminal(terminal);
            }}
            onMarkDone={async () =>
              (await markClosing(terminal.record)) !== "not-marked"
            }
          />
        )}
      </div>
    </SessionsOnPage>
  );
}
