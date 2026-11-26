// Intent's reading place is kept by the page for the project
// (../../src/pageIntentReading.tsx): with a selected Taken story whose
// changes add a long spec two folders deep, that file selected with Purpose
// scrolled shows the same after the story's other views
// (../../src/intentStoryTabs.tsx); with "Changes only" on and a folder
// collapsed by hand as well, all of it shows the same after Development and
// back on the same Changes view. Neither return reads the locations nor the
// file's diff or published text again (../../src/answerMemo.ts). Another
// project shows none of it, and choosing the project again starts its reading
// afresh, at the story's CI comparison.

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { ReviewedFileText } from "../../src/storyReviewContract.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import {
  doughnutSource,
  pressedFileCount,
  workOf,
} from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  fullSha,
  inertCiReads,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { withoutBreakingHints } from "./intent-file-reading-page.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const storyA = {
  identity: "SEED-1#story-a",
  title: "Story A",
  branch: "claude/story-a",
};
const deepPath = "dashboard/tests/boundary/deep/long.spec.ts";
const deepSpec = `Added ${deepPath}`;
const work = makeMe.aPublishedWork
  .of(openDoughSource)
  .at(fullSha("a1a1a1a"))
  .taking(storyA)
  .please();
const doughnutWork = workOf(doughnutSource, "d0d0d0d");

// Trunk's location of specs in nested folders; the story changes one, adds
// one beside it and the long one two folders deep, and moves one into the
// location and one out of it.
const location = makeMe.anIntentLocation
  .at("dashboard/tests")
  .ofKind("typescript", ["**/*.spec.ts"])
  .selecting(
    "dashboard/tests/a.spec.ts",
    "dashboard/tests/boundary/kept.spec.ts",
    "dashboard/tests/other/c.spec.ts",
    "dashboard/tests/out/leaving.spec.ts",
  )
  .please();
const storyReview = makeMe.aStoryReview
  .modifying("dashboard/tests/a.spec.ts")
  .adding("dashboard/tests/boundary/b.spec.ts")
  .adding(deepPath, 120)
  .renaming(
    "scripts/arriving.spec.ts",
    "dashboard/tests/arriving/arriving.spec.ts",
  )
  .renaming("dashboard/tests/out/leaving.spec.ts", "scripts/leaving.spec.ts")
  .please();
const longLines = [...Array(120).keys()].map((n) => `long ${n + 1}`);
const longDiff = makeMe.aReviewedFileDiff
  .adding(deepPath, ...longLines)
  .please();
// The added spec's texts, which the diff reads for its omitted context.
const longText: ReviewedFileText = {
  kind: "text",
  baseline: null,
  tree: `${longLines.join("\n")}\n`,
};

const intent = page.getByRole("main", { name: "Intent", exact: true });
const intentText = () => withoutBreakingHints(intent.element().textContent);
const story = intentStoryCompare();

// Intent with Story A selected on its Changes, recording the page's reads of
// Intent's locations, of published text, and of a story file's diff and text.
async function openStoryChanges() {
  const reads: string[] = [];
  const intentReads: IntentReadSource = makeMe.anIntentReadSource
    .reading({
      readLocations: (source) => {
        reads.push("locations");
        return Promise.resolve(
          source.id === doughnutSource.id
            ? { status: "not-configured" }
            : { status: "configured", locations: [location] },
        );
      },
      readFile: (...[, path]) => {
        reads.push(`text ${path}`);
        return Promise.resolve(`${path}\n`);
      },
      readCandidates: () => Promise.resolve({ status: "absent" }),
    })
    .please();
  const review: ReviewSource = {
    review: () => Promise.resolve(storyReview),
    fileDiff: (query) => {
      reads.push(`story ${query.path}`);
      return Promise.resolve(longDiff);
    },
    fileText: (query) => {
      reads.push(`story text ${query.path}`);
      return Promise.resolve(longText);
    },
  };
  const mounted = await mountIntentCiPage({
    work,
    projects: [openDoughSource, doughnutSource],
    reads: {
      intent: intentReads,
      ci: inertCiReads({ readStatus: unanswered }),
      review,
    },
    machine: makeMe.aMachineAnswer
      .holdingWorkspaces({
        source: openDoughSource.id,
        identity: storyA.identity,
        agent: "claude",
        workspace: "/tmp/intent-story",
        branch: storyA.branch,
      })
      .please(),
  });
  await mounted.selectStory(storyA.identity, storyA.title);
  return { ...mounted, reads };
}

test("the deep spec read with Changes only on, out collapsed and Purpose scrolled is shown the same after Development and back, without reading again", async () => {
  const mounted = await openStoryChanges();
  await expect.element(story.changesOnly).toBeChecked();
  await story.folderToggle("out", true).click();
  await story.file(deepSpec).click();
  await expect.poll(story.diffCode).toContain("long 120");
  const offset = await story.scrollReadingHalfway();
  expect(offset).toBeGreaterThan(20);

  mounted.reads.length = 0;
  await mounted.showDevelopment();
  await expect.element(intent).not.toBeInTheDocument();
  await mounted.showIntent();
  await expect.element(story.pathReading).toBeVisible();

  await expect.element(story.changesOnly).toBeChecked();
  await expect
    .element(story.file(deepSpec))
    .toHaveAttribute("aria-pressed", "true");
  await expect.poll(story.diffName).toBe(deepSpec);
  await expect.poll(story.diffCode).toContain("long 120");
  for (const name of ["dashboard/tests", "boundary", "deep", "arriving"])
    await expect.element(story.folderToggle(name, true)).toBeVisible();
  await expect.element(story.folderToggle("out", false)).toBeVisible();
  await expect.poll(story.readingOffset).toBe(offset);
  expect(mounted.reads).toEqual([]);
});

test("another project shows none of the reading place, and choosing the project again starts its reading afresh", async () => {
  const mounted = await openStoryChanges();
  await story.changesOnly.click();
  await story.folderToggle("out", true).click();
  await story.file(deepSpec).click();
  await expect.poll(story.diffCode).toContain("long 120");
  expect(await story.scrollReadingHalfway()).toBeGreaterThan(20);

  await mounted.showWork(doughnutWork);
  await expect
    .poll(intentText)
    .toContain("No Intent locations are configured for Doughnut.");
  await expect.element(story.file(deepSpec)).not.toBeInTheDocument();
  expect(story.pressedControlCount()).toBe(0);

  // The story stays selected and opens at its CI comparison; its tree is
  // expanded as when first compared, with the toggle off and nothing
  // selected, so Story Home shows CI comparison.
  await mounted.showWork(work);
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  const ciPanel = intentCiStatus().panel;
  await expect.element(ciPanel).toBeVisible();
  await expect.element(story.pathReading).not.toBeInTheDocument();
  await expect
    .element(intent.getByRole("region", { name: "Purpose", exact: true }))
    .not.toBeInTheDocument();
  await expect.element(story.changesOnly).toBeChecked();
  await expect.element(story.folderToggle("out", true)).toBeVisible();
  await expect
    .element(story.file(deepSpec))
    .toHaveAttribute("aria-pressed", "false");
  expect(pressedFileCount()).toBe(0);
  expect(story.readingOffset()).toBe(0);
});
