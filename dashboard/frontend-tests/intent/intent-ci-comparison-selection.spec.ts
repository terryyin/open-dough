// A late answer for a previous selection, story or attempt, loses to the
// current story's comparison after it is visible.
import { expect, test } from "vitest";
import type { CiProof } from "../../src/ciProof.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  ciReadsOf,
  heldReply,
  mountCiEvidence,
} from "./intent-ci-evidence-page.tsx";

test("a held comparison for an old selection cannot replace the current story's endpoints", async () => {
  const first = makeMe.aComparedStory.please();
  const next = makeMe.aComparedStory.ofAnotherStory().please();
  const held = heldReply<StoryCiComparisonAnswer>();
  const reads = ciReadsOf(next);
  reads.answers.comparison = (identity) =>
    identity === first.identity ? held.promise : next.answer;
  const evidence = await mountCiEvidence(first, reads.source);
  await expect.poll(() => reads.asked.comparisons.length).toBe(1);
  evidence.selects(next);
  const comparison = await evidence.comparison();
  const baseline = () => comparison.identities()[0]?.text;
  await expect.poll(baseline).toContain("ddddddd");
  await expect
    .poll(comparison.overallCounts)
    .toEqual(["10 → 4 test cases (−6)"]);
  expect(reads.asked.comparisons[0]).toEqual({
    identity: first.identity,
    aborted: true,
  });
  held.resolve(first.answer);
  await expect.poll(baseline).toContain("ddddddd");
  expect(baseline()).not.toContain("aaaaaaa");
  expect(reads.asked.comparisons).toHaveLength(2);
});

test("a held endpoint proof for an old story cannot paint the current story's counts", async () => {
  const first = makeMe.aComparedStory.please();
  const next = makeMe.aComparedStory.ofAnotherStory().please();
  const held = heldReply<CiProof>();
  const reads = ciReadsOf(next);
  reads.answers.comparison = (identity) =>
    identity === first.identity ? first.answer : next.answer;
  reads.answers.proof = (subject) =>
    subject.runId === 1
      ? held.promise
      : next.proof(subject.runId as number).proof;
  const evidence = await mountCiEvidence(first, reads.source);
  await expect.poll(() => reads.asked.proofs.length).toBe(3);
  evidence.selects(next);
  const comparison = await evidence.comparison();
  await expect
    .poll(comparison.overallCounts)
    .toEqual(["10 → 4 test cases (−6)"]);
  const oldBaseline = reads.asked.proofs.find(
    ({ subject }) =>
      subject.runId === 1 && subject.revision === first.answer.storyStart,
  );
  expect(oldBaseline?.aborted).toBe(true);
  held.resolve(first.proof(1).proof);
  await expect
    .poll(comparison.overallCounts)
    .toEqual(["10 → 4 test cases (−6)"]);
  expect(reads.asked.comparisons).toHaveLength(2);
  expect(reads.asked.proofs).toHaveLength(6);
});
