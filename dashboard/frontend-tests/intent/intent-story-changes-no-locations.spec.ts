import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  changed,
  openStoryChanges,
  productPath,
} from "./intent-story-changes-fixtures.ts";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";

test("without configured Intent locations Changes lists the story's changed files with their diffs beside the explanation", async () => {
  const { reads } = await openStoryChanges({
    hasLocations: false,
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(productPath, "product change").please(),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  const changes = page.getByRole("tabpanel", { name: "Changes", exact: true });
  await expect
    .element(
      changes.getByText(/^No Intent locations are configured for Open Dough\./),
    )
    .toBeVisible();
  const outside = story.outsideGroup;
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
    await expect.element(story.outsideFile(name)).toBeVisible();
  await expect.element(story.folderToggle("docs", true)).toBeVisible();

  await activateComparisonControl(story.outsideFile(changed.product));
  await expect.poll(story.diffName).toBe(changed.product);
  await expect.poll(story.diffCode).toContain("product change");
  expect(reads.diffs).toEqual([productPath]);
});

async function showsUnavailableChanges(explanation: string) {
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
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
