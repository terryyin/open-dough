// A running Landed keeps one Branch fallback, read once, as the reader moves
// from the story's comparison to the entry, its folders and a file's Proof.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

test("Landed running preserves one Branch fallback through entry, folders and file Proof", async () => {
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withLanded({ kind: "running" })
    .please();
  const ci = scopeReadsOf(story);
  const scope = await mountCiScope(story, ci.source);
  const reason = "Landed is not used: Build is still running.";
  const fallback = ["Baseline compared with Branch"];
  await expect.poll(() => scope.story.activeComparison()).toEqual(fallback);
  expect(scope.story.fallbackReason()).toEqual([reason]);
  for (const child of [undefined, "folder/", "nested/"]) {
    if (child !== undefined) await scope.summary.open(child);
    await expect.poll(() => scope.summary.activeComparison()).toEqual(fallback);
    expect(scope.summary.fallbackReason()).toEqual([reason]);
  }
  await scope.summary.open("c.spec.ts");
  await expect.poll(() => scope.proof.activeComparison()).toEqual(fallback);
  expect(scope.proof.fallbackReason()).toEqual([reason]);
  await expect
    .element(
      scope.proof.fileCell("dashboard/tests/folder/nested/c.spec.ts", "Branch"),
    )
    .toHaveTextContent("+70 ms");
  expect(ci.asked.comparisons).toHaveLength(1);
  expect(ci.asked.proofs).toHaveLength(2);
});
