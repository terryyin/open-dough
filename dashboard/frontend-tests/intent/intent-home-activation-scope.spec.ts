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
  backToStory,
  projectIntentLink,
} from "./intent-recent-stories-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const intent = page.getByRole("main", { name: "Intent", exact: true });
const story = intentStoryCompare();
const ci = intentCiStatus();
const frameContext = () =>
  document
    .querySelector(".intent-page-frame")
    ?.getAttribute("data-intent-context");

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
            makeMe.aStoryReview.modifying(browsed).please(),
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
  await selectBrowsedFile();
  return { judgedBranches, reviews, fileReads };
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

test("Project Intent judges main and browses in a selection of its own, cleared by activating CI status", async () => {
  const { judgedBranches, fileReads } = await readStoryChanges();

  await userEvent.click(projectIntentLink);

  await ci.judges("main");
  await ci.answers("Passed at 4774f60 (Add login)");
  expect(pressedFileCount()).toBe(0);
  await selectBrowsedFile();
  await activateChosenCiTab("Enter");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "false");
  await ci.judges("main");
  expect(judgedBranches).toContain("main");
  expect(fileReads).toContain(`${browsed}@${storiesTakenWork.revision}`);
});

test("Project Intent and Back to selected story focus each other's control, and the story's Changes returns with its file", async () => {
  const { reviews } = await readStoryChanges();

  await userEvent.click(projectIntentLink);
  await expect.element(backToStory).toHaveFocus();
  await expect
    .element(intent)
    .toHaveAttribute("data-selected-story", failingStory.identity);
  await expect.poll(frameContext).toBe("project");
  await selectBrowsedFile();
  await userEvent.click(backToStory);

  await expect.element(projectIntentLink).toHaveFocus();
  await expect
    .element(story.viewTab("Changes"))
    .toHaveAttribute("aria-selected", "true");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
  await expect.element(purpose).toBeVisible();
  expect(reviews).toContainEqual(
    expect.objectContaining({
      source: openDoughSource.id,
      identity: failingStory.identity,
    }),
  );
});
