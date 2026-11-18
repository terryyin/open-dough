// Each uninterrupted run of a Default main session's commits is kept in its
// final form and answers the session's review by its position, over raw HTTP
// at the boundary server: a real bare origin and project checkout
// (../../tests/support/startOrigin.ts) and plain Git in the checkout
// (../../tests/support/sessionCheckoutWork.ts). Trunk work pulled, merged or
// rebased onto is in no run, an amended or rebased commit is kept as it ended,
// and a file read names a kept run's pair. The single kept commit answers as
// ./ad-hoc-session-commits.spec.ts states.

import {
  reviewedFileDiffSchema,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import {
  adHocReview,
  adHocSessionFileDiff,
  establishDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  amendInCheckout,
  commitInCheckout,
  pullPublishedWork,
} from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

// Git logs each piece of checkout work at its stated time, after the session
// these cases establish now.
const beforeLaunch = "2020-01-02T12:00:00Z";
const firstAt = "2099-01-02T12:00:00Z";
const secondAt = "2099-01-02T12:05:00Z";
const thirdAt = "2099-01-02T12:10:00Z";
const fourthAt = "2099-01-02T12:15:00Z";
const sessionId = "established-default-main";

const paths = (answer: StoryReview) =>
  "files" in answer ? answer.files.map(({ path }) => path) : undefined;

const numbered = (first: string, last: string) =>
  [first, "two", "three", "four", "five", "six", "seven", last, ""].join("\n");

test("commits either side of a pulled story landing are two runs, oldest first, each without the story's changes to a file the session also changed", async ({
  dashboard,
  origin,
  request,
}) => {
  establishDefaultMainSession(dashboard, origin, sessionId);
  const start = git(origin.project, "rev-parse", "HEAD");
  const first = await commitInCheckout(
    origin.project,
    firstAt,
    "notes.txt",
    numbered("one", "eight"),
  );
  git(origin.project, "push", "--quiet", "origin", "main");
  const pulled = await pullPublishedWork(origin, secondAt, "notes.txt", {
    content: numbered("one", "story's eight"),
  });
  const second = await commitInCheckout(
    origin.project,
    thirdAt,
    "notes.txt",
    numbered("session's one", "story's eight"),
  );
  await markAdHocDone(dashboard, sessionId);

  const commitRuns = [
    {
      commits: 1,
      subject: "Add notes.txt",
      committedAt: new Date(firstAt).toISOString(),
      baseline: start,
      tree: first,
    },
    {
      commits: 1,
      subject: "Add notes.txt",
      committedAt: new Date(thirdAt).toISOString(),
      baseline: pulled,
      tree: second,
    },
  ];
  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "session-commits",
    commitRuns,
    commitRun: 0,
    baseline: start,
    tree: first,
    files: [{ path: "notes.txt", kind: "added" }],
  });
  expect(await adHocReview(request, dashboard, sessionId, 1)).toMatchObject({
    kind: "session-commits",
    commitRuns,
    commitRun: 1,
    baseline: pulled,
    tree: second,
    files: [{ path: "notes.txt", kind: "modified" }],
  });

  const read = async (baseline: string, tree: string) => {
    const response = await adHocSessionFileDiff(request, dashboard, sessionId, {
      baseline,
      tree,
      path: "notes.txt",
    });
    expect(response.status()).toBe(200);
    return reviewedFileDiffSchema.parse(await response.json());
  };
  const secondDiff = await read(pulled, second);
  expect(secondDiff).toEqual({
    kind: "diff",
    printed: expect.stringContaining("+session's one"),
  });
  expect(JSON.stringify(secondDiff)).not.toContain("story's eight");
  expect(JSON.stringify(await read(start, first))).not.toContain("story's");
});

test("commits either side of merged trunk work are two runs without the merge or its work", async ({
  dashboard,
  origin,
  request,
}) => {
  establishDefaultMainSession(dashboard, origin, sessionId);
  const start = git(origin.project, "rev-parse", "HEAD");
  const first = await commitInCheckout(origin.project, firstAt, "first.txt");
  await pullPublishedWork(origin, secondAt, "story.txt", { how: "merge" });
  const merge = git(origin.project, "rev-parse", "HEAD^{/^Merge }");
  const second = await commitInCheckout(origin.project, thirdAt, "second.txt");
  await markAdHocDone(dashboard, sessionId);

  const opened = await adHocReview(request, dashboard, sessionId);
  expect(opened).toMatchObject({ commitRun: 0, baseline: start, tree: first });
  expect(paths(opened)).toEqual(["first.txt"]);
  const next = await adHocReview(request, dashboard, sessionId, 1);
  expect(next).toMatchObject({ commitRun: 1, baseline: merge, tree: second });
  expect(paths(next)).toEqual(["second.txt"]);
});

