// Review reads the kept state and Git directly for a landed session or
// a file in a kept commit run.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { reviewedFileText } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";

test("the retained landing of a Default main session takes precedence over its later kept run", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", { backlog: null })
      .withRevision("landed", { files: { "landed.txt": "landed work\n" } })
      .withRevision("committed", { files: { "typo.txt": "session work\n" } })
      .please(),
  );
  onTestFinished(repository.cleanup);
  const {
    integration: workspace,
    revisions: { base, landed, committed },
  } = repository;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Established and landed" })
    .inDefaultCheckout({ workspace, landing: "auto-land", revision: base })
    .inClaudeSession({ sessionId: "established-landed" })
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: workspace })
        .comparing({ base, revision: landed }),
    )
    .keptSessionCommits({
      repository: workspace,
      runs: [{ base: landed, revision: committed }],
    })
    .markedDone()
    .please();
  const read = makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId)
    .keeping([record])
    .please();

  expect(await storyReview(read, new AbortController().signal)).toMatchObject({
    kind: "landed",
    baseline: base,
    tree: landed,
    files: [expect.objectContaining({ path: "landed.txt", kind: "added" })],
  });
});

test("a file text read answers both sides of a kept run's pair and refuses a different pair", async () => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "work.txt": "before\n" },
      })
      .withRevision("result", { files: { "work.txt": "after\n" } })
      .please(),
  );
  onTestFinished(repository.cleanup);
  const {
    integration: workspace,
    revisions: { base, result },
  } = repository;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Session with a kept run" })
    .inDefaultCheckout({ workspace, landing: "review", revision: base })
    .inClaudeSession({ sessionId: "kept-run" })
    .keptSessionCommits({
      repository: workspace,
      runs: [{ base, revision: result }],
    })
    .markedDone()
    .please();
  const review = makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId)
    .keeping([record]);
  const read = (baseline: string) =>
    reviewedFileText(
      review.readingFile({ baseline, tree: result, path: "work.txt" }).please(),
      new AbortController().signal,
    );

  expect(await read(base)).toEqual({
    kind: "text",
    baseline: "before\n",
    tree: "after\n",
  });
  const refused = read(result);
  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 409,
    message:
      "The file or comparison does not belong to this session's kept commits.",
  });
});
