// A pending Done has no captured changes of its own. Capture keeps only
// work reachable from the checkout tip resolved for that Done.
import path from "node:path";
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommitsAt } from "../../server/sessionCommitsCapture.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { notCaptured } from "../support/doneCaptureReview.ts";

test("a pending Done refuses the previous review and its files", async () => {
  const {
    checkout,
    work: { first },
    records: { launch: record },
  } = await aDoneCaptureCase()
    .withWork((at) =>
      makeMe.aCheckoutWork
        .committing("first", { at: at(40) })
        .committing("second", { at: at(20) }),
    )
    .withCheckoutLaunch(
      "launch",
      { launched: 60, done: 10 },
      // The previous capture read the first commit before Done was pending.
      (launch, { at, checkout, work }) =>
        launch.keptSessionCommits({
          repository: path.join(checkout.integration, ".git"),
          runs: [{ base: checkout.base, revision: work.first }],
          readAt: at(30),
        }),
    )
    .please();
  const read = makeMe.aSessionReviewRead.ofRecord(record);
  const review = read.please();
  const file = read
    .readingFile({ baseline: checkout.base, tree: first, path: "first.txt" })
    .please();
  const { signal } = new AbortController();

  expect(await storyReview(review, signal)).toEqual(notCaptured);
  expect(
    await storyReview(
      { ...review, read: { ...review.read, run: "0" } },
      signal,
    ),
  ).toEqual({ ...notCaptured, selectedRun: "0" });
  for (const handler of [reviewedFileDiff, reviewedFileText])
    await expect(handler(file, signal)).rejects.toMatchObject({
      status: 409,
      message:
        "The file or comparison does not belong to this session's kept commits.",
    });
});

test("a pending Done cannot inherit the previous no-commit finding", async () => {
  const {
    records: { launch: record },
  } = await aDoneCaptureCase()
    .withWork((at) => makeMe.aCheckoutWork.committing("first", { at: at(20) }))
    .withCheckoutLaunch(
      "launch",
      { launched: 60, done: 10 },
      // The previous capture found no commit before Done was pending.
      (launch, { at, checkout }) =>
        launch.keptSessionCommits({
          repository: path.join(checkout.integration, ".git"),
          runs: [],
          readAt: at(30),
        }),
    )
    .please();
  const read = makeMe.aSessionReviewRead.ofRecord(record).please();

  expect(await storyReview(read, new AbortController().signal)).toEqual(
    notCaptured,
  );
});

test("capture excludes a commit that arrives after Done's tip was read", async () => {
  const {
    checkout,
    work: { second },
    timeline: {
      launch: { launchedAt },
    },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withWork((at) =>
      makeMe.aCheckoutWork
        .committing("first", { at: at(40) })
        .committing("second", { at: at(20) }),
    )
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();

  await performWork(
    makeMe.aCheckoutWork.committing("after-done", { at: at(5) }),
  );

  const capture = await readSessionCommitsAt({
    checkout: checkout.integration,
    originalRef: "HEAD",
    head: second,
    launchedAt,
  });
  expect(capture.runs).toEqual([{ base: checkout.base, revision: second }]);
});
