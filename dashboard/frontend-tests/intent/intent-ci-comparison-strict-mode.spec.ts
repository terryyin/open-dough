// Development StrictMode cleanup and setup around the actual evidence owner:
// the first attachment's comparison read is abandoned, the reattached owners
// answer, and unmounting abandons every read.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciReadsOf, mountCiEvidence } from "./intent-ci-evidence-page.tsx";

test("StrictMode reattaches comparison and proof reads after effect cleanup", async () => {
  const story = makeMe.aComparedStory.please();
  const reads = ciReadsOf(story);
  const evidence = await mountCiEvidence(story, reads.source, {
    strict: true,
  });
  const comparison = await evidence.comparison();
  await expect
    .poll(comparison.activeComparison)
    .toEqual(["Baseline compared with Landed"]);
  await expect.element(evidence.checkAgain).toBeEnabled();
  expect(reads.asked.comparisons.map(({ aborted }) => aborted)).toEqual([
    true,
    false,
  ]);
  // Endpoint proofs start only once the comparison answers, after StrictMode's
  // cleanup, so the reattached proof owner reads each endpoint just once.
  expect(reads.asked.proofs.map(({ aborted }) => aborted)).toEqual([
    false,
    false,
    false,
  ]);
  evidence.unmount();
  await expect
    .poll(() =>
      [...reads.asked.comparisons, ...reads.asked.proofs].every(
        ({ aborted }) => aborted,
      ),
    )
    .toBe(true);
});
