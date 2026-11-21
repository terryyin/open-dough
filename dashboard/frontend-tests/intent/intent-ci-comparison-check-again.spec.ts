// Check again through the actual evidence owner and its readers: a held
// reply keeps the control disabled, and each answered round rereads every
// endpoint proof once.
import { expect, test } from "vitest";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  ciReadsOf,
  heldReply,
  mountCiEvidence,
} from "./intent-ci-evidence-page.tsx";

test("Check again reads all endpoint proofs afresh and replaces Branch fallback with recovered Landed proof", async () => {
  const story = makeMe.aComparedStory.please();
  const reads = ciReadsOf(story);
  const retry = heldReply<StoryCiComparisonAnswer>();
  let landedReads = 0;
  reads.answers.comparison = () =>
    reads.asked.comparisons.length === 1 ? story.answer : retry.promise;
  reads.answers.proof = (subject) => {
    if (subject.runId === 3) landedReads += 1;
    return subject.runId === 3 && landedReads === 1
      ? makeMe.aCiProof
          .unavailable("unreadable", "Endpoint proof unavailable")
          .please()
      : story.proof(subject.runId as number).proof;
  };
  const evidence = await mountCiEvidence(story, reads.source);
  const comparison = await evidence.comparison();
  await expect
    .poll(comparison.activeComparison)
    .toEqual(["Baseline compared with Branch"]);
  expect(comparison.overallCounts()).toEqual(["2 → 3 test cases (+1)"]);
  await evidence.checkAgain.click();
  await expect.element(evidence.checkAgain).toBeDisabled();
  expect(reads.asked.comparisons).toHaveLength(2);
  retry.resolve(story.answer);
  await expect
    .poll(comparison.activeComparison)
    .toEqual(["Baseline compared with Landed"]);
  await expect
    .poll(comparison.overallCounts)
    .toEqual(["2 → 4 test cases (+2)"]);
  await expect.element(evidence.checkAgain).toBeEnabled();
  expect(reads.asked.proofs).toHaveLength(6);
  expect(landedReads).toBe(2);
});

test("Check again disables while a failed whole comparison is read again and recovers its endpoints", async () => {
  const story = makeMe.aComparedStory.please();
  const reads = ciReadsOf(story);
  const initial = heldReply<StoryCiComparisonAnswer>();
  const retry = heldReply<StoryCiComparisonAnswer>();
  reads.answers.comparison = () =>
    reads.asked.comparisons.length === 1 ? initial.promise : retry.promise;
  const evidence = await mountCiEvidence(story, reads.source);
  await expect.element(evidence.checkAgain).toBeDisabled();
  initial.reject(new Error("Comparison temporarily unavailable"));
  await expect
    .poll(evidence.gaps)
    .toEqual(["Comparison temporarily unavailable"]);
  await expect.element(evidence.checkAgain).toBeEnabled();
  await evidence.checkAgain.click();
  await expect.element(evidence.checkAgain).toBeDisabled();
  expect(reads.asked.comparisons).toHaveLength(2);
  retry.resolve(story.answer);
  const comparison = await evidence.comparison();
  await expect
    .poll(comparison.activeComparison)
    .toEqual(["Baseline compared with Landed"]);
  expect(comparison.identities().map(({ text }) => text.slice(0, 7))).toEqual([
    "aaaaaaa",
    "bbbbbbb",
    "ccccccc",
  ]);
  await expect.element(evidence.checkAgain).toBeEnabled();
  await expect.poll(() => reads.asked.proofs.length).toBe(3);
});

test("Check again retries an unavailable whole answer and replaces its explanation", async () => {
  const story = makeMe.aComparedStory.please();
  const unavailable = makeMe.aStoryCiComparison
    .with({
      kind: "unavailable",
      identity: story.identity,
      checkedAt: story.answer.checkedAt,
      explanation: "Published execution history is incomplete",
    })
    .please();
  const reads = ciReadsOf(story);
  reads.answers.comparison = () =>
    reads.asked.comparisons.length === 1 ? unavailable : story.answer;
  const evidence = await mountCiEvidence(story, reads.source);
  await expect.poll(evidence.gaps).toEqual([unavailable.explanation]);
  await evidence.checkAgain.click();
  const comparison = await evidence.comparison();
  await expect
    .poll(comparison.activeComparison)
    .toEqual(["Baseline compared with Landed"]);
  expect(evidence.gaps()).toEqual([]);
  await expect.poll(() => reads.asked.proofs.length).toBe(3);
  expect(reads.asked.comparisons).toHaveLength(2);
});
