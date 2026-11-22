// Integration conflicts follow the same file through renames on both sides
// of that integration, preserving the selected range's original old path.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  parentsConflict,
  sixth,
  trunkIntegrationRepository,
} from "../../dashboard/test-support/support/storyReviewTrunk.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";

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
  const review = await openReviewChanges(page, await openBacklog(page, origin));
  expect(review.snapshot.commits.map(({ subject }) => subject)).toEqual([
    "rename d to e",
    "merge trunk",
    "rename c to d",
    "story changes c",
  ]);
  const { commits, files, diffs } = review;
  await review.comparison.choose("Commits");
  await commits.choose("last");
  await commits.expectRange("Changes in 4 commits");
  await files.expectRows("1 changed file", [
    "src",
    "  e.ts includes trunk's changes",
  ]);
  const name = "Renamed src/c.ts → src/e.ts, includes trunk's changes";
  await files.choose("1 changed file", name);
  await files.expectLineCounts(name, "+1 −1");
  await diffs.expectShows(name);
  await diffs.expectLines("removed", ["-c 5"]);
  await diffs.expectLines("added", ["+c story and trunk"]);
  await files.expectListLacks("1 changed file", "d.ts", "README.md");
});
