import { sessionKey } from "./sessionReference.ts";
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
// panel showing it closes. Maximized (`./pageTerminal.ts`), the panel takes
// the page column's room, beside the sidebar while it is open. Closing
// returns the keyboard to the control that opened the panel while it is on
// the page. A panel another session has already replaced moves no focus when
// it closes. Once the panel shows output from a session the page holds as
// done, the page reads that session again, since the boundary reopens a done
// session its terminal attaches to (`../server/agentTerminals.ts`). Deleting
// a session's record, from a card or Recent sessions, leaves it on no list,
// closes a panel showing it, says so in a polite status, and sends the
// keyboard to the entry beside it, or to the card or Recent sessions. Opening, going to a sidebar entry's session,
// marking, deleting, and reading again each take the same request
// (`./pageSessions.ts`).

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { embeddedTerminal } from "./sessionCapabilities.ts";
import { attachOpens, launchSubject } from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { sourceById, type PublishedSource } from "./publishedSource.ts";
import {
  SessionSidebar,
  SidebarOnPage,
  useSessionSidebar,
} from "./SessionSidebar.tsx";
import type { OpenSidebarEntry } from "./SidebarEntry.tsx";
import { TerminalPanel } from "./TerminalPanel.tsx";
import { usePageTerminal } from "./pageTerminal.ts";
import {
  deletedEntryHome,
  SessionsOnPage,
  type DeleteSessionRecord,
  type MarkSessionDone,
  type SessionOperation,
  type SessionRequest,
} from "./pageSessions.ts";
import { useSessionNavigation } from "./sessionNavigation.ts";
import "./agent-terminal.css";

// The keyboard's return once the page shows what was asked: the control to
// return it to and the terminal the page then shows.
type KeyboardReturn = {
  readonly control: HTMLElement;
  readonly shows: SessionRequest | undefined;
  // Where the keyboard goes instead when the control is gone, if not the
  // session's Recent sessions entry.
  readonly home?: () => HTMLElement | null;
};

export function TerminalSplit({
  sessions: { records, alerts, markDone, deleteRecord, readSession },
  stories,
  children,
}: {
  // The machine's sessions the sidebar lists and the terminal acts on;
  // `readSession` keeps its identity across renders.
  readonly sessions: Pick<
    MachineSessions,
    "records" | "alerts" | "markDone" | "deleteRecord" | "readSession"
  >;
  readonly stories: {
    // The project the developer has chosen to show, read or not.
    readonly selected: string;
    // The project whose stories the page shows, once they are read.
    readonly shown: string | undefined;
    // Shows a project's stories, as one history entry.
    readonly show: (source: PublishedSource) => void;
  };
  readonly children: ReactNode;
}) {
  const sidebar = useSessionSidebar(records, alerts);
  const pageTerminal = usePageTerminal();
  const { terminal, maximized } = pageTerminal;
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
      : returning.home?.();
    control?.focus();
  }, [returning]);
  const closeTerminal = (closed: SessionRequest) => {
    if (shown.current !== closed) {
      return;
    }
    pageTerminal.close();
    setReturning({
      control: closed.control,
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
    if (
      open === undefined ||
      sessionKey(open.record.session) !== sessionKey(record.session)
    ) {
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
  const revealSession = useSessionNavigation(stories.selected, stories.shown);
  const goToSession: OpenSidebarEntry = ({ record, control }) => {
    const source = sourceById(record.request.source);
    if (source !== undefined) {
      stories.show(source);
    }
    const returnTo = sidebar.closeOverPage() ?? control;
    if (
      embeddedTerminal(record.session.host) &&
      attachOpens(record.sessionState)
    ) {
      pageTerminal.open({ record, control: returnTo });
    }
    revealSession(record);
  };
  const markSessionDone: MarkSessionDone = async (request) => {
    const marked = await markClosing(request);
    return marked !== "not-marked";
  };

  // Deletes the session's record, announcing it; the entry leaves every list
  // and the keyboard goes to the entry beside it in the list the control was
  // in, else to its card or to Recent sessions.
  const [deleted, setDeleted] = useState<string | undefined>();
  const deleteSessionRecord: DeleteSessionRecord = async (request) => {
    const { record, control } = request;
    const home = deletedEntryHome(
      control,
      launchSubject(record.request).identity,
    );
    const outcome = await deleteRecord(record);
    if (outcome.kind !== "deleted") {
      return outcome;
    }
    setDeleted("Session record deleted");
    const open = shown.current;
    const closes =
      (open === undefined ? undefined : sessionKey(open.record.session)) ===
      sessionKey(record.session);
    if (closes) {
      pageTerminal.close();
    }
    setReturning({
      control,
      shows: closes ? undefined : open,
      home,
    });
    return outcome;
  };

  // The page keeps one element structure whether or not the sidebar or a
  // terminal is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <SessionsOnPage
      value={{
        openTerminal: pageTerminal.open,
        markDone: markSessionDone,
        deleteRecord: deleteSessionRecord,
        shownInTerminal:
          terminal === undefined
            ? undefined
            : sessionKey(terminal.record.session),
      }}
    >
      {deleted !== undefined && (
        <p role="status" className="visually-hidden">
          {deleted}
        </p>
      )}
      <div
        className={
          [
            sidebar.open && "page-with-sidebar",
            terminal && "page-split",
            maximized && "page-maximized",
          ]
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
            key={sessionKey(terminal.record.session)}
            session={terminal}
            onAttached={attached}
            maximized={maximized}
            onMaximize={pageTerminal.maximize}
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