test("commits either side of an amended merge stay separate without the merge's files", async ({
  dashboard,
  origin,
  request,
}) => {
  establishDefaultMainSession(dashboard, origin, sessionId);
  const checkout = origin.project;
  const start = git(checkout, "rev-parse", "HEAD");
  const first = await commitInCheckout(checkout, firstAt, "first.txt");
  await pullPublishedWork(origin, secondAt, "story.txt", { how: "merge" });
  const amended = amendInCheckout(checkout, thirdAt, "amended.txt");
  const second = await commitInCheckout(checkout, fourthAt, "second.txt");
  await markAdHocDone(dashboard, sessionId);

  const opened = await adHocReview(request, dashboard, sessionId);
  expect(paths(opened)).toEqual(["first.txt"]);
  expect(opened).toMatchObject({
    commitRuns: [
      { commits: 1, baseline: start, tree: first },
      { commits: 1, baseline: amended, tree: second },
    ],
    baseline: start,
    tree: first,
  });
  const next = await adHocReview(request, dashboard, sessionId, 1);
  expect(paths(next)).toEqual(["second.txt"]);
  expect(next).toMatchObject({ baseline: amended, tree: second });
});

test("two commits, the second amended, rebased onto pulled trunk and pushed are one run of the two as pushed", async ({
  dashboard,
  origin,
  request,
}) => {
  establishDefaultMainSession(dashboard, origin, sessionId);
  await commitInCheckout(origin.project, firstAt, "first.txt");
  await commitInCheckout(origin.project, secondAt, "second.txt");
  amendInCheckout(origin.project, thirdAt, "amended.txt");
  const pulled = await pullPublishedWork(origin, fourthAt, "story.txt", {
    how: "rebase",
  });
  git(origin.project, "push", "--quiet", "origin", "main");
  const pushed = git(origin.project, "rev-parse", "origin/main");
  await markAdHocDone(dashboard, sessionId);

  const answer = await adHocReview(request, dashboard, sessionId);
  expect(answer).toMatchObject({
    kind: "session-commits",
    commitRuns: [
      { commits: 2, subject: "Add second.txt", baseline: pulled, tree: pushed },
    ],
    commitRun: 0,
    baseline: pulled,
    tree: pushed,
  });
  expect(paths(answer)).toEqual(["amended.txt", "first.txt", "second.txt"]);
});

test("a commit rebased onto fetched trunk and pushed, as a publication from the checkout does, is kept as its rebased commit", async ({
  dashboard,
  origin,
  request,
}) => {
  establishDefaultMainSession(dashboard, origin, sessionId);
  const made = await commitInCheckout(origin.project, firstAt, "landed.txt");
  const fetched = await pullPublishedWork(origin, secondAt, "story.txt", {
    how: "rebase-onto",
  });
  git(origin.project, "push", "--quiet", "origin", "HEAD:main");
  const pushed = git(origin.project, "rev-parse", "origin/main");
  expect(pushed).not.toBe(made);
  await markAdHocDone(dashboard, sessionId);

  const answer = await adHocReview(request, dashboard, sessionId);
  expect(answer).toMatchObject({
    kind: "session-commits",
    commitRuns: [{ commits: 1, subject: "Add landed.txt" }],
    baseline: fetched,
    tree: pushed,
  });
  expect(paths(answer)).toEqual(["landed.txt"]);
});

test("a commit made before the session and rebased during it is not kept", async ({
  dashboard,
  origin,
  request,
}) => {
  await commitInCheckout(origin.project, beforeLaunch, "earlier.txt");
  establishDefaultMainSession(dashboard, origin, sessionId);
  await pullPublishedWork(origin, firstAt, "story.txt", { how: "rebase" });
  await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toEqual({
    kind: "landing-unavailable",
    explanation: "This session made no commits in the Default main checkout.",
  });
});
