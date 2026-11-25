import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect, test } from "vitest";
import { intentCiStatus } from "./intent-ci-status-page.ts";
import {
  changed,
  openStoryChanges,
  productPath,
} from "./intent-story-changes-fixtures.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";

test("without configured Intent locations the CI view offers the story's changed files and opens their diffs", async () => {
  const { reads } = await openStoryChanges({
    hasLocations: false,
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(productPath, "product change").please(),
      ),
  });
  const story = intentStoryCompare();
  await expect.element(intentCiStatus().panel).toBeVisible();
  await expect
    .element(
      story.sidebar.getByText(
        /^No Intent locations are configured for Open Dough\./,
      ),
    )
    .toBeVisible();
  const outside = story.tree;
  await expect
    .element(
      outside.getByRole("button", {
        name: /^(Modified|Renamed|Added|Deleted) /,
      }),
    )
    .toHaveLength(8);
  for (const name of [
    changed.modified,
    changed.added,
    changed.deleted,
    changed.into,
    changed.outOf,
    changed.product,
    changed.notes,
    "Renamed dashboard/tests/between/moved.spec.ts → tests/moved.sh",
  ])
    await expect.element(story.file(name)).toBeVisible();
  await expect.element(story.folderToggle("docs", true)).toBeVisible();

  await activateComparisonControl(story.file(changed.product));
  await expect.poll(story.diffName).toBe(changed.product);
  await expect.poll(story.diffCode).toContain("product change");
  expect(reads.diffs).toEqual([productPath]);
});

async function showsUnavailableChanges(explanation: string) {
  const story = intentStoryCompare();
  await story.browseFiles();
  await expect
    .element(story.header.getByRole("status"))
    .toHaveTextContent("No comparison is available.");
  await story.openDetails();
  await expect
    .element(
      story.header.getByText(
        `${explanation} Intent shows the published tree without the story's changes.`,
        { exact: true },
      ),
    )
    .toBeVisible();
  await expect
    .element(story.header.getByRole("button", { name: "Retry", exact: true }))
    .not.toBeInTheDocument();
}

test("a Taken story keeps its published branch gap visible in Changes without a local worktree", async () => {
  const explanation =
    "The recorded story branch claude/story-a is not published on origin.";
  await openStoryChanges({
    machine: makeMe.aMachineAnswer.please(),
    review: () =>
      Promise.resolve(makeMe.aStoryReview.unavailable(explanation).please()),
  });
  await showsUnavailableChanges(explanation);
});

test("a story whose claim several worktrees hold keeps the review's explanation in Changes", async () => {
  const explanation =
    "Several worktrees on this machine hold this story's claim for Yui-chan: ~/a, ~/b. The review cannot choose one.";
  await openStoryChanges({
    review: () =>
      Promise.resolve(makeMe.aStoryReview.unavailable(explanation).please()),
  });
  await showsUnavailableChanges(explanation);
});
