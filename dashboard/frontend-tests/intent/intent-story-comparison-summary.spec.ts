// The selected story's comparison bar: a one-line summary naming the active
// comparison, with its details collapsed until the eye opens them; Refresh in
// the details re-reads while they stay open; the unavailable and failed states
// take the summary's place. The files toggle, the comparison choice and
// Include merged changes lead the summary on the bar's row.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  controlsFit,
  expectOneRow,
  fileLayout,
} from "./intent-file-layout-page.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  openDoneStoryComparison,
  openStoryAComparison,
  publishedCompletion,
} from "./intent-story-compare-stories.ts";
import {
  landedRun as run,
  landedRunLaunched as launched,
  oid,
  openWithLandedRun,
} from "./intent-story-landed-run-stories.ts";

const branchReview = (...paths: string[]) =>
  paths
    .reduce(
      (review, path) => review.modifying(path),
      makeMe.aStoryReview.modifying("dashboard/tests/a.spec.ts"),
    )
    .please();

test("the summary names the comparison and opens the branch, revisions, attribution and Refresh", async () => {
  await openStoryAComparison({ review: () => Promise.resolve(branchReview()) });
  const story = intentStoryCompare();

  await expect
    .poll(story.summaryText)
    .toContain("Published completion — 1 changed file");
  await expect
    .element(story.detailsEye(false))
    .toHaveAttribute("aria-expanded", "false");
  // Hidden details leave the accessibility tree.
  expect(story.details.query()).toBeNull();

  await story.openDetails();
  await expect
    .element(story.detailsEye(true))
    .toHaveAttribute("aria-expanded", "true");
  for (const text of [
    "Published story branch",
    "claude · ",
    "Baseline",
    "Head",
  ])
    await expect.poll(story.detailsText).toContain(text);
  await expect.element(story.refreshButton).toBeVisible();
});

test("a Done story's details hold its completion and its time", async () => {
  await openDoneStoryComparison({
    review: () => Promise.resolve(publishedCompletion()),
  });
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("Published completion");

  await story.openDetails();
  for (const text of [
    "Published completion",
    "Completed",
    "Baseline",
    "Completion",
  ])
    await expect.poll(story.detailsText).toContain(text);
  await expect.element(story.refreshButton).toBeVisible();
});

test("Refresh re-reads, reports the refreshed comparison and keeps the details open with focus on it", async () => {
  let calls = 0;
  await openStoryAComparison({
    review: () => {
      calls += 1;
      return Promise.resolve(
        calls === 1
          ? branchReview()
          : branchReview("dashboard/tests/b.spec.ts"),
      );
    },
  });
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("1 changed file");

  await story.refresh();
  await expect.poll(story.summaryText).toContain("2 changed files");
  await expect
    .poll(story.summaryText)
    .toContain("Review refreshed at published head");
  await expect.element(story.details).toBeVisible();
  await expect.element(story.refreshButton).toHaveFocus();
  expect(calls).toBe(2);
});

test("without a comparison the summary says so and the details explain why", async () => {
  const explanation =
    "The recorded story branch claude/story-a is not published on origin.";
  await openStoryAComparison({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.unavailable(explanation).please()),
  });
  const story = intentStoryCompare();
  await expect.poll(story.summaryText).toContain("No comparison is available.");

  await story.openDetails();
  await expect.poll(story.detailsText).toContain(explanation);
});

test("a failed read reports the failure with Retry in the summary", async () => {
  let calls = 0;
  await openStoryAComparison({
    review: () => {
      calls += 1;
      return calls === 1
        ? Promise.reject(new Error("review read failed"))
        : Promise.resolve(branchReview());
    },
  });
  const story = intentStoryCompare();
  await expect
    .poll(story.summaryText)
    .toContain("The story's changes could not be read.");
  await expect
    .element(story.summary.getByRole("button", { name: "Retry" }))
    .toBeVisible();

  await story.retry();
  await expect
    .poll(story.summaryText)
    .toContain("Published completion — 1 changed file");
});

test("the files toggle, comparison choice, Include merged changes and summary share a row above Story Home that wraps without overflow", async () => {
  await openWithLandedRun();
  await page.viewport(1280, 800);
  const story = intentStoryCompare();
  const files = fileLayout();
  await expect.poll(story.summaryText).toContain("Published completion");
  const row = [
    files.toggle,
    story.choice("Published completion"),
    story.includeMerged,
    story.summary,
  ];
  const boxes = expectOneRow(...row);

  const title = story.header.element().querySelector("h2");
  expect(boxes[0]?.top).toBeGreaterThanOrEqual(
    title?.getBoundingClientRect().bottom ?? Infinity,
  );
  const barBottom = Math.max(...boxes.map((box) => box.bottom));
  expect(
    story.viewTab("CI comparison").element().getBoundingClientRect().top,
  ).toBeGreaterThanOrEqual(barBottom);
  expect(files.browser().top).toBeGreaterThanOrEqual(barBottom);
  expect(files.browser().top - barBottom).toBeLessThanOrEqual(32);

  await page.viewport(375, 800);
  await controlsFit(...row);
});

test("choosing a landed run updates the summary and the open details, and Include merged changes follows its support", async () => {
  await openWithLandedRun();
  const story = intentStoryCompare();
  await expect.element(story.includeMerged).toBeVisible();
  await story.openDetails();

  await story.chooseRun(run.key);
  await expect.poll(story.summaryText).toContain(launched);
  await expect.poll(story.summaryText).toContain("1 changed file");
  await expect.poll(story.detailsText).toContain(launched);
  await expect
    .poll(story.detailsText)
    .toContain(`From ${oid("1")} to ${oid("2")}.`);
  await expect.element(story.details).toBeVisible();
  await expect.element(story.includeMerged).not.toBeInTheDocument();

  await activateComparisonControl(story.choice("Published completion"));
  await expect.poll(story.summaryText).toContain("Published completion");
  await expect.element(story.includeMerged).toBeVisible();
  await expect.element(story.details).toBeVisible();
});
