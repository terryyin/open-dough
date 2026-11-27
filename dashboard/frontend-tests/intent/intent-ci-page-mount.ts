// Held-work mount of the production configured frame: typed view inputs for
// work, perspective and page reads; the frame's composition is
// ./intent-ci-page-tree.ts. The mount owns the reads a case leaves at their
// defaults and drives what the page shows as a case asks.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import type { PageReads } from "../../src/pageReads.tsx";
import type { PageStorySelection } from "../../src/pageStorySelection.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { recentStoriesKey, type RecentStory } from "../../src/recentStories.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import {
  withFramePreference,
  withPagePreferences,
} from "../../test-support/component-mount/framePreferences.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { withStoryResultFixture } from "../../test-support/component-mount/storyResultFixture.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { intentCiPageTree, type Shown } from "./intent-ci-page-tree.ts";

// The review a case leaves unavailable, as with no local review workspace.
const unavailableReviewSource: ReviewSource = {
  review: () =>
    Promise.resolve({
      kind: "unavailable",
      explanation: "No local review workspace is available.",
    }),
  fileDiff: () => Promise.reject(new Error("Unexpected review file diff read")),
  fileText: () => Promise.reject(new Error("Unexpected review file text read")),
};

// The banner's host status reads as unmeasured; a case that reads a final
// report or attaches a terminal answers the page's sessions itself.
export const unmeasuredHostSessions: PageReads["sessions"] = {
  ...pageReadsSupplying({}).sessions,
  readHostStatus: () =>
    Promise.resolve(
      makeMe.aHostStatus.with({ cpuPercent: null, freeBytes: null }).please(),
    ),
};

// The Sessions sidebar starts closed, the Board at its first column and Recent
// stories at `recentStories`, whatever an earlier case in this browser kept,
// and the case's end restores what was kept. With `selected`, the page opens
// with that story already selected, as after choosing its Board card. The page's reads are bound once:
// each project's notes and review states are created from the reads current
// at their first use, as production mounts PageReadsOnPage once with constant
// reads, so a case supplies every reply in `reads` at mount and never changes
// them afterwards.
export async function mountIntentCiPage({
  work,
  otherWork = [],
  projects = [work.source, ...otherWork.map((snapshot) => snapshot.source)],
  machine = makeMe.aMachineAnswer.please(),
  viewport = { width: 1280, height: 800 },
  initialPerspective = "intent",
  retryReference = () => undefined,
  recentStories = [],
  selected,
  reads,
}: {
  readonly work: PublishedWork;
  readonly otherWork?: readonly PublishedWork[];
  readonly projects?: readonly PublishedSource[];
  readonly machine?: MachineAnswer;
  readonly viewport?: { readonly width: number; readonly height: number };
  readonly initialPerspective?: "development" | "intent";
  readonly retryReference?: () => void;
  readonly recentStories?: readonly RecentStory[];
  readonly selected?: string;
  readonly reads: Pick<PageReads, "intent" | "ci"> & Partial<PageReads>;
}) {
  withPagePreferences();
  withFramePreference(recentStoriesKey, JSON.stringify(recentStories));
  const launches = machineSessionsAnswering({ answer: machine });
  let shown: Shown = {
    work,
    showsIntent: initialPerspective === "intent",
    opened: selected === undefined,
  };
  const pageReads = pageReadsSupplying(
    withStoryResultFixture(
      {
        review: unavailableReviewSource,
        sessions: unmeasuredHostSessions,
        ...reads,
      },
      () => shown.work,
    ),
  );
  const observations = new Map(
    [work, ...otherWork].map((snapshot) => [snapshot.source.id, snapshot]),
  );
  let committed: Shown | undefined;
  let selection: PageStorySelection | undefined;
  const onSelection = (next: PageStorySelection | undefined) => {
    selection = next;
  };
  const onCommit = (next: Shown) => {
    committed = next;
  };
  const select = (project: PublishedSource | undefined) => {
    if (project === undefined || project.id === shown.work.source.id) return;
    const snapshot = observations.get(project.id);
    if (snapshot !== undefined) void show({ ...shown, work: snapshot });
  };
  const render = () =>
    intentCiPageTree({
      shown,
      pageReads,
      projects,
      launches,
      select,
      retryReference,
      choosePerspective: (showsIntent) => {
        void show({ ...shown, showsIntent });
      },
      onCommit,
      onSelection,
    });
  const mounted = await mountComponent(render(), {
    viewport,
    fillsViewport: true,
  });
  async function show(next: Shown) {
    shown = next;
    observations.set(next.work.source.id, next.work);
    mounted.rerender(render());
    await expect.poll(() => committed).toBe(next);
  }
  // Selects the story as its Board card does, while Intent is closed, and
  // opens Intent on it.
  async function selectStory(identity: string) {
    if (shown.opened) await show({ ...shown, opened: false });
    else await expect.poll(() => committed).toBe(shown);
    selection?.select({ project: shown.work.source.id, identity });
    await show({ ...shown, showsIntent: true, opened: true });
    await expect
      .element(page.getByRole("main", { name: "Intent", exact: true }))
      .toHaveAttribute("data-selected-story", identity);
  }
  if (selected !== undefined) await selectStory(selected);
  const showDevelopment = () => show({ ...shown, showsIntent: false });
  const showIntent = () => show({ ...shown, showsIntent: true });
  return {
    showDevelopment,
    showIntent,
    showWork: (next: PublishedWork) => show({ ...shown, work: next }),
    // The card's own toggle is proved with the Board.
    selectStory,
  };
}
