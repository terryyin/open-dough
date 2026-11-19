// Integration conflicts follow the same file through renames on both sides
// of that integration, preserving the selected range's original old path.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { chooseCommit } from "../../dashboard/test-support/support/storyReviewCommitChoice.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openStoryReview } from "../../dashboard/test-support/support/reviewRead.ts";
import {
  reviewRegion,
  comparisonChoice,
} from "../../dashboard/test-support/support/reviewControls.ts";
import {
  parentsConflict,
  sixth,
  trunkIntegrationRepository,
} from "../../dashboard/test-support/support/storyReviewTrunk.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  expectTreeRows,
  changedFilesList,
  listedFile,
  fileLineCounts,
  fileDiff,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";

// The story renames `src/c.ts` to `d.ts`, settles trunk's conflicting edit
// there in its integration, then renames it to `e.ts`.
test.use({
  originRepository: trunkIntegrationRepository("c story and trunk", {
    story: {
      name: "rename c to d",
      remove: ["src/c.ts"],
      files: { "src/d.ts": sixth("c", "c story") },
    },
    renamed: "src/d.ts",
    after: {
      name: "rename d to e",
      remove: ["src/d.ts"],
      files: { "src/e.ts": sixth("c", "c story and trunk") },
    },
  }),
});

test("a file renamed before and after conflicted integration stays flagged with its original old path and diff", async ({
  page,
  dashboard,
  origin,
}) => {
  expect(parentsConflict(origin, "rename c to d")).toBe(true);
  keepLaunchRecord(dashboard, storyWorktree(origin).workspace);
  const snapshot = await openStoryReview(page, await openBacklog(page, origin));
  expect(snapshot.commits.map(({ subject }) => subject)).toEqual([
    "rename d to e",
    "merge trunk",
    "rename c to d",
    "story changes c",
  ]);
  const review = reviewRegion(page);
  await comparisonChoice(review, "Commits", { exact: true }).check();
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 4 commits" }),
  ).toBeVisible();
  const files = changedFilesList(review, "1 changed file", { exact: true });
  await expectTreeRows(files, ["src", "  e.ts includes trunk's changes"]);
  const name = "Renamed src/c.ts → src/e.ts, includes trunk's changes";
  await listedFile(files, name, { exact: true }).click();
  await expect(fileLineCounts(files)).toHaveText("+1 −1", {
    useInnerText: true,
  });
  await expect(fileDiff(review, name, { exact: true })).toBeVisible();
  await expect(review.locator(".story-review-removed")).toHaveText(["-c 5"]);
  await expect(review.locator(".story-review-added")).toHaveText([
    "+c story and trunk",
  ]);
  await expect(files).not.toContainText("d.ts");
  await expect(files).not.toContainText("README.md");
});
