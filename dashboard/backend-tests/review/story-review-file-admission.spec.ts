// A named Done comparison's file diff and text, read from the production
// URLs through the typed reads over real Git objects. Admission of the
// widened branch pair is ./story-review-completed-contribution.spec.ts.
import { afterAll, beforeAll, expect, test } from "vitest";
import { sharedFixtureProject } from "../support/fixtureProject.ts";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  fileDiffRequest,
  fileTextRequest,
} from "../../server/storyReviewFileRequest.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReviewRequest } from "../../server/storyReviewRequest.ts";
import { storyReview } from "../../server/storyReview.ts";
import { readStoryReviewResult } from "../../server/storyReviewResultRead.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { ReviewSyncDeadline } from "../../server/reviewRepository.ts";
import { publishedStoryReview } from "../../server/storyReviewPublished.ts";
import {
  storyReviewEndpoint,
  storyReviewFileEndpoint,
  storyReviewFileTextEndpoint,
} from "../../src/storyReviewContract.ts";
import {
  author,
  otherStory,
  yuiClaim,
  yuiCompletion,
} from "../../test-support/support/completedStoryThroughInterleaving.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { lines } from "../../test-support/support/storyReviewWorktree.ts";
import {
  reviewedFileQuery,
  type ReviewedFileRead,
} from "../../src/reviewedFileRead.ts";

const story = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
const image = (last: number) =>
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, last]);
let release: (() => Promise<void>) | undefined;
let pair: Omit<ReviewedFileRead, "path"> & { completion: string };

beforeAll(async () => {
  const configured = await sharedFixtureProject(
    queuedReadyRepository({
      files: {
        "old.txt": lines("old"),
        "edited.txt": lines("edited"),
        "gone.txt": lines("gone", 3),
        "image.png": image(1),
      },
    })
      .withRevision("claim", yuiClaim())
      .withRevision("implementation", {
        message: "rename, add, delete, edit and redraw",
        author,
        remove: ["old.txt", "gone.txt"],
        files: {
          "new.txt": `${lines("old")}renamed\n`,
          "[literal]*.txt": "delivered\n",
          "edited.txt": `${lines("edited")}edited\n`,
          "image.png": image(2),
          "empty.txt": "",
        },
      })
      .withRevision("other story", { files: otherStory })
      .withRevision("completion", yuiCompletion())
      .please(),
  );
  release = configured.release;
  const review = await publishedStoryReview(
    knownSource(story.source),
    story.identity,
    signal,
    { syncDeadline: new ReviewSyncDeadline() },
  );
  if (review?.kind !== "published") throw new Error("No published completion");
  expect(review.completion).toBe(configured.repository.revisions.completion);
  const { completion, baseline, tree } = review;
  pair = { subject: story, completion, baseline, tree };
});

afterAll(() => release?.());

const url = (endpoint: string, query: Record<string, string>) => {
  const located = new URL(endpoint, "http://127.0.0.1");
  located.search = new URLSearchParams(query).toString();
  return located;
};
// Each read goes out as the page's query for it.
const diffOf = (read: ReviewedFileRead) =>
  reviewedFileDiff(
    fileDiffRequest(url(storyReviewFileEndpoint, reviewedFileQuery(read))),
    signal,
  );
const textOf = (read: ReviewedFileRead) =>
  reviewedFileText(
    fileTextRequest(url(storyReviewFileTextEndpoint, reviewedFileQuery(read))),
    signal,
  );

test("printed diff and text agree on each listed file of the named pair", async () => {
  const literal = { ...pair, path: "[literal]*.txt" };
  const edited = { ...pair, path: "edited.txt" };
  const renamed = { ...pair, path: "new.txt", oldPath: "old.txt" };
  const [diff, editedDiff, renamedDiff] = await Promise.all([
    diffOf(literal),
    diffOf(edited),
    diffOf(renamed),
  ]);
  expect(diff).toEqual({
    kind: "diff",
    printed: expect.stringContaining("+delivered") as unknown,
  });
  expect(editedDiff).toEqual({
    kind: "diff",
    printed: expect.stringContaining("+edited") as unknown,
  });
  expect(renamedDiff).toEqual({
    kind: "diff",
    printed: expect.stringContaining("rename from old.txt") as unknown,
  });
  const [editedText, renamedText, added, deleted, binary] = await Promise.all([
    textOf(edited),
    textOf(renamed),
    textOf(literal),
    textOf({ ...pair, path: "gone.txt" }),
    textOf({ ...pair, path: "image.png" }),
  ]);
  expect(editedText).toEqual({
    kind: "text",
    baseline: lines("edited"),
    tree: `${lines("edited")}edited\n`,
  });
  expect(renamedText).toEqual({
    kind: "text",
    baseline: lines("old"),
    tree: `${lines("old")}renamed\n`,
  });
  expect(added).toEqual({ kind: "text", baseline: null, tree: "delivered\n" });
  expect(deleted).toEqual({
    kind: "text",
    baseline: lines("gone", 3),
    tree: null,
  });
  expect(binary).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(
      /no textual content|could not be read/i,
    ) as unknown,
  });
});

test("a named Done pair admits only its story, endpoints and listed paths", async () => {
  await expect(
    storyReview(
      storyReviewRequest(
        url(storyReviewEndpoint, { ...story, source: "elsewhere" }),
      ),
      signal,
    ),
  ).rejects.toMatchObject({ status: 404 });
  const file = { ...pair, path: "[literal]*.txt" };
  await Promise.all(
    (
      [
        [{ subject: { ...story, source: "elsewhere" } }, 404],
        [{ subject: { ...story, identity: "SEED-B#b" } }, 409],
        [{ completion: pair.tree }, 409],
        [{ baseline: pair.tree }, 409],
        [{ tree: pair.baseline }, 409],
        [{ path: "other-story.txt" }, 409],
        [{ path: "*.txt" }, 409],
        [{ path: "../[literal]*.txt" }, 409],
        [{ path: "new.txt" }, 409],
        [{ path: "new.txt", oldPath: "edited.txt" }, 409],
      ] as const
    ).map(([change, status]) =>
      expect(
        (async () => diffOf({ ...file, ...change }))(),
        JSON.stringify(change),
      ).rejects.toMatchObject({ status }),
    ),
  );
});

test("the named Done result reads empty and binary files only for its own story", async () => {
  const result = {
    subject: story,
    completion: pair.completion,
    tree: pair.tree,
  };
  const [empty, binary] = await Promise.all([
    readStoryReviewResult({ ...result, path: "empty.txt" }, signal),
    readStoryReviewResult({ ...result, path: "image.png" }, signal),
  ]);
  expect(empty).toEqual({
    kind: "text",
    revision: pair.completion,
    path: "empty.txt",
    text: "",
  });
  expect(binary).toMatchObject({
    kind: "unavailable",
    revision: pair.completion,
    path: "image.png",
  });
  await expect(
    readStoryReviewResult(
      { ...result, subject: { ...story, identity: "SEED-B#b" } },
      signal,
    ),
  ).rejects.toMatchObject({ status: 409 });
});
