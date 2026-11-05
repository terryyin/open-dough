import { sessionKey } from "./sessionReference.ts";
// The page keeps one side panel and its Sessions sidebar above project selection.
// Story selection, the chosen Intent mode and the Intent reading place are
// kept here as page state.
// The panel shows one item: a session's terminal or final report, or a story's
// story review. Sidebar navigation reveals the chosen project/story without
// remounting the page. pageSidePanel owns what the panel shows, current
// marks, maximization and focus return, and sets the selected story;
// sidePanelWidth its width beside the page; terminal readiness alone rereads
// a done record after native attachment.
// The page's one Recently done range (`./recentlyDoneRange.ts`) is kept here
// too, so a journey's destination can ask it for the entry it lands on. Every
// retained session the page opens or acts on asks the page's one history
// read (`./retainedHistory.ts`).

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { FinalReport } from "./FinalReport.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useProjects } from "./projectList.tsx";
import {
  SessionsSidebar,
  SessionsSidebarOnPage,
  useSessionsSidebar,
} from "./SessionsSidebar.tsx";
import type { OpenSessionsSidebarSessionEntry } from "./SessionsSidebarSessionEntry.tsx";
import { Terminal } from "./Terminal.tsx";
import { StoryReview } from "./StoryReview.tsx";
import { StoryReviewsOnPage } from "./pageStoryReviews.ts";
import { usePageSidePanel } from "./pageSidePanel.ts";
import { shownRecord } from "./sidePanelContent.ts";
import { SessionsOnPage, type SessionOperation } from "./pageSessions.ts";
import { IntentModeProvider } from "./pageIntentMode.tsx";
import { IntentReadingProvider } from "./pageIntentReading.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "./pageStorySelection.tsx";
import { StoryInspectionProvider } from "./pageStoryInspection.tsx";
import { RetainedHistoryOnPage } from "./retainedHistory.ts";
import { useSessionNavigation } from "./sessionNavigation.ts";
import {
  RecentlyDoneRangeOnPage,
  useRecentlyDoneRange,
} from "./recentlyDoneRange.ts";
import { PanelDividerOnPage, useSidePanelWidth } from "./sidePanelWidth.ts";
import "./side-panel.css";

export function PageFrame({
  sessions: {
    records,
    alerts,
    hostOperations,
    markDone,
    markRead,
    deleteRecord,
    recoverSession,
    stopSession,
    readSession,
    readHistory,
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
    | "recoverSession"
    | "stopSession"
    | "readSession"
    | "readHistory"
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
  const sidebar = useSessionsSidebar(records, alerts);
  const range = useRecentlyDoneRange(stories.shown);
  const selection = usePageStorySelection();
  const sidePanel = usePageSidePanel({
    markDone,
    markRead,
    deleteRecord,
    recoverSession,
    stopSession,
    hostOperations,
    range,
    selection: selection.api,
  });
  const { terminal, finalReport, storyReview, maximized, markSessionDone } =
    sidePanel;
  const frame = useRef<HTMLDivElement>(null);
  // Covering uses the maximized layout without overwriting the stored choice.
  // Only while a panel is shown — otherwise a narrow window would hide the Board.
  const panelOpen = sidePanel.shown !== undefined;
  const { covering, divider } = useSidePanelWidth(
    frame,
    panelOpen,
    sidebar.open,
  );
  const shownMaximized = panelOpen && (maximized || covering);
  const offerMaximize = !covering;
  const attached = useCallback<SessionOperation<void>>(
    ({ record }) => {
      if (record.doneAt !== undefined) {
        void readSession(record);
      }
    },
    [readSession],
  );
  const revealSession = useSessionNavigation(
    stories.selected,
    stories.shown,
    range,
  );
  const goToSession: OpenSessionsSidebarSessionEntry = ({
    record,
    control,
  }) => {
    const source = projects.find(
      (project) => project.id === record.request.source,
    );
    if (source !== undefined) {
      stories.show(source);
    }
    if (record.doneAt !== undefined) readHistory();
    const returnTo = sidebar.closeOverPage() ?? control;
    sidePanel.openSession({ record, control: returnTo });
    revealSession(record);
  };
  // The page keeps one element structure whether or not the sidebar or the
  // panel is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <SessionsOnPage value={sidePanel.sessions}>
      <RetainedHistoryOnPage value={readHistory}>
        <StoryReviewsOnPage value={sidePanel.openStoryReview}>
          <StorySelectionProvider selection={selection}>
            <StoryInspectionProvider>
              <PanelDividerOnPage value={shownMaximized ? undefined : divider}>
                <div
                  ref={frame}
                  className={
                    [
                      sidebar.open && "page-with-sessions-sidebar",
                      panelOpen && "page-split",
                      panelOpen && covering && "page-covering",
                      shownMaximized && "page-maximized",
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  style={
                    divider &&
                    ({
                      "--side-panel-width": `${String(divider.width)}px`,
                    } as CSSProperties)
                  }
                >
                  <SessionsSidebar {...sidebar} onOpen={goToSession} />
                  <SessionsSidebarOnPage value={sidebar}>
                    <RecentlyDoneRangeOnPage value={range}>
                      <div
                        className="page-column"
                        aria-hidden={shownMaximized ? true : undefined}
                      >
                        <IntentModeProvider project={stories.selected}>
                          <IntentReadingProvider project={stories.selected}>
                            {children}
                          </IntentReadingProvider>
                        </IntentModeProvider>
                      </div>
                    </RecentlyDoneRangeOnPage>
                  </SessionsSidebarOnPage>
                  {finalReport && (
                    <FinalReport
                      key={sessionKey(finalReport.record.session)}
                      session={finalReport}
                      current={shownRecord(records, finalReport)}
                      onClose={() => {
                        sidePanel.close(finalReport);
                      }}
                      onMarkDone={markSessionDone}
                    />
                  )}
                  {terminal && (
                    <Terminal
                      key={sessionKey(terminal.record.session)}
                      session={terminal}
                      current={shownRecord(records, terminal)}
                      onAttached={attached}
                      maximized={maximized}
                      onMaximize={sidePanel.maximize}
                      offerMaximize={offerMaximize}
                      onClose={() => {
                        sidePanel.close(terminal);
                      }}
                      onMarkDone={markSessionDone}
                      onWorkspaceUnavailable={sidePanel.unavailableWorkspace}
                    />
                  )}
                  {storyReview && (
                    <StoryReview
                      // Each story review, and each opening of one after Close or
                      // replacement, reads anew; asking again for the one shown
                      // focuses it and keeps its snapshot until Refresh.
                      key={`${storyReview.source}\n${storyReview.identity}`}
                      request={storyReview}
                      maximized={maximized}
                      onMaximize={sidePanel.maximize}
                      offerMaximize={offerMaximize}
                      onClose={() => {
                        sidePanel.close(storyReview);
                      }}
                    />
                  )}
                </div>
              </PanelDividerOnPage>
            </StoryInspectionProvider>
          </StorySelectionProvider>
        </StoryReviewsOnPage>
      </RetainedHistoryOnPage>
    </SessionsOnPage>
  );
}
