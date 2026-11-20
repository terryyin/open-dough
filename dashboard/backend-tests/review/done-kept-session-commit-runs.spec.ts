// The typed review reads Done's ordered runs around changes brought in from trunk.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aKeptSession,
  markDone,
  minutesAgo,
  work,
} from "../support/doneCaptureCase.ts";
import { fileDiff, review } from "../support/doneCaptureReview.ts";

const notes = (first: string, last: string) =>
  [first, "two", "three", "four", "five", "six", "seven", last, ""].join("\n");

test("commits either side of a pulled story landing are two runs, oldest first, each without the story's changes to a file the session also changed", async () => {
  const { checkout, record } = await aKeptSession({ withOrigin: true });
  const { first, pulled, second } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", {
        at: minutesAgo(45),
        files: { "notes.txt": notes("one", "eight") },
      })
      .pushingToTrunk("published", { at: minutesAgo(40) })
      .fastForwardingToTrunkWork("pulled", {
        at: minutesAgo(35),
        files: { "notes.txt": notes("one", "story's eight") },
      })
      .committing("second", {
        at: minutesAgo(25),
        files: { "notes.txt": notes("session's one", "story's eight") },
      }),
  );

  await markDone(record);

  expect(await review(record)).toMatchObject({
    commitRuns: [
      { baseline: checkout.base, tree: first, committedAt: minutesAgo(45) },
      { baseline: pulled, tree: second, committedAt: minutesAgo(25) },
    ],
    files: [{ path: "notes.txt", kind: "added" }],
  });
  expect(await review(record, 1)).toMatchObject({
    commitRun: 1,
    files: [{ path: "notes.txt", kind: "modified" }],
  });
  const firstDiff = await fileDiff(record, {
    baseline: checkout.base,
    tree: first,
    path: "notes.txt",
  });
  const secondDiff = await fileDiff(record, {
    baseline: pulled,
    tree: second,
    path: "notes.txt",
  });
  expect(JSON.stringify(secondDiff)).toContain("+session's one");
  expect(JSON.stringify(secondDiff)).not.toContain("story's eight");
  expect(JSON.stringify(firstDiff)).not.toContain("story's");
});

test("commits either side of merged trunk work are two runs without the merge or its work", async () => {
  const { checkout, record } = await aKeptSession({ withOrigin: true });
  const { first, merge, second } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(45) })
      .mergingTrunkWork("merge", { at: minutesAgo(35) })
      .committing("second", { at: minutesAgo(25) }),
  );

  await markDone(record);

  expect(await review(record)).toMatchObject({
    commitRuns: [
      { commits: 1, baseline: checkout.base, tree: first },
      { commits: 1, baseline: merge, tree: second },
    ],
    files: [{ path: "first.txt" }],
  });
  expect(await review(record, 1)).toMatchObject({
    files: [{ path: "second.txt" }],
  });
});

test("commits either side of an amended merge stay separate without the merge's files", async () => {
  const { checkout, record } = await aKeptSession({ withOrigin: true });
  const { first, amended, second } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(45) })
      .mergingTrunkWork("merge", { at: minutesAgo(40) })
      .amending("amended", { at: minutesAgo(35) })
      .committing("second", { at: minutesAgo(25) }),
  );

  await markDone(record);

  expect(await review(record)).toMatchObject({
    commitRuns: [
      { commits: 1, baseline: checkout.base, tree: first },
      { commits: 1, baseline: amended, tree: second },
    ],
    files: [{ path: "first.txt" }],
  });
  expect(await review(record, 1)).toMatchObject({
    files: [{ path: "second.txt" }],
  });
});
