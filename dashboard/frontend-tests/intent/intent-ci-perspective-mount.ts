// Minimal production IntentPerspective mount and homepage page helpers. A
// case answers the page's reads it exercises, Intent's and its CI's at least,
// and may select one of the work's stories, as the page's story selection
// does.
import { createElement, useEffect } from "react";
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import { IntentPerspective } from "../../src/IntentPerspective.tsx";
import { IntentPageProviders } from "../../src/intentPageProviders.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import type { LocalWorkspace } from "../../src/localWorkspace.ts";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import {
  StorySelectionProvider,
  usePageStorySelection,
} from "../../src/pageStorySelection.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { launches } from "../review/story-review-page-contexts.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { fullSha } from "./intent-ci-status-fixtures.ts";

export const workOf = (
  source: PublishedSource,
  shortSha: string,
): PublishedWork =>
  makeMe.aPublishedWork.of(source).at(fullSha(shortSha)).please();

export const doughnutSource: PublishedSource = makeMe.aPublishedSource
  .with({
    id: "doughnut",
    label: "Doughnut",
    repository: "nerds-odd-e/doughnut",
    ref: "main",
  })
  .please();

export const unavailableReviewSource: ReviewSource = {
  review: () =>
    Promise.resolve({
      kind: "unavailable",
      explanation: "No local review workspace is available.",
    }),
  range: () => Promise.reject(new Error("Unexpected review range read")),
  fileDiff: () => Promise.reject(new Error("Unexpected review file diff read")),
  fileText: () => Promise.reject(new Error("Unexpected review file text read")),
};

type StorySelectionApi = ReturnType<typeof usePageStorySelection>["api"];

function PerspectiveScene({
  work,
  showsIntent,
  workspaces,
  onCommit,
  onSelection,
}: {
  readonly work: PublishedWork;
  readonly showsIntent: boolean;
  readonly workspaces: readonly LocalWorkspace[];
  readonly onCommit: (committed: PublishedWork) => void;
  readonly onSelection: (api: StorySelectionApi) => void;
}) {
  const selection = usePageStorySelection();
  useEffect(() => {
    onCommit(work);
  }, [onCommit, work]);
  useEffect(() => {
    onSelection(selection.api);
  }, [onSelection, selection.api]);
  return createElement(StorySelectionProvider, {
    selection,
    children: createElement(LaunchesOnPage, {
      value: launches,
      children: createElement(IntentPageProviders, {
        project: work.source.id,
        children:
          showsIntent &&
          createElement(IntentReadRecovery, {
            visibility: "visible",
            limitStands: false,
            children: createElement(IntentPerspective, {
              source: work.source,
              work,
              records: [],
              workspaces,
            }),
          }),
      }),
    }),
  });
}

export async function mountIntentPerspective({
  work,
  reads,
  workspaces = [],
}: {
  readonly work: PublishedWork;
  // Review changes' reads default to a machine without a review workspace.
  readonly reads: Pick<PageReads, "intent" | "ci"> & Partial<PageReads>;
  // This machine's worktrees holding a story's claim, which offer that story
  // a comparison.
  readonly workspaces?: readonly LocalWorkspace[];
}) {
  let currentWork = work;
  let committedWork: PublishedWork | undefined;
  let currentShown = true;
  let selectionApi: StorySelectionApi | undefined;
  const onCommit = (committed: PublishedWork) => {
    committedWork = committed;
  };
  const onSelection = (api: StorySelectionApi) => {
    selectionApi = api;
  };
  const render = () =>
    createElement(
      PageReadsOnPage,
      {
        reads: pageReadsSupplying({
          review: unavailableReviewSource,
          ...reads,
        }),
      },
      createElement(PerspectiveScene, {
        work: currentWork,
        showsIntent: currentShown,
        workspaces,
        onCommit,
        onSelection,
      }),
    );
  const mounted = await mountComponent(render(), {
    viewport: { width: 1280, height: 800 },
    fillsViewport: true,
  });
  return {
    // The page selects the work's story `identity`, as a card's click does,
    // and Intent reads it.
    async selectStory(identity: string) {
      await expect.poll(() => selectionApi).toBeDefined();
      selectionApi?.select({ project: currentWork.source.id, identity });
      await expect
        .element(page.getByRole("main", { name: "Intent", exact: true }))
        .toHaveAttribute("data-selected-story", identity);
    },
    showDevelopment() {
      currentShown = false;
      mounted.rerender(render());
    },
    showIntent() {
      currentShown = true;
      mounted.rerender(render());
    },
    async showWork(next: PublishedWork) {
      currentWork = next;
      mounted.rerender(render());
      await expect.poll(() => committedWork).toBe(next);
    },
  };
}

export const filesColumnVisible = () =>
  document.querySelector<HTMLElement>(".intent-locations")?.checkVisibility() ??
  false;

export async function activateChosenCiTab(how: "click" | "Enter" | "Space") {
  const tab = intentViewTab("CI status");
  if (how === "click") {
    await userEvent.click(tab);
  } else {
    tab.element().focus();
    await userEvent.keyboard(how === "Enter" ? "{Enter}" : " ");
  }
  await expect.element(tab).toHaveAttribute("aria-selected", "true");
}

export function presentElement<T>(found: T | null | undefined): T {
  if (found === null || found === undefined) {
    throw new Error("Expected element in document");
  }
  return found;
}

export async function expandLocationAndFolders(locationPath: string) {
  const bodyId = `${intentLocationIdPrefix(locationPath)}-body`;
  const locationToggle = () =>
    document.querySelector<HTMLButtonElement>(
      `button.intent-location-toggle[aria-controls="${bodyId}"]`,
    );
  await expect.poll(() => locationToggle() !== null).toBe(true);
  await userEvent.click(page.elementLocator(presentElement(locationToggle())));
  await expect
    .poll(() => locationToggle()?.getAttribute("aria-expanded"))
    .toBe("true");
  const nestedToggle = () =>
    document.querySelector<HTMLButtonElement>(
      `#${CSS.escape(bodyId)} button.story-review-folder`,
    );
  await expect.poll(() => nestedToggle() !== null).toBe(true);
  await userEvent.click(page.elementLocator(presentElement(nestedToggle())));
  await expect
    .poll(() => nestedToggle()?.getAttribute("aria-expanded"))
    .toBe("true");
  return locationToggle;
}

export const locationNameControl = (locationPath: string) =>
  page.elementLocator(
    presentElement(
      document.querySelector<HTMLElement>(
        `button.intent-location-name[data-location-path="${locationPath}"]`,
      ),
    ),
  );

export const folderNameControl = (folderName: string) =>
  page.elementLocator(
    presentElement(
      [
        ...document.querySelectorAll<HTMLElement>(
          "button.story-review-folder-name",
        ),
      ].find((button) => button.textContent.includes(folderName)),
    ),
  );
