// Review changes for a completed story whose integration merge resolved a
// conflict, made its own edits and restored a trunk file that `merge-tree`
// directory-rename heuristics moved (SEED-253 key example 1).
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { ownConflictExtraCompletedHistory } from "../../dashboard/test-support/support/completedOwnMergeHistory.ts";

test.use({ originRepository: ownConflictExtraCompletedHistory() });

test("a completed story's integration edits open with their diffs beside its mixed conflict file", async ({
  page,
  origin,
}) => {
  const completion = origin.revision("completion");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const review = await openIntentReviewChanges(page, card);
  expect(review.answer).toMatchObject({
    kind: "published",
    completion,
  });
  await review.comparison.expectChosen("Published completion");
  await review.files.expectNotShown("Added other.json");
  const shared = "Modified shared.txt, includes trunk's changes";
  await review.files.choose(shared);
  await review.diffs.expectShows(shared, "+resolved story and trunk");
  const edit = "Added merge-resolution.txt";
  await review.files.choose(edit);
  await review.diffs.expectShows(edit, "+integration edit");
  const renamed = "Renamed checks/before.test.mjs → checks/after.test.mjs";
  await review.files.choose(renamed);
  await review.diffs.expectShows(renamed, "+renamed");
});
