// Directly activating Project Intent's CI status tab
// (../../src/IntentPage.tsx, ../../src/intentWorkspaceSelection.ts) or the
// selected story's CI comparison tab (../../src/intentStoryTabs.tsx) returns
// that scope to its CI view. The story's tab judges the selected story's branch
// under its header, while Changes keeps the file it read, and a visit to
// Project Intent judges main and browses in a selection of its own; arrow
// keys, Home and End only choose the view, so a file read before Optimization
// Candidates is still selected and read, until CI status itself is activated.
// The project URL kept across those keys:
// ../../../e2e/intent/intent-project-visit-ci.spec.ts. A newer revision
// waiting behind its notice: ./intent-home-activation.spec.ts.

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocations } from "../../src/authenticatedIntentRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewQuery } from "../../src/reviewSource.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import {
  activateChosenCiTab,
  openEveryFolder,
  pressedFileCount,
  workOf,
} from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  failingFailed,
  failingStory,
  inertCiReads,
  judgedStatus,
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

// Nested in a folder the reader opens under its location.
const browsed = "dashboard/tests/nested/browse.spec.ts";
const configuredLocations: IntentLocations = {
  status: "configured",
  locations: [
    makeMe.anIntentLocation
      .at("dashboard/tests")
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(browsed)
      .please(),
  ],
};

// Intent's reads of the browsed spec, recording each file read's path and
// revision.
function intentReadsRecording(fileReads: string[]): IntentReadSource {
  return {
    readLocations: () => Promise.resolve(configuredLocations),
    readFile: (...[, path, revision]) => {
      fileReads.push(`${path}@${revision}`);
      return Promise.resolve(`import { test } from "vitest";\n`);
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
}

const intent = page.getByRole("main", { name: "Intent", exact: true });
const story = intentStoryCompare();
const ci = intentCiStatus();
// The browsed spec's control, named by its path after any change kind.
const fileControl = () =>
  intent.getByRole("button", {
    name: new RegExp(`(^|\\s)${browsed.replaceAll(".", "\\.")}(,|$)`),
  });
const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
const frameContext = () =>
  document
    .querySelector(".intent-page-frame")
    ?.getAttribute("data-intent-context");

async function selectBrowsedFile() {
  await openEveryFolder();
  await userEvent.click(fileControl());
  await expectFileRead();
}

async function expectFileRead() {
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "true");
  await expect.element(purpose).toBeVisible();
  await ci.isAbsent();
}

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
        range: unanswered,
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
  await expect
    .poll(
      () => ci.panel.element().querySelector(".intent-ci-story")?.textContent,
    )
    .toBe("Story branch.");
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
    .element(story.tab("Changes"))
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

test("arrow keys, Home and End choose CI status again with the file still read; activating CI status from Optimization Candidates returns home", async () => {
  await mountIntentCiPage({
    work: workOf(openDoughSource, "a1b2c3d"),
    reads: {
      intent: intentReadsRecording([]),
      ci: inertCiReads({
        readStatus: () =>
          Promise.resolve(judgedStatus("main", "pass", "a1b2c3d", "Add login")),
      }),
    },
  });
  await ci.answers("Passed at a1b2c3d (Add login)");
  await selectBrowsedFile();
  const ciTab = intentViewTab("CI status");
  const candidates = intentViewTab("Optimization Candidates");

  for (const [away, back] of [
    ["ArrowRight", "ArrowLeft"],
    ["End", "Home"],
    ["ArrowLeft", "ArrowRight"],
  ] as const) {
    ciTab.element().focus();
    await userEvent.keyboard(`{${away}}`);
    await expect.element(candidates).toHaveAttribute("aria-selected", "true");
    await expect.element(candidates).toHaveFocus();
    await userEvent.keyboard(`{${back}}`);
    await expect.element(ciTab).toHaveAttribute("aria-selected", "true");
    await expect.element(ciTab).toHaveFocus();
    await expectFileRead();
  }

  // Clicking CI status from Optimization Candidates returns home.
  await userEvent.click(candidates);
  await expect.element(candidates).toHaveAttribute("aria-selected", "true");
  await activateChosenCiTab("click");
  await ci.answers("Passed at a1b2c3d (Add login)");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "false");
});
