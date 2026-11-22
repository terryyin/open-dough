// Own-conflict gap: declared completion, then a retained missing object as
// the visible harness action.
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { ownConflictExtraCompletedHistory } from "../../test-support/support/completedOwnMergeHistory.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import { rmSync } from "node:fs";
import path from "node:path";

test.use({
  serverMode: "boundary",
  originRepository: ownConflictExtraCompletedHistory(),
});

test("an unreadable merge edit object explains the Git gap instead of a partial comparison", async ({
  request,
  dashboard,
  origin,
}) => {
  const completion = origin.revision("completion");
  const blob = git(
    origin.project,
    "rev-parse",
    `${completion}:merge-resolution.txt`,
  );
  const objects = git(origin.project, "rev-parse", "--git-path", "objects");
  rmSync(
    path.resolve(origin.project, objects, blob.slice(0, 2), blob.slice(2)),
  );
  const response = await get(
    request,
    dashboard,
    storyReviewEndpoint,
    completed,
  );
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "Published completion history could not be read",
    ),
  });
  expect(await response.json()).not.toHaveProperty("files");
});
