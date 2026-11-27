// Which revision a story result reads: the named comparison's own tree only.
// Admitting the comparison itself (an older Taken head, a Done completion
// after main advances, a retained landing) is ./story-review-published-taken.spec.ts,
// ./story-review-file-text-admission.spec.ts and the landed review specs.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReviewResultRequest } from "../../server/storyReviewResultRequest.ts";
import { resultRevision } from "../../server/storyReviewResultAnswer.ts";
import {
  storyReviewResultEndpoint,
  storyReviewResultQuery,
} from "../../src/storyReviewResult.ts";

const completion = "c".repeat(40);
const done = makeMe.aStoryReview.published(completion).please();
const taken = makeMe.aStoryReview.please();
const landed = makeMe.aStoryReview.landed().please();
if (
  done.kind !== "published" ||
  taken.kind !== "published-taken" ||
  landed.kind !== "landed"
)
  throw new Error("Missing named comparisons");

test("a Done result reads its completion, a Taken one its head and a landed one its landing", () => {
  expect(resultRevision(done, done.tree)).toBe(completion);
  expect(resultRevision(taken, taken.tree)).toBe(taken.head);
  expect(resultRevision(landed, landed.tree)).toBe(landed.landing.revision);
});

test("a result cannot read a tree its comparison does not name", () => {
  expect(() => resultRevision(taken, taken.baseline)).toThrow(
    expect.objectContaining({ status: 409 }),
  );
});

test("a result path cannot leave its tree", () => {
  const query = storyReviewResultQuery({
    subject: { source: "open-dough", identity: "SEED-1#story" },
    publishedHead: taken.head,
    tree: taken.tree,
    path: "../other-story.txt",
  });
  const url = new URL(storyReviewResultEndpoint, "http://127.0.0.1");
  url.search = new URLSearchParams(query).toString();

  expect(() => storyReviewResultRequest(url)).toThrow(
    expect.objectContaining({ status: 400 }),
  );
});
