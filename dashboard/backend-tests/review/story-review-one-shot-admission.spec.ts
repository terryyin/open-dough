// Story Review selects a one-shot launch's retained run by its reference.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { reviewLandedRunsOf } from "../../src/storyReviewLandedRun.ts";
import { reviewedLandedRunByReference } from "../../server/storyReviewRunAdmission.ts";

const story = {
  identity: "SEED-7#story-a",
  reference: "11111111-1111-4111-8111-111111111111",
};
const storyLaunch = makeMe.aLaunchRecord
  .ofOneShotStoryLaunch("story-session", story)
  .please();
const storyLandedRuns = reviewLandedRunsOf(
  [storyLaunch],
  "open-dough",
  story.identity,
  () => false,
);
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
