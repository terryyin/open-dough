// The page with its one terminal and the Sessions sidebar
// (`./SessionSidebar.tsx`): while the sidebar is open it shows left of the
// page, and while a session is open, the terminal panel
// (`./TerminalPanel.tsx`) shows right of it. Whether the sidebar is open, and
// the open session, are held here, above the project selection, so choosing
// another project leaves them open; opening another session takes its place,
// and a reload starts with none, while the sidebar opens as it was left. The
// frame says which session the terminal shows, from which every entry of it
// derives its mark. Opening a sidebar entry goes to its session as one
// operation: the page shows its project's stories, the terminal opens it as
// Open terminal does, where it offers Open terminal, and, once those stories
// are shown, its card, or its Recent sessions entry when no card lists it,
// scrolls into view and stays there while the page settles
// (`./workFocus.ts`). Mark as done, from the panel or from a card's session
// entry, is one operation here: once the boundary has marked the session, a
// panel showing it closes. Closing returns the keyboard to the control that
// opened the panel, and a card entry's mark to its own control; when that
// control is gone, as a card's entry goes once its session is marked done, the
// keyboard goes to the session's Recent sessions entry
// (`sessionKeyboardHome`). A panel another session has already replaced moves
// no focus when it closes. Once the panel shows output from a session the
// page holds as done, the page reads that session again, since the boundary
// reopens a done session its terminal attaches to
// (`../server/agentTerminals.ts`). Opening, going to a sidebar entry's
// session, marking, and reading again each take the same request
// (`./pageSessions.ts`).

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { attachOpens, type LaunchRecord } from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { sourceById, type PublishedSource } from "./publishedSource.ts";
import {
  SessionSidebar,
  SidebarOnPage,
  useSessionSidebar,
} from "./SessionSidebar.tsx";
import type { OpenSidebarEntry } from "./SidebarEntry.tsx";
import { TerminalPanel } from "./TerminalPanel.tsx";
import {
  recentSessionsEntry,
  sessionKeyboardHome,
  SessionsOnPage,
  type MarkSessionDone,
  type OpenTerminal,
  type SessionOperation,
  type SessionRequest,
} from "./pageSessions.ts";
import { keepInView, workCard } from "./workFocus.ts";
import "./agent-terminal.css";

// The keyboard's return once the page shows what was asked: the control to
// return it to, the session, and the terminal the page then shows.
type KeyboardReturn = {
  readonly control: HTMLElement;
  readonly sessionId: string;
  readonly shows: SessionRequest | undefined;
};

export function TerminalSplit({
  sessions: { records, markDone, readSession },
  stories,
  children,
}: {
  // The machine's sessions the sidebar lists and the terminal acts on;
  // `readSession` keeps its identity across renders.
  readonly sessions: Pick<
    MachineSessions,
    "records" | "markDone" | "readSession"
  >;
  readonly stories: {
    // The project whose stories the page shows, once they are read.
    readonly shown: string | undefined;
    // Shows a project's stories, as one history entry.
    readonly show: (source: PublishedSource) => void;
  };
  readonly children: ReactNode;
}) {
  const sidebar = useSessionSidebar(records);
  const [terminal, setTerminal] = useState<SessionRequest | undefined>();
  const openTerminal = useCallback<OpenTerminal>((request) => {
    setTerminal((current) =>
      current?.record.session.sessionId === request.record.session.sessionId
        ? current
        : request,
    );
  }, []);
  // The terminal on the page, and where the keyboard returns once the page,
  // and any change the closing or marking brought, is shown; a return asked
  // for a page since shown with another terminal is dropped.
  const shown = useRef<SessionRequest | undefined>(undefined);
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
  const closeTerminal = (closed: SessionRequest) => {
    if (shown.current !== closed) {
      return;
    }
    setTerminal(undefined);
    setReturning({
      control: closed.control,
      sessionId: closed.record.session.sessionId,
      shows: undefined,
    });
  };
  // Marks the session done and closes the panel if it shows the session,
  // answering whether it was marked, and whether that closed the panel.
  const markClosing = async ({ record }: SessionRequest) => {
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
  const attached = useCallback<SessionOperation<void>>(
    ({ record }) => {
      if (record.doneAt !== undefined) {
        void readSession(record);
      }
    },
    [readSession],
  );
  // Going to a session: its project's stories, its terminal where it opens
  // one, and, once that project's stories are shown, its card brought into
  // view, or its Recent sessions entry when no card lists it.
  // Each going is its own, so going again to the same session reveals again.
  const [going, setGoing] = useState<{ readonly to: LaunchRecord }>();
  const revealed = useRef<{ readonly to: LaunchRecord } | undefined>(undefined);
  const goToSession: OpenSidebarEntry = ({ record, control }) => {
    const source = sourceById(record.request.source);
    if (source !== undefined) {
      stories.show(source);
    }
    const returnTo = sidebar.closeOverPage() ?? control;
    if (attachOpens(record.sessionState)) {
      openTerminal({ record, control: returnTo });
    }
    setGoing({ to: record });
  };
  useLayoutEffect(() => {
    if (
      going === undefined ||
      revealed.current === going ||
      stories.shown !== going.to.request.source
    ) {
      return;
    }
    revealed.current = going;
    const { request, session } = going.to;
    const shown =
      workCard(request.identity) ?? recentSessionsEntry(session.sessionId);
    // Kept in view until the developer moves, goes elsewhere, or another
    // project's stories are shown.
    return shown === null ? undefined : keepInView(shown);
  }, [going, stories.shown]);
  const markSessionDone: MarkSessionDone = async (request) => {
    const { record, control } = request;
    const marked = await markClosing(request);
    if (marked === "marked") {
      setReturning({
        control,
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
    <SessionsOnPage
      value={{
        openTerminal,
        markDone: markSessionDone,
        shownInTerminal: terminal?.record.session.sessionId,
      }}
    >
      <div
        className={
          [sidebar.open && "page-with-sidebar", terminal && "page-split"]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <SessionSidebar {...sidebar} onOpen={goToSession} />
        <SidebarOnPage value={sidebar}>
          <div className="page-column">{children}</div>
        </SidebarOnPage>
        {terminal && (
          <TerminalPanel
            key={terminal.record.session.sessionId}
            session={terminal}
            onAttached={attached}
            onClose={() => {
              closeTerminal(terminal);
            }}
            onMarkDone={async (request) =>
              (await markClosing(request)) !== "not-marked"
            }
          />
        )}
      </div>
    </SessionsOnPage>
  );
}
