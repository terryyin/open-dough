// The page with its one terminal and the Sessions sidebar
// (`./SessionSidebar.tsx`): while the sidebar is open it shows left of the
// page, and while a session is open, the terminal panel
// (`./TerminalPanel.tsx`) shows right of it. Whether the sidebar is open, and
// the open session, are held here, above the project selection, so choosing
// another project leaves them open; opening another session takes its place,
// and a reload starts with none, while the sidebar opens as it was left. Mark
// as done, from the panel or from a card's session entry, is one operation
// here: once the boundary has marked the session, a panel showing it closes.
// Closing returns the keyboard to the control that opened the panel, and a
// card entry's mark to its own control; when that control is gone, as a
// card's entry goes once its session is marked done, the keyboard goes to the
// session's Recent sessions entry (`sessionKeyboardHome`). A panel another
// session has already replaced moves no focus when it closes. Once the panel shows output from a session the
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
import type { MachineSessions } from "./agentLaunches.ts";
import {
  SessionSidebar,
  SidebarOnPage,
  useSessionSidebar,
} from "./SessionSidebar.tsx";
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
  sessions: { records, markDone, readSession },
  children,
}: {
  // The machine's sessions the sidebar lists and the terminal acts on;
  // `readSession` keeps its identity across renders.
  readonly sessions: Pick<
    MachineSessions,
    "records" | "markDone" | "readSession"
  >;
  readonly children: ReactNode;
}) {
  const sidebar = useSessionSidebar(records);
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

  // The page keeps one element structure whether or not the sidebar or a
  // terminal is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <SessionsOnPage value={{ openTerminal, markDone: markSessionDone }}>
      <div
        className={
          [sidebar.open && "page-with-sidebar", terminal && "page-split"]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <SessionSidebar {...sidebar} />
        <SidebarOnPage value={sidebar}>
          <div className="page-column">{children}</div>
        </SidebarOnPage>
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
