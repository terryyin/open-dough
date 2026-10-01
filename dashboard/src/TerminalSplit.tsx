import { sessionKey } from "./sessionReference.ts";
// The page keeps one session panel and its Sessions sidebar above project selection.
// Sidebar navigation reveals the chosen project/story without remounting the page.
// pageSessionPanel owns selection, current marks, maximization and focus return;
// terminal readiness alone rereads a done record after native attachment.

import { useCallback, type ReactNode } from "react";
import { SessionResultPanel } from "./SessionResultPanel.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { sourceById, type PublishedSource } from "./publishedSource.ts";
import {
  SessionSidebar,
  SidebarOnPage,
  useSessionSidebar,
} from "./SessionSidebar.tsx";
import type { OpenSidebarEntry } from "./SidebarEntry.tsx";
import { TerminalPanel } from "./TerminalPanel.tsx";
import { usePageSessionPanel } from "./pageSessionPanel.ts";
import { SessionsOnPage, type SessionOperation } from "./pageSessions.ts";
import { useSessionNavigation } from "./sessionNavigation.ts";
import "./agent-terminal.css";

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
  const panel = usePageSessionPanel({ markDone, deleteRecord });
  const { terminal, result, maximized, markSessionDone } = panel;
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
    panel.openSession({ record, control: returnTo });
    revealSession(record);
  };
  // The page keeps one element structure whether or not the sidebar or a
  // terminal is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <SessionsOnPage value={panel.sessions}>
      {panel.deleted !== undefined && (
        <p role="status" className="visually-hidden">
          {panel.deleted}
        </p>
      )}
      <div
        className={
          [
            sidebar.open && "page-with-sidebar",
            panel.shown !== undefined && "page-split",
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
        {result && (
          <SessionResultPanel
            key={sessionKey(result.record.session)}
            session={result}
            onClose={() => {
              panel.close(result);
            }}
            onMarkDone={markSessionDone}
          />
        )}
        {terminal && (
          <TerminalPanel
            key={sessionKey(terminal.record.session)}
            session={terminal}
            onAttached={attached}
            maximized={maximized}
            onMaximize={panel.maximize}
            onClose={() => {
              panel.close(terminal);
            }}
            onMarkDone={markSessionDone}
            onWorkspaceUnavailable={panel.unavailableWorkspace}
          />
        )}
      </div>
    </SessionsOnPage>
  );
}
