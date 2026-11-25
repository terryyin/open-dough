// Directly activating Project Intent's CI status tab
// (../../src/IntentPage.tsx, ../../src/intentWorkspaceSelection.ts) or the
// selected story's CI comparison tab (../../src/intentStoryTabs.tsx) returns
// that scope to its CI view. The story's tab judges the selected story's branch
// under its header, while Changes keeps the file it read, and a visit to
// Project Intent judges main and browses in a selection of its own. The view
// tabs' keys and activation from Optimization Candidates:
// ./intent-home-activation-keys.spec.ts. A newer revision waiting behind its
// notice: ./intent-home-activation.spec.ts.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewQuery } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import {
  tapWhereShown,
  useTouchScreen,
} from "../navigation/board-touch-page.ts";
import { focus } from "../navigation/project-navigation-frame.ts";
import { popover, recent } from "../navigation/recent-stories-frame.ts";
import {
  browsed,
  fileControl,
  intentReadsRecording,
  purpose,
  selectBrowsedFile,
} from "./intent-browsed-file-page.ts";
import {
  activateChosenCiTab,
  pressedFileCount,
} from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  failingFailed,
  failingStory,
  inertCiReads,
  mainPassed,
  openDoughSource,
  storiesTakenWork,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  chooseWholeProject,
  intentScroll,
  intentRecentStories,
  storyHeading,
  storyHeadingIsReadable,
} from "./intent-recent-stories-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const intent = page.getByRole("main", { name: "Intent", exact: true });
const story = intentStoryCompare();
const ci = intentCiStatus();
const scopes = intentRecentStories(openDoughSource);

// The failing Taken story claimed on this machine, selected, with the browsed
// spec read in its Changes; judged branches, review queries and Intent's file
// reads are recorded.
async function readStoryChanges() {
  const judgedBranches: string[] = [];
  const reviews: ReviewQuery[] = [];
  const fileReads: string[] = [];
  const mounted = await mountIntentCiPage({
    work: storiesTakenWork,
    reads: {
      intent: intentReadsRecording(fileReads),
      ci: inertCiReads({
        readStatus: (...[, branch]) => {
          judgedBranches.push(branch);
          return Promise.resolve(
            branch === failingStory.branch ? failingFailed : mainPassed,
          );
        },
      }),
      review: {
        review: (query) => {
          reviews.push(query);
          return Promise.resolve(
            makeMe.aStoryReview.modifying(browsed).please({
              from: "e1".repeat(20),
              changes: makeMe.aStoryReview.modifying(browsed),
            }),
          );
        },
        fileDiff: unanswered,
        fileText: unanswered,
      },
    },
    machine: makeMe.aMachineAnswer
      .holdingWorkspaces({
        source: openDoughSource.id,
        identity: failingStory.identity,
        agent: "Akiho",
        workspace: "/tmp/intent-story",
        branch: failingStory.branch,
      })
      .please(),
  });
  await mounted.selectStory(failingStory.identity, failingStory.title);
  await story.chooseTab("Changes");
  await selectBrowsedFile("story");
  return { judgedBranches, reviews, fileReads, mounted };
}

test("activating CI comparison from Changes judges the selected story's branch under its header, and Changes keeps its file", async () => {
  await readStoryChanges();

  await story.chooseTab("CI comparison");

  await ci.judges(failingStory.branch);
  await ci.answers("Failed at fa11ed0 (Break the login)");
  await ci.notes("Story branch.");
  expect(ci.panel.element().textContent).not.toContain(failingStory.title);
  await expect.element(story.header).toBeVisible();
  await story.chooseTab("Changes");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
});

async function keepReadingOnShortViewport() {
  await readStoryChanges();
  await page.viewport(390, 320);
}

test("a touch opens the bookmark immediately when the story heading is readable above the fold of Changes", async () => {
  await keepReadingOnShortViewport();
  await useTouchScreen();
  const scroll = intentScroll();
  scroll.scrollTop = 0;
  const reading = scroll.scrollTop;
  await expect.poll(storyHeadingIsReadable).toBe(true);
  expect(
    story.viewTab("Changes").element().getBoundingClientRect().top,
  ).toBeGreaterThan(scroll.getBoundingClientRect().bottom);

  await tapWhereShown(recent.element());

  await expect.element(popover).toBeVisible();
  expect(scroll.scrollTop).toBe(reading);
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
});

test("the bookmark first reveals a clipped story heading even when its Changes tab is in the reading region", async () => {
  await keepReadingOnShortViewport();
  const scroll = intentScroll();
  const tab = story.viewTab("Changes").element();
  tab.scrollIntoView({ block: "start", behavior: "instant" });
  expect(storyHeading.element().getBoundingClientRect().bottom).toBeLessThan(
    scroll.getBoundingClientRect().top,
  );
  expect(tab.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    scroll.getBoundingClientRect().top,
  );
  expect(tab.getBoundingClientRect().bottom).toBeLessThan(
    scroll.getBoundingClientRect().bottom,
  );
  focus(recent);

  await userEvent.keyboard("{Enter}");
  await expect.element(popover).not.toBeInTheDocument();
  await expect.poll(storyHeadingIsReadable).toBe(true);
  await userEvent.keyboard("{Enter}");

  await expect.element(popover).toBeVisible();
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
});

test("project file reading survives Board navigation and its own CI status returns home", async () => {
  const { judgedBranches, fileReads, mounted } = await readStoryChanges();

  await chooseWholeProject();

  await ci.judges("main");
  await ci.answers("Passed at 4774f60 (Add login)");
  expect(pressedFileCount()).toBe(0);
  await selectBrowsedFile();
  await mounted.showDevelopment();
  await chooseWholeProject();
  await mounted.showIntent();
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
  await expect.element(purpose).toBeVisible();
  await activateChosenCiTab("Enter");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "false");
  await ci.judges("main");
  expect(judgedBranches).toContain("main");
  expect(fileReads).toContain(`${browsed}@${storiesTakenWork.revision}`);
});

test("Whole project opens trunk CI from a story diff and a recent starts its default comparison", async () => {
  const { reviews } = await readStoryChanges();
  const expectBookmarkOnly = async () => {
    for (const name of ["Project Intent", "Back to selected story"]) {
      await expect
        .element(intent.getByRole("button", { name, exact: true }))
        .not.toBeInTheDocument();
    }
  };
  await expectBookmarkOnly();
  await userEvent.click(story.includeMerged);
  await expect.element(story.includeMerged).toBeChecked();
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");

  await chooseWholeProject();

  await expect.element(recent).toHaveFocus();
  await expect.element(intent).not.toHaveAttribute("data-selected-story");
  await ci.judges(openDoughSource.ref);
  await expectBookmarkOnly();
  await selectBrowsedFile();
  await scopes.chooseRow(failingStory.identity);
  await scopes.showsStoryFromStart(failingStory.identity);
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(story.includeMerged).not.toBeChecked();
  await expectBookmarkOnly();
  expect(reviews).toContainEqual(
    expect.objectContaining({
      source: openDoughSource.id,
      identity: failingStory.identity,
    }),
  );

  await chooseWholeProject();
  await ci.judges(openDoughSource.ref);
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "false");
  await expect.element(purpose).not.toBeInTheDocument();
});
