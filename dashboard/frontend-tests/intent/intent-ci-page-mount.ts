// The production page frame around the project's Board or Intent body
// (../../src/boardOrIntent.tsx), as ../../src/ConfiguredDashboard.tsx
// composes them, with the case's work, machine and page reads. The case
// switches between Development and Intent, to another project's work, and
// selects a story by its card, as the page does.
import { createElement, useEffect } from "react";
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { BoardOrIntent } from "../../src/boardOrIntent.tsx";
import { FollowUpNavigationOnPage } from "../../src/ciFollowUpNavigation.tsx";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageFrame } from "../../src/PageFrame.tsx";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { StoryReferenceNavigation } from "../../src/storyNavigation.tsx";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { unavailableReviewSource } from "./intent-ci-status-fixtures.ts";
import { developmentCard } from "./intent-ci-development-card-page.ts";

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

export async function mountIntentCiPage({
  work,
  projects = [work.source],
  machine = makeMe.aMachineAnswer.please(),
  reads,
}: {
  readonly work: PublishedWork;
  readonly projects?: readonly PublishedWork["source"][];
  // The machine's sessions and the worktrees holding a story's claim.
  readonly machine?: MachineAnswer;
  // Review changes' reads default to a machine without a review workspace.
  readonly reads: Pick<PageReads, "intent" | "ci"> & Partial<PageReads>;
}) {
  const launches = machineSessionsAnswering(machine);
  const pageReads = pageReadsSupplying({
    review: unavailableReviewSource,
    sessions: unmeasuredHostSessions,
    ...reads,
  });
  let shown: Shown = { work, showsIntent: true };
  let committed: Shown | undefined;
  const onCommit = (next: Shown) => {
    committed = next;
  };
  const render = () => {
    const { source } = shown.work;
    const body = createElement(BoardOrIntent, {
      source,
      work: shown.work,
      launches,
      showsBoard: !shown.showsIntent,
      showsIntent: shown.showsIntent,
      followUp: undefined,
      visibility: "visible",
      limitStands: false,
      openRoster: () => undefined,
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
          retry: () => undefined,
          suspended: shown.showsIntent,
          children: () => body,
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
    viewport: { width: 1280, height: 800 },
    fillsViewport: true,
  });
  // Each view change returns once the page committed it.
  const show = async (next: Shown) => {
    shown = next;
    mounted.rerender(render());
    await expect.poll(() => committed).toBe(next);
  };
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
