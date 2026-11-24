// A story review's file browser shows how many lines each file's diff adds
// and removes, of Story A's worktree (../../dashboard/test-support/support/storyReviewWorktree.ts) with
// the merged trunk file's mode changed alone. Each counted file's row shows
// its counts beside its name, and its control, still named by its kind and
// path, is described by them in words. A file with no textual diff, the
// image or the mode-only change, shows none, and a collapsed folder still
// tells how many changed files it holds.

import { withLocalState } from "../../Distribution/tests/support/repository-local-state.mjs";
import {
  expect,
  storyARepository,
  test,
} from "../../dashboard/test-support/support/storyAReviewRepository.ts";
import { fileLineCounts } from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { keepPublishedStoryReview } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

// The merged trunk file's mode changes alone against the baseline.
test.use({
  originRepository: withLocalState(storyARepository, {
    modes: { "other.txt": 0o755 },
  }),
});

test("each file's row shows the lines its diff adds and removes, in words to assistive technology", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  keepPublishedStoryReview(dashboard, origin, workspace);
  const card = await openBacklog(page, origin);
  const { files } = await openIntentReviewChanges(page, card);
  await files.expectOutsideCount(8);
  const file = (name: string) => files.row(name);

  for (const [name, shown, words] of [
    ["Modified unstaged.txt", "+2 −1", "2 lines added, 1 line removed"],
    ["Deleted gone.txt", "+0 −3", "0 lines added, 3 lines removed"],
    ["Renamed old.txt → new.txt", "+1 −0", "1 line added, 0 lines removed"],
    ["Added fresh/new.txt", "+1 −0", "1 line added, 0 lines removed"],
  ] as const) {
    await files.expectLineCounts(name, shown, words);
  }
  // Neither the image nor the mode-only change has lines to count.
  for (const name of ["Modified image.png", "Modified other.txt"]) {
    await expect(file(name)).toBeVisible();
    await expect(fileLineCounts(file(name))).toHaveCount(0);
    await expect(file(name)).not.toHaveAccessibleDescription(/line/);
  }

  // A collapsed folder still tells its changed files, not their lines.
  await files.folder("fresh").press("Enter");
  await expect(files.folderName("fresh 1 file")).toBeVisible();
  await expect(files.folder("fresh")).toHaveAttribute("aria-expanded", "false");
});
