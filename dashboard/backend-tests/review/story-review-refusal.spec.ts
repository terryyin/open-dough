// Review requests the launch boundary does not admit, against Story A's
// admission worktree and kept launch record (../../tests/support/storyReviewWorktree.ts),
// are refused before any Git runs: trunk is not fetched, no file is written,
// and the worktree's own index and status stay as they were.

import { existsSync } from "node:fs";
import path from "node:path";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../../src/storyReviewContract.ts";
import { getReview } from "../../tests/support/completedReviewRequests.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { queuedIdentity } from "../../tests/support/startOrigin.ts";
import {
  admissionWorktree,
  git,
  observed,
} from "../../tests/support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "../../tests/support/storyLaunchRecord.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("review requests the boundary does not admit are refused and nothing runs", async ({
  request,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = admissionWorktree(origin);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  // Where Git would write a diff it was asked to write.
  const written = path.join(origin.machine, "written-diff");
  keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const fetchedTrunk = () => git(workspace, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);

  const story = { source: "open-dough", identity: queuedIdentity };
  const fileDiff = { ...story, baseline: merged, tree, path: "story.txt" };
  const review = storyReviewEndpoint;
  const diff = storyReviewFileEndpoint;
  const malformedRequest = "The review request is malformed.";
  const malformedDiff = "The file diff names a malformed object or path.";
  for (const [endpoint, query, status, error] of [
    [review, { ...story, source: "elsewhere" }, 404, "Unknown catalog source."],
    [
      review,
      { ...story, identity: `${queuedIdentity}\nSEED-B#b` },
      400,
      "The review identity is malformed.",
    ],
    [review, { source: "open-dough" }, 400, malformedRequest],
    [review, { ...story, path: workspace }, 400, malformedRequest],
    [review, { ...story, workspace: "/tmp" }, 400, malformedRequest],
    [
      diff,
      { ...fileDiff, baseline: `--output=${written}` },
      400,
      malformedDiff,
    ],
    [diff, { ...fileDiff, tree: "HEAD" }, 400, malformedDiff],
    [diff, { ...fileDiff, baseline: merged.toUpperCase() }, 400, malformedDiff],
    [
      diff,
      { ...fileDiff, workspace },
      400,
      "The file diff request is malformed.",
    ],
  ] as const) {
    const response = await getReview(request, dashboard, endpoint, query);
    expect(response.status(), new URLSearchParams(query).toString()).toBe(
      status,
    );
    expect(await response.json()).toEqual({ error });
  }
  // No Git ran: trunk's later commit is still unknown here, and no diff was
  // written.
  expect(fetchedTrunk()).toBe(merged);
  expect(existsSync(written)).toBe(false);
  expect(observed(workspace)).toEqual(before);
});
