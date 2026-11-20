// The typed review reads a Done session's rebased commits as they ended.
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { aCheckout, minutesAgo, work } from "../support/doneCaptureCase.ts";
import {
  aDoneSession,
  noCommits,
  review,
} from "../support/doneCaptureReview.ts";

const filesOf = (answer: Awaited<ReturnType<typeof review>>) =>
  "files" in answer && answer.files.map(({ path }) => path);

test("two commits, the second amended, rebased onto pulled trunk and pushed are one run of the two as pushed", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const { pulled, pushed } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(45) })
      .committing("second", { at: minutesAgo(40) })
      .amending("amended", { at: minutesAgo(35) })
      .rebasingOntoTrunkWork("pulled", { at: minutesAgo(25) })
      .pushingToTrunk("pushed", { at: minutesAgo(20) }),
  );
  const record = aDoneSession(checkout, [{ base: pulled, revision: pushed }]);

  const answer = await review([record], record);
  expect(answer).toMatchObject({
    commitRuns: [
      { commits: 2, subject: "Add second.txt", baseline: pulled, tree: pushed },
    ],
  });
  expect(filesOf(answer)).toEqual(["amended.txt", "first.txt", "second.txt"]);
  // The push published the run to the origin.
  expect(
    (await git(checkout.integration, "rev-parse", "origin/main")).stdout.trim(),
  ).toBe(pushed);
});

test("a commit rebased onto fetched trunk and pushed, as a publication from the checkout does, is reviewed as its rebased commit", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const { made, fetched, pushed } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("made", { at: minutesAgo(45) })
      .rebasingTipOntoFetchedTrunkWork("fetched", { at: minutesAgo(25) })
      .pushingToTrunk("pushed", { at: minutesAgo(20) }),
  );
  const record = aDoneSession(checkout, [{ base: fetched, revision: pushed }]);

  const answer = await review([record], record);
  expect(pushed).not.toBe(made);
  expect(answer).toMatchObject({
    commitRuns: [{ commits: 1, baseline: fetched, tree: pushed }],
  });
  expect(filesOf(answer)).toEqual(["made.txt"]);
});

test("a Done session that kept no run says it made no commits", async () => {
  const checkout = await aCheckout();
  const record = aDoneSession(checkout, []);

  expect(await review([record], record)).toEqual(noCommits);
});
