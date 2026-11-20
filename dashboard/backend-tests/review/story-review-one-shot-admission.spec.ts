// A one-shot story launch is reviewed by its story: its session's file reads
// are refused toward the story, and a story review names its landed run by
// that launch's reference. Typed handlers and run selection in-process, from
// MakeMe launch records: no server, no machine stores, no Git.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { reviewLandedRunsOf } from "../../src/storyReviewLandedRun.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { reviewedLandedRunByReference } from "../../server/storyReviewRunAdmission.ts";

const story = {
  identity: "SEED-7#story-a",
  reference: "11111111-1111-4111-8111-111111111111",
};
const storyLaunch = makeMe.aLaunchRecord
  .ofOneShotStoryLaunch("story-session", story)
  .please();
const deliveredFile = {
  baseline: "a".repeat(40),
  tree: "b".repeat(40),
  path: "delivered.txt",
};
const sessionFileRead = makeMe.aSessionReviewRead
  .ofSession("story-session")
  .keeping([storyLaunch])
  .readingFile(deliveredFile)
  .please();
const storyLandedRuns = reviewLandedRunsOf(
  [storyLaunch],
  "open-dough",
  story.identity,
  () => false,
);
const signal = () => new AbortController().signal;

test("Given a one-shot story launch, when its session's file diff is read, then it is refused for its story", async () => {
  const refused = reviewedFileDiff(sessionFileRead, signal());

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 400,
    message:
      "This session belongs to a story launch and is reviewed by its story.",
  });
});

test("Given a one-shot story launch, when its session's file text is read, then it is refused for its story", async () => {
  const refused = reviewedFileText(sessionFileRead, signal());

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 400,
    message:
      "This session belongs to a story launch and is reviewed by its story.",
  });
});

test("Given a one-shot story launch, when its story review names the launch's reference, then that launch is the reviewed run", () => {
  expect(
    reviewedLandedRunByReference(storyLandedRuns, story.reference).record,
  ).toBe(storyLaunch);
});

test("Given a one-shot story launch, when its story review names another reference, then the story has no such landed run", () => {
  expect(() =>
    reviewedLandedRunByReference(
      storyLandedRuns,
      "22222222-2222-4222-8222-222222222222",
    ),
  ).toThrow(
    expect.objectContaining({
      status: 404,
      message: "This story has no landed run with that reference.",
    }),
  );
});

test("Given a one-shot story launch, when its story review names a revision instead of a reference, then the reference is malformed", () => {
  expect(() => reviewedLandedRunByReference(storyLandedRuns, "HEAD")).toThrow(
    expect.objectContaining({
      status: 400,
      message: "The review launch reference is malformed.",
    }),
  );
});
