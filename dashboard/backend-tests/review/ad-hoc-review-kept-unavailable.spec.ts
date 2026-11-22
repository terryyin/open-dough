// The typed review handler in-process explains why a kept ad hoc session has
// no readable comparison, given the session's typed kept state: no server, no
// machine stores.
import { unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";

// A path no test creates: kept records name it as gone.
const gone = (name: string) =>
  path.join(tmpdir(), `ad-hoc-review-${process.pid}-${name}`);
const review = (input: Parameters<typeof storyReview>[0]) =>
  storyReview(input, new AbortController().signal);

test("Given an ad hoc landing whose repository is gone, when its review is read, then it explains the gap", async () => {
  const read = makeMe.aSessionReviewRead
    .ofLandedAdHocSession("missing-repo", {
      repository: gone("landing-repo"),
      comparing: { base: "a".repeat(40), revision: "b".repeat(40) },
    })
    .please();

  expect(await review(read)).toEqual({
    kind: "landing-unavailable",
    explanation: "The captured landing repository is missing or unreadable.",
  });
});

test("Given an ad hoc landing whose comparison objects are gone, when its review is read, then it explains the gap", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("base").withRevision("result").please(),
  );
  try {
    const base = repository.revisions.base;
    const revision = repository.revisions.result;
    const read = makeMe.aSessionReviewRead
      .ofLandedAdHocSession("missing-objects", {
        repository: repository.integration,
        comparing: { base, revision },
      })
      .please();
    unlinkSync(
      path.join(
        repository.integration,
        ".git",
        "objects",
        revision.slice(0, 2),
        revision.slice(2),
      ),
    );

    expect(await review(read)).toEqual({
      kind: "landing-unavailable",
      explanation:
        "The captured landing comparison objects are missing or unreadable.",
    });
  } finally {
    await repository.cleanup();
  }
});

test("Given an unreadable kept comparison, when its review is read, then it still identifies the session's commits", async () => {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Missing kept repository" })
    .inClaudeSession({ sessionId: "unreadable-kept-commits" })
    .keptSessionCommits({
      repository: gone("kept-repo"),
      runs: [{ base: "a".repeat(40), revision: "b".repeat(40) }],
    })
    .markedDone()
    .please();

  const read = makeMe.aSessionReviewRead.ofRecord(record).please();

  expect(await review(read)).toEqual({
    kind: "landing-unavailable",
    comparison: "session-commits",
    explanation:
      "The repository that kept this session's commits is missing or unreadable.",
  });
});

test("Review reports an attribution gap and refuses files of that branch pair", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base")
      .withRevision("tip", { files: { "draft.txt": "session draft\n" } })
      .please(),
  );
  try {
    const { base, tip } = repository.revisions;
    const attributionGap = "The saved branch changes could not be separated.";
    const record = makeMe.aLaunchRecord
      .adHoc({ title: "Conflicting branch changes" })
      .inClaudeSession({ sessionId: "unattributed-branch" })
      .branchResultFrom({
        repository: repository.integration,
        base,
        revision: tip,
        attributionGap,
        manualDeliveryChecked: true,
      })
      .markedDone()
      .please();
    const read = makeMe.aSessionReviewRead.ofRecord(record);

    expect(await review(read.please())).toMatchObject({
      kind: "unavailable",
      explanation: attributionGap,
      deliveryGap: expect.stringContaining("exact fast-forward") as string,
    });
    const file = read
      .readingFile({ baseline: base, tree: tip, path: "draft.txt" })
      .please();
    await expect(
      reviewedFileDiff(file, new AbortController().signal),
    ).rejects.toMatchObject({
      status: 409,
      message:
        "The file or comparison does not belong to this session's branch result.",
    });
  } finally {
    await repository.cleanup();
  }
});
