import { renameSync } from "node:fs";
import { delimiter } from "node:path";
import { beforeAll, expect, test, vi } from "vitest";
import {
  commitStoryFile,
  publishBranch,
  takenStoryReader,
} from "../support/takenStoryReader.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReview.ts";
import { remoteRequestRecordingGit } from "../../test-support/support/remoteRequestRecordingGit.ts";
import { trunkModeStory } from "../../test-support/support/storyReviewTrunkMode.ts";
import { prepareRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { branch, git } from "../../test-support/support/storyReviewWorktree.ts";
import { takenBranchContributionHistory } from "../../test-support/support/takenBranchContributionHistory.ts";

const trunkStory = () => trunkModeStory({ published: 2, unpublished: true });

// Each history's one-time template build happens here, outside any case.
beforeAll(() =>
  Promise.all(
    [takenBranchContributionHistory(), trunkStory()].map(prepareRepository),
  ),
);

test("a Taken story reads its published branch and attributable merge edit without a local launch or worktree", async () => {
  const { subject, signal, writer, revisions } = await takenStoryReader();
  publishBranch(writer);

  const review = await storyReview({ read: { subject, taken: true } }, signal);

  expect(review).toMatchObject({
    kind: "published-taken",
    head: revisions["merge trunk"],
  });
  if (review.kind !== "published-taken") throw new Error("No published branch");
  const attributedPaths = review.files.map(({ path }) => path);
  expect(attributedPaths).toContain("guides/merge.txt");
  expect(attributedPaths).not.toContain("guides/incoming.txt");
  expect(
    review.files.find(({ path }) => path === "guides/mixed.txt")
      ?.includesTrunkFrom,
  ).toBe(revisions["story start"]);
  expect(review.withMerged?.from).toBe(revisions["story start"]);
  expect(review.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/incoming.txt",
  );
});

test("a Taken story's unpublished branch leaves a review gap", async () => {
  const { subject, signal } = await takenStoryReader();

  await expect(
    storyReview({ read: { subject, taken: true } }, signal),
  ).resolves.toMatchObject({
    kind: "unavailable",
    explanation: `The recorded story branch ${branch} is not published on origin.`,
  });
});

test("a named published branch pair admits its literal file after origin advances", async () => {
  const { subject, signal, writer } = await takenStoryReader();
  const path = "guides/[literal]*.txt";
  const firstHead = commitStoryFile(writer, path, "first published text\n");
  publishBranch(writer);
  const review = await storyReview({ read: { subject, taken: true } }, signal);
  if (review.kind !== "published-taken") throw new Error("No published branch");
  commitStoryFile(writer, path, "second published text\n");
  publishBranch(writer);
  const read = {
    subject,
    publishedHead: firstHead,
    baseline: review.baseline,
    tree: review.tree,
    path,
  };

  const diff = await reviewedFileDiff({ read }, signal);
  if (diff.kind !== "diff") throw new Error("No published file diff");
  expect(diff.printed).toContain("+first published text");
  await expect(reviewedFileText({ read }, signal)).resolves.toEqual({
    kind: "text",
    baseline: null,
    tree: "first published text\n",
  });
  await expect(
    reviewedFileDiff({ read: { ...read, path: "guides/*.txt" } }, signal),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    reviewedFileText({ read: { ...read, baseline: review.tree } }, signal),
  ).rejects.toMatchObject({ status: 409 });
});

test("locally readable unpublished commits cannot name a published file comparison", async () => {
  const { reviewRepository, subject, signal, writer } =
    await takenStoryReader();
  publishBranch(writer);
  await storyReview({ read: { subject, taken: true } }, signal);
  const path = "guides/undelivered.txt";
  const unpublished = commitStoryFile(writer, path, "only present locally\n");
  const reader = reviewRepository();
  git(reader, "fetch", "--quiet", "--no-write-fetch-head", writer, unpublished);
  const read = {
    subject,
    publishedHead: unpublished,
    baseline: git(reader, "rev-parse", `${unpublished}^1^{tree}`),
    tree: git(reader, "rev-parse", `${unpublished}^{tree}`),
    path,
  };

  await expect(reviewedFileDiff({ read }, signal)).rejects.toMatchObject({
    status: 409,
    message:
      "The named comparison is not contained in the published story branch.",
  });
});

test("a Taken Trunk story reads only its attributable changes from interleaved published history", async () => {
  const { subject, signal, writer, revisions } =
    await takenStoryReader(trunkStory());
  const review = await storyReview({ read: { subject, taken: true } }, signal);

  if (review.kind !== "published-taken")
    throw new Error("No published Trunk comparison");
  expect(review.head).toBe(revisions.s2);
  expect(review.target).toBe("main");
  expect(review.withMerged).toBeUndefined();
  expect(review.files.map(({ path }) => path).sort()).toEqual([
    "d.md",
    "src/a.ts",
  ]);

  commitStoryFile(writer, "src/a.ts", "now published\n");
  git(writer, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  const read = {
    subject,
    publishedHead: review.head,
    baseline: review.baseline,
    tree: review.tree,
    path: "src/a.ts",
  };
  const diff = await reviewedFileDiff({ read }, signal);
  if (diff.kind !== "diff") throw new Error("No published file diff");
  expect(diff.printed).toContain("+a one");
  expect(diff.printed).not.toContain("a last");
  const source = await reviewedFileText({ read }, signal);
  if (source.kind !== "text") throw new Error("No published file source");
  expect(source.tree).toContain("a one\n");
  expect(source.tree).not.toContain("now published");
});

// One open syncs a three-file branch; origin then publishes a later head and
// moves away, and Git calls are recorded from then on.
async function openedBranchWithOriginGone() {
  const { home, origin, subject, signal, writer } = await takenStoryReader();
  const paths = ["guides/one.txt", "guides/two.txt", "guides/three.txt"];
  commitStoryFile(writer, "guides/one.txt", "story text\n", ...paths.slice(1));
  publishBranch(writer);
  const review = await storyReview({ read: { subject, taken: true } }, signal);
  if (review.kind !== "published-taken") throw new Error("No published branch");
  const beyond = commitStoryFile(writer, "guides/later.txt", "later\n");
  publishBranch(writer);
  const recording = remoteRequestRecordingGit(home);
  vi.stubEnv("PATH", `${recording.bin}${delimiter}${process.env.PATH ?? ""}`);
  renameSync(origin, `${origin}-moved`);
  const read = {
    subject,
    publishedHead: review.head,
    baseline: review.baseline,
    tree: review.tree,
  };
  return { paths, beyond, read, signal, remoteRequests: recording.requests };
}

test("a named published branch pair reads its files without a remote request after origin moves away", async () => {
  const { paths, read, signal, remoteRequests } =
    await openedBranchWithOriginGone();

  for (const file of paths) {
    const diff = await reviewedFileDiff(
      { read: { ...read, path: file } },
      signal,
    );
    if (diff.kind !== "diff") throw new Error(`No diff for ${file}`);
    expect(diff.printed).toContain("+story text");
  }
  expect(remoteRequests()).toEqual([]);
});

test("a named published branch pair refuses an unlisted path or a head beyond the last sync without a remote request", async () => {
  const { beyond, read, signal, remoteRequests } =
    await openedBranchWithOriginGone();

  await expect(
    reviewedFileDiff(
      { read: { ...read, path: "guides/incoming.txt" } },
      signal,
    ),
  ).rejects.toMatchObject({ status: 409 });
  await expect(
    reviewedFileDiff(
      { read: { ...read, publishedHead: beyond, path: "guides/later.txt" } },
      signal,
    ),
  ).rejects.toMatchObject({ status: 409 });
  expect(remoteRequests()).toEqual([]);
});
