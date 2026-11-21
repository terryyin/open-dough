// The actual evidence owner follows a Taken story's newly observed trunk head.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciReadsOf, mountCiEvidence } from "./intent-ci-evidence-page.tsx";

test("a Taken comparison keeps the same observed tip and reads again once that tip changes", async () => {
  const story = makeMe.aComparedStory.takenOnTrunk();
  const taken = story.please();
  const advanced = story.trunkHeadAdvanced().please();
  const reads = ciReadsOf(taken);
  reads.answers.comparison = () =>
    reads.asked.comparisons.length === 1 ? taken.answer : advanced.answer;
  const evidence = await mountCiEvidence(taken, reads.source);
  const comparison = await evidence.comparison();
  const provisional = () => comparison.identities()[2]?.text;
  await expect.poll(provisional).toContain("bbbbbbb");
  await expect.poll(() => reads.asked.proofs.length).toBe(2);
  evidence.selects({
    ...taken,
    work: makeMe.aPublishedWork.with({ ...taken.work }).please(),
  });
  await expect.poll(provisional).toContain("bbbbbbb");
  expect(reads.asked.comparisons).toHaveLength(1);
  evidence.selects(advanced);
  await expect.poll(provisional).toContain("ccccccc");
  await expect.poll(() => reads.asked.proofs.length).toBe(3);
  expect(reads.asked.comparisons).toHaveLength(2);
  await expect.element(evidence.checkAgain).not.toBeInTheDocument();
});
