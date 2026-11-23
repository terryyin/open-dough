// The production page frame around the banner, the story reference notice and
// the project's Board or Intent body (../../src/boardOrIntent.tsx) in its
// perspective's scroll container, as ../../src/ConfiguredDashboard.tsx
// composes them, with the case's work, machine, page reads and kept Recent
// stories. The case switches between Development and Intent, by the banner's
// perspective or directly, to another project's work, and selects a story by
// its card, as the page does.
import { createElement, Fragment, useEffect, type ReactNode } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { BoardOrIntent } from "../../src/boardOrIntent.tsx";
import { DashboardBanner } from "../../src/DashboardBanner.tsx";
import { FollowUpNavigationOnPage } from "../../src/ciFollowUpNavigation.tsx";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageFrame } from "../../src/PageFrame.tsx";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { PerspectiveScroll } from "../../src/perspectiveScroll.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { recentStoriesKey, type RecentStory } from "../../src/recentStories.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { StoryReferenceNavigation } from "../../src/storyNavigation.tsx";
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

// Reports each view of work the page committed.
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
  // The machine's sessions and the worktrees holding a story's claim.
  readonly machine?: MachineAnswer;
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly initialPerspective?: "development" | "intent";
  readonly retryReference?: () => void;
  // The stories this browser kept as recently selected, most recent first.
  readonly recentStories?: readonly RecentStory[];
  // Review changes' reads default to a machine without a review workspace.
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
  const render = () => {
    const { source } = shown.work;
    const body = (notice: ReactNode) =>
      createElement(
        PerspectiveScroll,
        { perspective: shown.showsIntent ? "intent" : "board" },
        shown.showsIntent
          ? null
          : createElement("header", { className: "page-header" }, notice),
        createElement(BoardOrIntent, {
          source,
          work: shown.work,
          launches,
          showsBoard: !shown.showsIntent,
          showsIntent: shown.showsIntent,
          followUp: undefined,
          visibility: "visible",
          limitStands: false,
          openRoster: () => undefined,
        }),
      );
    // The banner's project choice is the case's work, changed by showWork.
    const banner = createElement(DashboardBanner, {
      source,
      perspective: shown.showsIntent ? "intent" : "development",
      onOpenSettings: () => undefined,
      onSelect: () => undefined,
      onSelectPerspective: (next) => {
        void show({ ...shown, showsIntent: next === "intent" });
      },
    });
    const frame = createElement(PageFrame, {
      sessions: launches,
      stories: {
        selected: source.id,
        shown: shown.showsIntent ? undefined : source.id,
        show: () => undefined,
        select: () => undefined,
        development: !shown.showsIntent,
        work: shown.work,
      },
      children: [
        createElement(CommittedView, { key: "committed", shown, onCommit }),
        createElement(StoryReferenceNavigation, {
          key: "body",
          projects,
          selected: source.id,
          work: shown.work,
          reading: false,
          failure: undefined,
          show: () => undefined,
          retry: retryReference,
          suspended: shown.showsIntent,
          children: (notice) =>
            createElement(
              Fragment,
              null,
              banner,
              shown.showsIntent ? notice : null,
              body(notice),
            ),
        }),
      ],
    });
    return createElement(
      PageReadsOnPage,
      { reads: pageReads },
      createElement(ProjectsOnPage, {
        projects,
        replaceProjects: () => undefined,
        children: createElement(
          LaunchesOnPage,
          { value: launches },
          createElement(
            FollowUpNavigationOnPage,
            { value: () => undefined },
            frame,
          ),
        ),
      }),
    );
  };
  const mounted = await mountComponent(render(), {
    viewport,
    fillsViewport: true,
  });
  // Each view change returns once the page committed it.
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
    // The story card titled `title`, Taken or recently Done, toggles its
    // selection on Development, and Intent reads story `identity`.
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
