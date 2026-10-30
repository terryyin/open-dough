// The same admitted comparison that serves a printed file diff can return
// revision-consistent file text at those trees, or a typed unavailable
// explanation, without changing the printed-diff answer.
import { execFileSync } from "node:child_process";
import { expect, test } from "./support/preparationPage.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { observed, storyWorktree } from "./support/storyReviewWorktree.ts";
import { keepLaunchRecord } from "./support/storyLaunchRecord.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
  storyReviewSchema,
  reviewedFileDiffSchema,
  reviewedFileTextSchema,
  type ReviewedFile,
  type TakenStoryReview,
} from "../src/storyReviewContract.ts";

const story = { source: "open-dough", identity: queuedIdentity };

// Raw blob text; the worktree helper's `git` trims, which drops the final newline.
const show = (cwd: string, tree: string, path: string) =>
  execFileSync("git", ["show", `${tree}:${path}`], { cwd, encoding: "utf8" });

function fromOf(review: TakenStoryReview, file: ReviewedFile) {
  return file.includesTrunkFrom ?? review.baseline;
}

function fileQuery(review: TakenStoryReview, file: ReviewedFile) {
  return {
    ...story,
    baseline: fromOf(review, file),
    tree: review.tree,
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
  };
}

test("the same admitted comparison returns file text at its trees without changing printed diffs", async ({
  page,
  dashboard,
  origin,
}) => {
  const { workspace } = storyWorktree(origin);
  await keepLaunchRecord(dashboard, workspace);
  const before = observed(workspace);

  const snapshot = await page.request.get(
    `${dashboard.baseURL}${storyReviewEndpoint}?${new URLSearchParams(story)}`,
    { headers: { Origin: dashboard.origin } },
  );
  expect(snapshot.status()).toBe(200);
  const review = storyReviewSchema.parse(await snapshot.json());
  expect(review.kind).toBe("snapshot");
  if (review.kind !== "snapshot") throw new Error("expected snapshot");

  const byPath = Object.fromEntries(
    review.files.map((file) => [file.path, file]),
  );
  const renamed = byPath["new.txt"];
  const added = byPath["story.txt"];
  const deleted = byPath["gone.txt"];
  const binary = byPath["image.png"];
  const modified = byPath["unstaged.txt"];
  expect(renamed?.kind).toBe("renamed");
  expect(added?.kind).toBe("added");
  expect(deleted?.kind).toBe("deleted");
  expect(binary?.kind).toBe("modified");
  expect(modified?.kind).toBe("modified");
  if (
    renamed?.kind !== "renamed" ||
    added === undefined ||
    deleted === undefined ||
    binary === undefined ||
    modified === undefined
  )
    throw new Error("expected story worktree files");

  const get = (endpoint: string, query: Record<string, string>) =>
    page.request.get(
      `${dashboard.baseURL}${endpoint}?${new URLSearchParams(query)}`,
      { headers: { Origin: dashboard.origin } },
    );

  const printed = await get(
    storyReviewFileEndpoint,
    fileQuery(review, modified),
  );
  expect(printed.status()).toBe(200);
  const printedBody = reviewedFileDiffSchema.parse(await printed.json());
  expect(printedBody).toEqual({
    kind: "diff",
    printed: expect.stringContaining("unstaged"),
  });

  const textOf = async (file: ReviewedFile) => {
    const response = await get(
      storyReviewFileTextEndpoint,
      fileQuery(review, file),
    );
    expect(response.status()).toBe(200);
    return reviewedFileTextSchema.parse(await response.json());
  };

  const modifiedText = await textOf(modified);
  expect(modifiedText).toEqual({
    kind: "text",
    baseline: show(workspace, fromOf(review, modified), "unstaged.txt"),
    tree: show(workspace, review.tree, "unstaged.txt"),
  });

  const renamedText = await textOf(renamed);
  expect(renamedText).toEqual({
    kind: "text",
    baseline: show(workspace, fromOf(review, renamed), "old.txt"),
    tree: show(workspace, review.tree, "new.txt"),
  });

  expect(await textOf(added)).toEqual({
    kind: "text",
    baseline: null,
    tree: show(workspace, review.tree, "story.txt"),
  });

  expect(await textOf(deleted)).toEqual({
    kind: "text",
    baseline: show(workspace, fromOf(review, deleted), "gone.txt"),
    tree: null,
  });

  const binaryText = await textOf(binary);
  expect(binaryText.kind).toBe("unavailable");
  if (binaryText.kind === "unavailable")
    expect(binaryText.explanation).toMatch(
      /no textual content|could not be read/i,
    );

  const printedAgain = await get(
    storyReviewFileEndpoint,
    fileQuery(review, modified),
  );
  expect(await printedAgain.json()).toEqual(printedBody);

  const written = `${origin.machine}/written-text`;
  for (const [query, status, error] of [
    [
      { ...fileQuery(review, modified), baseline: `--output=${written}` },
      400,
      "The file text names a malformed object or path.",
    ],
    [
      { ...fileQuery(review, modified), tree: "HEAD" },
      400,
      "The file text names a malformed object or path.",
    ],
    [
      { ...fileQuery(review, modified), workspace },
      400,
      "The file text request is malformed.",
    ],
  ] as const) {
    const response = await get(storyReviewFileTextEndpoint, query);
    expect(response.status(), JSON.stringify(query)).toBe(status);
    expect(await response.json()).toEqual({ error });
  }

  expect(observed(workspace)).toEqual(before);
});
