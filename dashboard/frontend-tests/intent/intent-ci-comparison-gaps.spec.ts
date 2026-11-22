// The real control stays usable through repeated unavailable Baseline answers.
import { expect, test } from "vitest";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  ciReadsOf,
  heldReply,
  mountCiEvidence,
} from "./intent-ci-evidence-page.tsx";

test("each failed Baseline Check again holds the button disabled and retains the query and failure reason", async () => {
  const story = makeMe.aComparedStory.please();
  const reason = `head_sha=${story.answer.storyStart}: GitHub is unreachable`;
  const failed = makeMe.aStoryCiComparison
    .with({
      ...story.answer,
      baseline: { kind: "unavailable", explanation: reason },
    })
    .please();
  const reads = ciReadsOf(story);
  let nextRead: Promise<StoryCiComparisonAnswer> | undefined;
  reads.answers.comparison = () => nextRead ?? failed;
  const evidence = await mountCiEvidence(story, reads.source);
  const comparison = await evidence.comparison();
  const baseline = () => comparison.identities()[0]?.text;
  await expect.poll(baseline).toBe(reason);
  for (let round = 0; round < 2; round += 1) {
    const held = heldReply<StoryCiComparisonAnswer>();
    nextRead = held.promise;
    await evidence.checkAgain.click();
    await expect.element(evidence.checkAgain).toBeDisabled();
    expect(reads.asked.comparisons).toHaveLength(round + 2);
    held.resolve(failed);
    await expect.element(evidence.checkAgain).toBeEnabled();
    expect(baseline()).toBe(reason);
  }
  await expect.poll(() => reads.asked.proofs.length).toBe(6);
});
