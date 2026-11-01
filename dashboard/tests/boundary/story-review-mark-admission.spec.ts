// A mark request against Story A's admission worktree
// (../support/storyReviewWorktree.ts) naming a path, a malformed object, another
// source, or an absent tree keeps no mark in the machine store and writes no
// reviewed ref in the project's repository. Marking itself is in
// ../story-review-mark.spec.ts.

import { storyReviewMarkEndpoint } from "../../src/storyReviewContract.ts";
import { expect, test } from "../support/preparationPage.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import { keepLaunchRecord } from "../support/storyLaunchRecord.ts";
import { keptReviewMarks, reviewedRefs } from "../support/storyReviewMark.ts";
import {
  admissionWorktree,
  git,
  observed,
} from "../support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

test("a mark request naming a path, a malformed object, or an absent tree keeps no mark", async ({
  request,
  dashboard,
  origin,
}) => {
  const { workspace, merged } = admissionWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const tree = git(workspace, "rev-parse", "HEAD^{tree}");
  const before = observed(workspace);
  const named = {
    source: "open-dough",
    identity: queuedIdentity,
    tree,
    baseline: merged,
  };
  const malformed = { error: "The review mark request is malformed." };
  for (const [body, status, answer] of [
    [{ ...named, workspace }, 400, malformed],
    [{ ...named, tree: "HEAD" }, 400, malformed],
    [{ ...named, baseline: `--output=${workspace}` }, 400, malformed],
    [
      { ...named, source: "elsewhere" },
      404,
      { error: "Unknown catalog source." },
    ],
    [
      { ...named, tree: "0".repeat(40) },
      200,
      {
        kind: "unavailable",
        explanation: expect.stringMatching(
          /^The snapshot could not be marked reviewed: /,
        ),
      },
    ],
  ] as const) {
    const response = await request.post(
      `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
      { headers: { Origin: dashboard.origin }, data: body },
    );
    expect(response.status(), JSON.stringify(body)).toBe(status);
    expect(await response.json()).toEqual(answer);
  }
  const read = await request.get(
    `${dashboard.baseURL}${storyReviewMarkEndpoint}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(read.status()).toBe(405);
  expect(keptReviewMarks(dashboard)).toBeUndefined();
  expect(reviewedRefs(origin.project)).toBe("");
  expect(observed(workspace)).toEqual(before);
});
