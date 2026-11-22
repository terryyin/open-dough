// Intent's Compare choice reads a Taken story through Review changes' own
// selection: a commit range chosen by its two ends changes the listed files,
// their diffs and the header together, survives view switches, and a newly
// selected story opens on all changes. The case's review answers own the Git
// judgment.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { ReviewQuery } from "../../src/reviewSource.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openStoryAComparison } from "./intent-story-compare-stories.ts";

const [first, second, third] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
  makeMe.aReviewCommit.numbered(3, "third change").please(),
];
const modified = "Modified dashboard/tests/a.spec.ts";
const added = "Added dashboard/tests/boundary/b.spec.ts";
const deleted = "Deleted dashboard/tests/gone.spec.ts";

test("choosing the two oldest commits lists only their files with diffs from the commit before, names them in the header, and survives view switches but not another story", async () => {
  const rangeQueries: ReviewQuery[] = [];
  let diffLine = "all changes";
  const mounted = await openStoryAComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .modifying("dashboard/tests/a.spec.ts")
          .adding("dashboard/tests/boundary/b.spec.ts")
          .deleting("dashboard/tests/gone.spec.ts")
          .onCommits(third, second, first)
          .withUncommittedChanges()
          .please(),
      ),
    range: (query) => {
      rangeQueries.push(query);
      return Promise.resolve(
        makeMe.aStoryReview
          .modifying("dashboard/tests/a.spec.ts")
          .adding("dashboard/tests/boundary/b.spec.ts")
          .pleaseRange(first, second),
      );
    },
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding("dashboard/tests/a.spec.ts", diffLine)
          .please(),
      ),
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  // A Taken story opens on all changes, uncommitted included, beside an
  // uncollapsible header.
  await expect.element(story.choice("All changes")).toBeChecked();
  await expect.element(story.collapsedControl).not.toBeInTheDocument();
  await expect.poll(story.revisions).toContain("uncommitted changes included");
  await expect.element(story.commits).not.toBeInTheDocument();
  await expect.element(story.file(deleted)).toBeVisible();
  await story.file(modified).click();
  await expect.poll(story.diffCode).toContain("all changes");

  // Commits, then the two oldest commits as ends, lists only their files,
  // each diff from the commit before, and names the range.
  diffLine = "range change";
  await story.choose("Commits");
  await expect.element(story.commits).toBeVisible();
  await story.chooseAlone("first change");
  await story.commit("second change").click();
  await expect.poll(story.range).toContain("Changes in 2 commits");
  await expect
    .poll(story.range)
    .toContain("From c1c1c1c first change to c2c2c2c second change.");
  await expect.element(story.file(deleted)).not.toBeInTheDocument();
  await expect.element(story.file(modified)).toBeVisible();
  await expect.element(story.file(added)).toBeVisible();
  expect(rangeQueries.at(-1)).toMatchObject({
    fromTree: first.fromTree,
    tree: second.tree,
  });
  await expect.poll(story.diffName).toBe(modified);
  await expect.poll(story.diffCode).toContain("range change");

  // CI comparison and back keeps the range and the selected file.
  await story.chooseTab("CI comparison");
  await story.chooseTab("Changes");
  await expect.element(story.choice("Commits")).toBeChecked();
  await expect.poll(story.range).toContain("Changes in 2 commits");
  await expect.poll(story.diffName).toBe(modified);

  // Under the range, an unchanged file shows the source Intent reads today.
  await story.file("dashboard/tests/boundary/kept.spec.ts").click();
  await expect.poll(story.purposeText).toMatch(/kept\s11/);

  // Selecting another story and returning opens on all changes.
  await mounted.selectStoryB();
  await mounted.selectStoryA();
  await story.chooseTab("Changes");
  await expect.element(story.choice("All changes")).toBeChecked();
  await expect.element(story.file(deleted)).toBeVisible();
  // Commits again anchors as a first choice: its newest item alone.
  await story.choose("Commits");
  await expect.poll(story.range).toContain("Uncommitted changes");
  await expect.poll(story.range).not.toContain("Changes in 2 commits");
});
