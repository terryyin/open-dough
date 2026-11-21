// Minimal production side-panel and story-selection mount for CI status specs.
import { createElement, useState } from "react";
import { storyCardAssignmentsOf } from "../../src/agentAssignments.ts";
import {
  launchSubject,
  storyCardSessionsOf,
  type LaunchWithState,
} from "../../src/agentLaunch.ts";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { IntentPerspective } from "../../src/IntentPerspective.tsx";
import {
  IntentCiReadSourceOnPage,
  type IntentCiReadSource,
} from "../../src/intentCiReadSource.ts";
import { IntentPageProviders } from "../../src/intentPageProviders.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import {
  IntentReadSourceOnPage,
  type IntentReadSource,
} from "../../src/intentReadSource.ts";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { usePageSidePanel } from "../../src/pageSidePanel.ts";
import {
  StorySelectionProvider,
  toggleOnEmptyArea,
  usePageStorySelection,
  useStorySelection,
} from "../../src/pageStorySelection.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork, WorkEntry } from "../../src/publishedWork.ts";
import { useRecentlyDoneRange } from "../../src/recentlyDoneRange.ts";
import { ReviewSourceOnPage } from "../../src/reviewSource.ts";
import {
  SessionsButton,
  SessionsSidebarOnPage,
  useSessionsSidebar,
} from "../../src/SessionsSidebar.tsx";
import { sessionsSidebarId } from "../../src/sessionsSidebarElements.ts";
import { SessionsSidebarOpenList } from "../../src/SessionsSidebarOpenList.tsx";
import { SidePanelTitle } from "../../src/SidePanelTitle.tsx";
import { storyCardMarks } from "../../src/storyCardFocus.ts";
import { StoryCardSessions } from "../../src/StoryCardSessions.tsx";
import "../../src/side-panel.css";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { unavailableReviewSource } from "./intent-ci-perspective-mount.ts";

function TakenSelectionCards({
  work,
  records,
}: {
  readonly work: PublishedWork;
  readonly records: readonly LaunchWithState[];
}) {
  const { selectedIdentity, toggle } = useStorySelection(work.source.id);
  return createElement(
    "main",
    { "aria-label": "Development" },
    work.taken.map((entry: WorkEntry) =>
      createElement(
        "article",
        {
          key: entry.identity,
          className: `story-card${selectedIdentity === entry.identity ? " story-card-selected" : ""}`,
          "aria-label": entry.title,
          onClick: toggleOnEmptyArea(() => {
            toggle(entry.identity);
          }),
          ...storyCardMarks(entry.identity),
        },
        createElement("h3", null, entry.title),
        createElement(StoryCardSessions, {
          sessions: storyCardSessionsOf(
            records,
            work.source.id,
            entry.identity,
          ),
          launchedHere: undefined,
          storyCardAssignments: storyCardAssignmentsOf(entry),
        }),
      ),
    ),
  );
}

function SidePanelIntentFrame({
  work,
  records,
  hostOperations,
}: {
  readonly work: PublishedWork;
  readonly records: readonly LaunchWithState[];
  readonly hostOperations: MachineSessions["hostOperations"];
}) {
  const [perspective, setPerspective] = useState<"development" | "intent">(
    "intent",
  );
  const selection = usePageStorySelection();
  const range = useRecentlyDoneRange(work.source.id);
  const sidebar = useSessionsSidebar(records, { available: true });
  const sidePanel = usePageSidePanel({
    markDone: () => Promise.resolve("marked" as const),
    markRead: () => Promise.resolve(true),
    deleteRecord: () => Promise.resolve({ kind: "deleted" as const }),
    recoverSession: () => Promise.resolve(undefined),
    stopSession: () => Promise.resolve(undefined),
    hostOperations,
    range,
    selection: selection.api,
  });
  const perspectiveButton = (label: string, next: "development" | "intent") =>
    createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setPerspective(next);
        },
      },
      label,
    );
  const shownPanel = (
    shown: typeof sidePanel.finalReport,
    label: string,
    className: string,
  ) =>
    shown !== undefined &&
    createElement(
      "section",
      { key: label, className, "aria-label": label },
      createElement(SidePanelTitle, {
        title: launchSubject(shown.record.request).title,
      }),
      createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            sidePanel.close(shown);
          },
        },
        "Close",
      ),
    );
  const frameClass = `page-frame${sidebar.open ? " page-with-sessions-sidebar" : ""}${sidePanel.shown !== undefined ? " page-split" : ""}`;
  return createElement(ProjectsOnPage, {
    projects: [work.source],
    replaceProjects: () => undefined,
    children: createElement(SessionsOnPage, {
      value: sidePanel.sessions,
      children: createElement(SessionsSidebarOnPage, {
        value: sidebar,
        children: createElement(StorySelectionProvider, {
          selection,
          children: createElement(IntentPageProviders, {
            project: work.source.id,
            children: createElement(
              "div",
              { className: frameClass },
              createElement(
                "aside",
                {
                  id: sessionsSidebarId,
                  className: "sessions-sidebar",
                  "aria-label": "Sessions sidebar",
                  hidden: !sidebar.open,
                },
                createElement("h2", null, "Sessions"),
                createElement(SessionsSidebarOpenList, {
                  records,
                  alerts: sidebar.alerts,
                  open: sidebar.open,
                  onOpen: ({ record, control }) => {
                    const returnTo = sidebar.closeOverPage() ?? control;
                    sidePanel.openSession({ record, control: returnTo });
                  },
                }),
              ),
              createElement(
                "div",
                { className: "page-column" },
                createElement(
                  "header",
                  { className: "banner" },
                  createElement(SessionsButton, null),
                  perspectiveButton("Development", "development"),
                  perspectiveButton("Intent", "intent"),
                ),
                perspective === "development"
                  ? createElement(TakenSelectionCards, { work, records })
                  : createElement(IntentReadRecovery, {
                      visibility: "visible",
                      limitStands: false,
                      children: createElement(IntentPerspective, {
                        source: work.source,
                        work,
                        records,
                        workspaces: [],
                      }),
                    }),
              ),
              shownPanel(
                sidePanel.finalReport,
                "Final report",
                "side-panel final-report",
              ),
              shownPanel(sidePanel.terminal, "Terminal", "side-panel"),
            ),
          }),
        }),
      }),
    }),
  });
}

export async function mountSidePanelIntentPage({
  work,
  records,
  hostOperations,
  readSource,
  ciReads,
}: {
  readonly work: PublishedWork;
  readonly records: readonly LaunchWithState[];
  readonly hostOperations: MachineSessions["hostOperations"];
  readonly readSource: IntentReadSource;
  readonly ciReads: IntentCiReadSource;
}) {
  await mountComponent(
    createElement(
      ReviewSourceOnPage,
      { value: unavailableReviewSource },
      createElement(
        IntentReadSourceOnPage,
        { value: readSource },
        createElement(
          IntentCiReadSourceOnPage,
          { value: ciReads },
          createElement(SidePanelIntentFrame, {
            work,
            records,
            hostOperations,
          }),
        ),
      ),
    ),
    { viewport: { width: 1280, height: 800 }, fillsViewport: true },
  );
}
