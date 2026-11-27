// The production configured frame as the held-work mount
// (./intent-ci-page-mount.ts) renders it for what a case shows now:
// ConfiguredDashboardFrame and ConfiguredDashboardContent own frame, banner,
// notice and scroll composition (../../src/configuredDashboardFrame.tsx,
// ../../src/configuredDashboardContent.tsx) under the page's reads, projects,
// launches and follow-up navigation, with handles that report the committed
// view and the page's story selection back to the case.
import { createElement, Fragment, useContext, useEffect } from "react";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { FollowUpNavigationOnPage } from "../../src/ciFollowUpNavigation.tsx";
import { ConfiguredDashboardContent } from "../../src/configuredDashboardContent.tsx";
import { ConfiguredDashboardFrame } from "../../src/configuredDashboardFrame.tsx";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import type { DashboardRoute } from "../../src/dashboardRouteUrl.ts";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import {
  StorySelectionOnPage,
  type PageStorySelection,
} from "../../src/pageStorySelection.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";

// `opened` says whether the page's content is shown; while it is not, Intent
// is closed as it is on Development, and opening it reads the selection anew.
export type Shown = {
  readonly work: PublishedWork;
  readonly showsIntent: boolean;
  readonly opened: boolean;
};

// Hands the case the page's story selection, which a Board card toggles.
function SelectionHandle({
  onSelection,
}: {
  readonly onSelection: (selection: PageStorySelection | undefined) => void;
}) {
  onSelection(useContext(StorySelectionOnPage));
  return null;
}

function CommittedView({
  shown,
  onCommit,
}: {
  readonly shown: Shown;
  readonly onCommit: (committed: Shown) => void;
}) {
  useEffect(() => {
    onCommit(shown);
  }, [onCommit, shown]);
  return null;
}

const noop = () => undefined;

export function intentCiPageTree({
  shown,
  pageReads,
  projects,
  launches,
  select,
  retryReference,
  choosePerspective,
  onCommit,
  onSelection,
}: {
  readonly shown: Shown;
  readonly pageReads: PageReads;
  readonly projects: readonly PublishedSource[];
  readonly launches: MachineSessions;
  readonly select: (project: PublishedSource | undefined) => void;
  readonly retryReference: () => void;
  readonly choosePerspective: (showsIntent: boolean) => void;
  readonly onCommit: (committed: Shown) => void;
  readonly onSelection: (selection: PageStorySelection | undefined) => void;
}) {
  const { source } = shown.work;
  const showsIntent = shown.showsIntent;
  const showsBoard = !showsIntent;
  const route: DashboardRoute = {
    source,
    view: "stories",
    perspective: showsIntent ? "intent" : "development",
  };
  return createElement(
    PageReadsOnPage,
    { reads: pageReads },
    createElement(ProjectsOnPage, {
      projects,
      replaceProjects: noop,
      children: createElement(
        LaunchesOnPage,
        { value: launches },
        createElement(
          FollowUpNavigationOnPage,
          { value: noop },
          createElement(ConfiguredDashboardFrame, {
            launches,
            stories: {
              selected: source.id,
              shown: showsBoard ? source.id : undefined,
              show: select,
              select,
              development: showsBoard,
              work: shown.work,
            },
            storyReference: {
              projects,
              selected: source.id,
              work: shown.work,
              reading: false,
              failure: undefined,
              show: select,
              retry: retryReference,
              suspended: showsIntent,
            },
            banner: createElement(DashboardBanner, {
              source,
              perspective: route.perspective,
              onOpenSettings: noop,
              onSelect: select,
              onSelectPerspective: (next) => {
                choosePerspective(next === "intent");
              },
            }),
            children: (storyNotice) =>
              createElement(
                Fragment,
                null,
                createElement(CommittedView, { shown, onCommit }),
                createElement(SelectionHandle, { onSelection }),
                shown.opened &&
                  createElement(ConfiguredDashboardContent, {
                    source,
                    work: shown.work,
                    route,
                    destination: undefined,
                    showsIntent,
                    showsRoster: false,
                    showsBoard,
                    storyNotice,
                    attempt: { status: "read" },
                    reading: false,
                    refresh: noop,
                    withheld: false,
                    recoversAt: undefined,
                    limitedUntil: undefined,
                    notice: "",
                    launches,
                    visibility: "visible",
                    readFailure: undefined,
                    openRoster: noop,
                    rosterAgent: undefined,
                    onBack: noop,
                    showStories: noop,
                  }),
              ),
          }),
        ),
      ),
    }),
  );
}
