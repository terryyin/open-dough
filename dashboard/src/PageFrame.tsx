import { sessionKey } from "./sessionReference.ts";
// The page keeps one side panel and its Sessions sidebar above project selection.
// The panel shows one item: a session's terminal or final report, or a story's
// review. Sidebar navigation reveals the chosen project/story without
// remounting the page. pageSidePanel owns selection, current marks,
// maximization and focus return; sidePanelWidth its width beside the page;
// terminal readiness alone rereads a done record after native attachment.

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { SessionResultPanel } from "./SessionResultPanel.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useProjects } from "./projectList.tsx";
import {
  SessionSidebar,
  SidebarOnPage,
  useSessionSidebar,
} from "./SessionSidebar.tsx";
import type { OpenSidebarEntry } from "./SidebarEntry.tsx";
import { TerminalPanel } from "./TerminalPanel.tsx";
import { StoryReviewPanel } from "./StoryReviewPanel.tsx";
import { ReviewsOnPage } from "./pageReviews.ts";
import { shownRecord, usePageSidePanel } from "./pageSidePanel.ts";
import { SessionsOnPage, type SessionOperation } from "./pageSessions.ts";
import { useSessionNavigation } from "./sessionNavigation.ts";
import { SidePanelEdgeOnPage, useSidePanelWidth } from "./sidePanelWidth.ts";
import "./side-panel.css";

export function PageFrame({
  sessions: {
    records,
    alerts,
    hostOperations,
    markDone,
    markRead,
    deleteRecord,
    readSession,
  },
  stories,
  children,
}: {
  // The machine's sessions the sidebar lists and the panel decides by;
  // `readSession` keeps its identity across renders.
  readonly sessions: Pick<
    MachineSessions,
    | "records"
    | "alerts"
    | "hostOperations"
    | "markDone"
    | "markRead"
    | "deleteRecord"
    | "readSession"
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
  const projects = useProjects();
  const sidebar = useSessionSidebar(records, alerts);
  const panel = usePageSidePanel({
    markDone,
    markRead,
    deleteRecord,
    hostOperations,
  });
  const { terminal, result, review, maximized, markSessionDone } = panel;
  const frame = useRef<HTMLDivElement>(null);
  const { stacked, edge } = useSidePanelWidth(
    frame,
    panel.shown !== undefined,
    sidebar.open,
  );
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
    const source = projects.find(
      (project) => project.id === record.request.source,
    );
    if (source !== undefined) {
      stories.show(source);
    }
    const returnTo = sidebar.closeOverPage() ?? control;
    panel.openSession({ record, control: returnTo });
    revealSession(record);
  };
  // The page keeps one element structure whether or not the sidebar or the
  // panel is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <SessionsOnPage value={panel.sessions}>
      <ReviewsOnPage value={panel.openReview}>
        <SidePanelEdgeOnPage value={maximized ? undefined : edge}>
          <div
            ref={frame}
            className={
              [
                sidebar.open && "page-with-sidebar",
                panel.shown !== undefined && "page-split",
                panel.shown !== undefined && stacked && "page-stacked",
                maximized && "page-maximized",
              ]
                .filter(Boolean)
                .join(" ") || undefined
            }
            style={
              edge &&
              ({
                "--side-panel-width": `${String(edge.width)}px`,
              } as CSSProperties)
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
                current={shownRecord(records, result)}
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
                current={shownRecord(records, terminal)}
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
            {review && (
              <StoryReviewPanel
                // Each story's review, and each opening of one after Close or
                // replacement, reads anew; asking again for the one shown
                // focuses it and keeps its snapshot until Refresh.
                key={`${review.source}\n${review.identity}`}
                request={review}
                maximized={maximized}
                onMaximize={panel.maximize}
                onClose={() => {
                  panel.close(review);
                }}
              />
            )}
          </div>
        </SidePanelEdgeOnPage>
      </ReviewsOnPage>
    </SessionsOnPage>
  );
}
