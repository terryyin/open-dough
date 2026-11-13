// The page frame: the Sessions sidebar, the page column and one side panel,
// kept above project selection together with the page's story selection,
// Intent mode and Intent reading place. The panel shows a session's terminal
// or final report, or a story's review (`./pageSidePanel.ts`, which also
// sets the selected story; width by `./sidePanelWidth.ts`). Sidebar
// navigation reveals the chosen project or story without remounting the page.
//
// Choosing a Recently done sessions row selects it, and in Development shows
// what it selected (`./recentlyDoneSelection.ts`). A row's Open, there as on
// every Sessions sidebar row, opens its session and abandons a selection
// check still unanswered. The page's one Recently done range
// (`./recentlyDoneRange.ts`) and retained history read
// (`./retainedHistory.ts`) are kept here.

import { useCallback, useRef, type ReactNode } from "react";
import { sessionKey } from "./sessionReference.ts";
import { FinalReport } from "./FinalReport.tsx";
import type { MachineSessions } from "./agentLaunches.ts";
import { useVisibleProjects } from "./projectList.tsx";
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
  ChosenSessionOnPage,
  useRecentlyDoneSelection,
  type RecentlyDoneProjects,
} from "./recentlyDoneSelection.ts";
import {
  RecentlyDoneRangeOnPage,
  useRecentlyDoneRange,
} from "./recentlyDoneRange.ts";
import { PanelDividerOnPage, useSidePanelWidth } from "./sidePanelWidth.ts";
import { pageFrameLayout } from "./pageFrameLayout.ts";
import { RecentlyDonePageEvidence } from "./RecentlyDonePageEvidence.tsx";
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
  readonly stories: RecentlyDoneProjects & {
    // The project whose stories the page shows, once they are read.
    readonly shown: string | undefined;
  };
  readonly children: ReactNode;
}) {
  const projects = useVisibleProjects();
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
  // Terminal readiness alone rereads a done record after native attachment.
  const attached = useCallback<SessionOperation<void>>(
    ({ record }) => {
      if (record.doneAt !== undefined) void readSession(record);
    },
    [readSession],
  );
  const revealSession = useSessionNavigation(
    stories.selected,
    stories.shown,
    range,
  );
  const recentlyDone = useRecentlyDoneSelection(
    projects,
    stories,
    selection,
    revealSession,
  );
  const goToSession: OpenSessionsSidebarSessionEntry = ({
    record,
    control,
  }) => {
    recentlyDone.supersede();
    const source = projects.find(({ id }) => id === record.request.source);
    if (source !== undefined) stories.show(source);
    if (record.doneAt !== undefined) readHistory();
    const returnTo = sidebar.closeOverPage() ?? control;
    sidePanel.openSession({ record, control: returnTo });
    revealSession(record);
  };
  // The page keeps one element structure whether or not the sidebar or the
  // panel is open, so opening one never remounts the page or loses what it
  // had open.
  return (
    <RecentlyDonePageEvidence
      projects={projects}
      selected={stories.selected}
      work={stories.work}
    >
      <SessionsOnPage value={sidePanel.sessions}>
        <RetainedHistoryOnPage value={readHistory}>
          <StoryReviewsOnPage value={sidePanel.openStoryReview}>
            <StorySelectionProvider selection={selection}>
              <StoryInspectionProvider>
                <PanelDividerOnPage
                  value={shownMaximized ? undefined : divider}
                >
                  <div
                    ref={frame}
                    {...pageFrameLayout({
                      sidebarOpen: sidebar.open,
                      panelOpen,
                      covering,
                      maximized: shownMaximized,
                      divider,
                    })}
                  >
                    <SessionsSidebar
                      {...sidebar}
                      onOpen={goToSession}
                      recentlyDone={recentlyDone.row}
                    />
                    <SessionsSidebarOnPage value={sidebar}>
                      <RecentlyDoneRangeOnPage value={range}>
                        <ChosenSessionOnPage value={recentlyDone.chosenSession}>
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
                        </ChosenSessionOnPage>
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
                        // focuses it and keeps its snapshot until Refresh. Switching
                        // between live and historical reading starts a fresh review.
                        key={`${storyReview.source}\n${storyReview.identity}\n${String(storyReview.historical === true)}`}
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
    </RecentlyDonePageEvidence>
  );
}
