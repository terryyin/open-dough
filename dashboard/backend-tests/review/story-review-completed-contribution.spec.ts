import { afterAll, beforeAll, expect, test } from "vitest";
import { sharedFixtureProject } from "../support/fixtureProject.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { ReviewSyncDeadline } from "../../server/reviewRepository.ts";
import { publishedStoryReview } from "../../server/storyReviewPublished.ts";
import { completedStoryContributionHistory } from "../../test-support/support/completedStoryHistory.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";

const subject = { source: "open-dough", identity: queuedIdentity };
const signal = new AbortController().signal;
let release: (() => Promise<void>) | undefined;
let pair: {
  subject: typeof subject;
  completion: string;
  baseline: string;
  tree: string;
};

beforeAll(async () => {
  const configured = await sharedFixtureProject(
    completedStoryContributionHistory(),
  );
  const { repository } = configured;
  release = configured.release;
  const { completion, "story start": baseline } = repository.revisions;
  const tree = git(repository.integration, "rev-parse", `${completion}^{tree}`);
  pair = { subject, completion, baseline, tree };
});

afterAll(() => release?.());

test("a branch completion admits incoming file text only on the widened pair", async () => {
  const review = await publishedStoryReview(
    knownSource(subject.source),
    subject.identity,
    signal,
    { syncDeadline: new ReviewSyncDeadline() },
  );
  if (review?.kind !== "published") throw new Error("No published completion");
  expect(review).toMatchObject({
    completion: pair.completion,
    tree: pair.tree,
    withMerged: { from: pair.baseline },
  });
  expect(review.files.map(({ path }) => path)).toContain("guides/branch.txt");
  expect(review.files.map(({ path }) => path)).not.toContain(
    "guides/incoming.txt",
  );
  expect(review.withMerged?.files.map(({ path }) => path)).toContain(
    "guides/incoming.txt",
  );
  const incoming = { ...pair, path: "guides/incoming.txt" };

  await Promise.all([
    expect(reviewedFileText({ read: incoming }, signal)).resolves.toEqual({
      kind: "text",
      baseline: null,
      tree: "incoming trunk line\n",
    }),
    expect(
      reviewedFileText(
        { read: { ...incoming, baseline: review.baseline } },
        signal,
      ),
    ).rejects.toMatchObject({ status: 409 }),
  ]);
});

test("a widened branch diff requires the listed rename's original path", async () => {
  const rename = {
    ...pair,
    path: "guides/after.txt",
    oldPath: "guides/before.txt",
  };
  const [diff] = await Promise.all([
    reviewedFileDiff({ read: rename }, signal),
    expect(
      reviewedFileDiff(
        { read: { ...rename, oldPath: "guides/branch.txt" } },
        signal,
      ),
    ).rejects.toMatchObject({ status: 409 }),
  ]);
  if (diff.kind !== "diff") throw new Error("No widened rename diff");
  expect(diff.printed).toContain("rename from guides/before.txt");
});
