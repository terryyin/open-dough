// Held-work mount of the production configured frame: typed view inputs for
// work, perspective and page reads, while ConfiguredDashboardFrame and
// ConfiguredDashboardContent own frame, banner, notice and scroll composition
// (../../src/configuredDashboardFrame.tsx, ../../src/configuredDashboardContent.tsx).
import { createElement, Fragment, useEffect } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { ConfiguredDashboardContent } from "../../src/configuredDashboardContent.tsx";
import { ConfiguredDashboardFrame } from "../../src/configuredDashboardFrame.tsx";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import { FollowUpNavigationOnPage } from "../../src/ciFollowUpNavigation.tsx";
import type { DashboardRoute } from "../../src/dashboardRouteUrl.ts";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { recentStoriesKey, type RecentStory } from "../../src/recentStories.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import {
  withFramePreference,
  withPagePreferences,
} from "../../test-support/component-mount/framePreferences.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { developmentCard } from "./intent-ci-development-card-page.ts";

// The review a case leaves unavailable, as with no local review workspace.
const unavailableReviewSource: ReviewSource = {
  review: () =>
    Promise.resolve({
      kind: "unavailable",
      explanation: "No local review workspace is available.",
    }),
  range: () => Promise.reject(new Error("Unexpected review range read")),
  fileDiff: () => Promise.reject(new Error("Unexpected review file diff read")),
  fileText: () => Promise.reject(new Error("Unexpected review file text read")),
};

// The banner's host status reads as unmeasured; a case that reads a final
// report or attaches a terminal answers the page's sessions itself.
export const unmeasuredHostSessions: PageReads["sessions"] = {
  readFinalReport: () =>
    Promise.reject(new Error("Unexpected final report read")),
  readHostStatus: () =>
    Promise.resolve(
      makeMe.aHostStatus.with({ cpuPercent: null, freeBytes: null }).please(),
    ),
  openTerminal: () => {
    throw new Error("Unexpected terminal attach");
  },
};

type Shown = { readonly work: PublishedWork; readonly showsIntent: boolean };

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

// The Sessions sidebar starts closed, the Board at its first column and Recent
// stories at `recentStories`, whatever an earlier case in this browser kept,
// and the case's end restores what was kept. The page's reads are bound once:
// each project's notes and review states are created from the reads current
// at their first use, as production mounts PageReadsOnPage once with constant
// reads, so a case supplies every reply in `reads` at mount and never changes
// them afterwards.
export async function mountIntentCiPage({
  work,
  projects = [work.source],
  machine = makeMe.aMachineAnswer.please(),
  viewport = { width: 1280, height: 800 },
  initialPerspective = "intent",
  retryReference = () => undefined,
  recentStories = [],
  reads,
}: {
  readonly work: PublishedWork;
  readonly projects?: readonly PublishedWork["source"][];
  readonly machine?: MachineAnswer;
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly initialPerspective?: "development" | "intent";
  readonly retryReference?: () => void;
  readonly recentStories?: readonly RecentStory[];
  readonly reads: Pick<PageReads, "intent" | "ci"> & Partial<PageReads>;
}) {
  withPagePreferences();
  withFramePreference(recentStoriesKey, JSON.stringify(recentStories));
  const launches = machineSessionsAnswering({ answer: machine });
  const pageReads = pageReadsSupplying({
    review: unavailableReviewSource,
    sessions: unmeasuredHostSessions,
    ...reads,
  });
  let shown: Shown = { work, showsIntent: initialPerspective === "intent" };
  let committed: Shown | undefined;
  const onCommit = (next: Shown) => {
    committed = next;
  };
  const noop = () => undefined;
  const render = () => {
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
                show: noop,
                select: noop,
                development: showsBoard,
                work: shown.work,
              },
              storyReference: {
                projects,
                selected: source.id,
                work: shown.work,
                reading: false,
                failure: undefined,
                show: noop,
                retry: retryReference,
                suspended: showsIntent,
              },
              banner: createElement(DashboardBanner, {
                source,
                perspective: route.perspective,
                onOpenSettings: noop,
                onSelect: noop,
                onSelectPerspective: (next) => {
                  void show({ ...shown, showsIntent: next === "intent" });
                },
              }),
              children: (storyNotice) =>
                createElement(
                  Fragment,
                  null,
                  createElement(CommittedView, { shown, onCommit }),
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
  };
  const mounted = await mountComponent(render(), {
    viewport,
    fillsViewport: true,
  });
  async function show(next: Shown) {
    shown = next;
    mounted.rerender(render());
    await expect.poll(() => committed).toBe(next);
  }
  const showDevelopment = () => show({ ...shown, showsIntent: false });
  const showIntent = () => show({ ...shown, showsIntent: true });
  return {
    showDevelopment,
    showIntent,
    showWork: (next: PublishedWork) => show({ ...shown, work: next }),
    async selectStory(identity: string, title: string) {
      await showDevelopment();
      await developmentCard(title).toggle();
      await showIntent();
      await expect
        .element(page.getByRole("main", { name: "Intent", exact: true }))
        .toHaveAttribute("data-selected-story", identity);
    },
  };
}
