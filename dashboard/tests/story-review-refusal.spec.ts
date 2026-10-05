// Review requests the launch boundary does not admit, against Story A's
// worktree and kept launch record (./support/storyReviewWorktree.ts), are
// refused before any Git runs: trunk is not fetched, no file is written, and
// the worktree's own index and status stay as they were.

import { existsSync } from "node:fs";
import path from "node:path";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
} from "../src/storyReview.ts";
import { expect, test } from "./support/preparationPage.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { git, observed, storyWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";

test("review requests the boundary does not admit are refused and nothing runs", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = storyWorktree(origin);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  // Where Git would write a diff it was asked to write.
  const written = path.join(origin.machine, "written-diff");
  await keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);
  const fetchedTrunk = () => git(workspace, "rev-parse", "origin/main");
  expect(fetchedTrunk()).toBe(merged);

  const story = { source: "open-dough", identity: queuedIdentity };
  const fileDiff = { ...story, baseline: merged, tree, path: "unstaged.txt" };
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
    const search = new URLSearchParams(query).toString();
    const response = await page.request.get(
      `${dashboard.baseURL}${endpoint}?${search}`,
      { headers: { Origin: dashboard.origin } },
    );
    expect(response.status(), search).toBe(status);
    expect(await response.json()).toEqual({ error });
  }
  // No Git ran: trunk's later commit is still unknown here, and no diff was
  // written.
  expect(fetchedTrunk()).toBe(merged);
  expect(existsSync(written)).toBe(false);
  expect(observed(workspace)).toEqual(before);
});
