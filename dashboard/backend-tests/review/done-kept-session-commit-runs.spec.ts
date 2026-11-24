import { expect, test } from "vitest";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { aDoneSession } from "../support/doneCaptureReview.ts";

const notes = (first: string, last: string) =>
  [first, "two", "three", "four", "five", "six", "seven", last, ""].join("\n");

test("commits either side of a pulled story landing are two runs, oldest first, each without the story's changes to a file the session also changed", async () => {
  const { checkout, performWork, at } = await aDoneCaptureCase()
    .withOrigin()
    .please();
  const { first, pulled, second } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", {
        at: at(45),
        files: { "notes.txt": notes("one", "eight") },
      })
      .pushingToTrunk("published", { at: at(40) })
      .fastForwardingToTrunkWork("pulled", {
        at: at(35),
        files: { "notes.txt": notes("one", "story's eight") },
      })
      .committing("second", {
        at: at(25),
        files: { "notes.txt": notes("session's one", "story's eight") },
      }),
  );
  const record = aDoneSession(checkout, [
    { base: checkout.base, revision: first },
    { base: pulled, revision: second },
  ]);

  expect(
    await storyReview({ record, read: {} }, new AbortController().signal),
  ).toMatchObject({
    commitRuns: [
      {
        commits: 1,
        subject: "Add first.txt",
        baseline: checkout.base,
        tree: first,
        committedAt: at(45),
      },
      {
        commits: 1,
        subject: "Add second.txt",
        baseline: pulled,
        tree: second,
        committedAt: at(25),
      },
    ],
    files: [{ path: "notes.txt", kind: "added" }],
  });
  expect(
    await storyReview(
      { record, read: { run: "1" } },
      new AbortController().signal,
    ),
  ).toMatchObject({
    commitRun: 1,
    files: [{ path: "notes.txt", kind: "modified" }],
  });
  const firstDiff = await reviewedFileDiff(
    {
      record,
      read: {
        baseline: checkout.base,
        tree: first,
        path: "notes.txt",
      },
    },
    new AbortController().signal,
  );
  const secondDiff = await reviewedFileDiff(
    {
      record,
      read: {
        baseline: pulled,
        tree: second,
        path: "notes.txt",
      },
    },
    new AbortController().signal,
  );
  expect(JSON.stringify(secondDiff)).toContain("+session's one");
  expect(JSON.stringify(secondDiff)).not.toContain("story's eight");
  expect(JSON.stringify(firstDiff)).not.toContain("story's");
});

test("commits either side of merged trunk work are two runs without the merge or its work", async () => {
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();
  const { base, integration } = checkout;
  const { first, merge, second } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", { at: at(45) })
      .mergingTrunkWork("merge", { at: at(35) })
      .committing("second", { at: at(25) }),
  );
  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([
    { base, revision: first },
    { base: merge, revision: second },
  ]);
  expect(
    (await git(integration, "diff", "--name-only", base, first)).stdout,
  ).toBe("first.txt\n");
  expect(
    (await git(integration, "diff", "--name-only", merge, second)).stdout,
  ).toBe("second.txt\n");
});

test("commits either side of an amended merge stay separate without the merge's files", async () => {
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();
  const { base, integration } = checkout;
  const { first, amended, second } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", { at: at(45) })
      .mergingTrunkWork("merge", { at: at(40) })
      .amending("amended", { at: at(35) })
      .committing("second", { at: at(25) }),
  );
  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([
    { base, revision: first },
    { base: amended, revision: second },
  ]);
  expect(
    (await git(integration, "diff", "--name-only", base, first)).stdout,
  ).toBe("first.txt\n");
  expect(
    (await git(integration, "diff", "--name-only", amended, second)).stdout,
  ).toBe("second.txt\n");
});
