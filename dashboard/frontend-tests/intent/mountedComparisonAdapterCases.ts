import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Adapter proof absence stays distinct from GitHub run wording.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import {
  adapterSlot,
  wallComparedFacts,
} from "../../tests/support/mountedComparisonFacts.ts";
import { expectExactSourceCue } from "../../tests/support/expectCiComparisonSourceCue.ts";

test("adapter proof size limit is named separately for every endpoint", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: adapterSlot(facts.answer.baseline, { attemptId: "1" }),
      branch: adapterSlot(facts.answer.branch, { attemptId: "2" }),
      landed: adapterSlot(facts.answer.landed, { attemptId: "3" }),
    })
    .please();
  const rendered = comparisonRenderFacts({ ...facts, answer }, undefined, [
    makeMe.aCiProof.tooLarge(1024 * 1024).please(),
    makeMe.aCiProof.tooLarge(1024 * 1024).please(),
    makeMe.aCiProof.tooLarge(1024 * 1024).please(),
  ]);
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const gaps = comparisonReading(panel).entryEvidence;
  for (const label of ["Baseline", "Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt's CI proof is larger than the 1 MiB proof limit.`,
    );
});

test("invalid adapter Baseline and ambiguous Branch and Landed retain their own proof reasons", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: adapterSlot(facts.answer.baseline, { attemptId: "1" }),
      branch: adapterSlot(facts.answer.branch, {
        attemptId: "2",
        ambiguous: true,
      }),
      landed: {
        ...adapterSlot(facts.answer.landed, {
          attemptId: "2",
          ambiguous: true,
        }),
        revision: "b".repeat(40),
      },
    })
    .please();
  const rendered = comparisonRenderFacts({ ...facts, answer }, undefined, [
    makeMe.aCiProof
      .unavailable("invalid", "schemaVersion is not 1 or 2")
      .please(),
    undefined,
    undefined,
  ]);
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const gaps = comparisonReading(panel).entryEvidence;
  await expect(gaps).toContainText(
    "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1 or 2.",
  );
  for (const label of ["Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.`,
    );
});

test("adapter builds with no recorded wall time keep exact source words and hide attempt ids", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const gap = {
    kind: "none" as const,
    explanation:
      "No build at aaaaaaa: no ancestor build was found to compare against.",
  };
  const slot = adapterSlot(
    facts.answer.branch,
    { runId: "landing", attemptId: "passed-retry" },
    { startedAt: undefined, completedAt: undefined },
  );
  const answer = makeMe.aStoryCiComparison
    .with({ ...facts.answer, baseline: gap, branch: slot, landed: slot })
    .please();
  const rendered = comparisonRenderFacts({ ...facts, answer }, undefined, [
    undefined,
    makeMe.aCiProof.unavailable("none", "no proof kept").please(),
    makeMe.aCiProof.unavailable("none", "no proof kept").please(),
  ]);
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const builds = comparisonReading(panel).identities;
  await expect(builds.first()).toHaveText(gap.explanation);
  for (const index of [1, 2]) {
    await expect(builds.nth(index)).toContainText("bbbbbbb");
    await expectExactSourceCue(builds.nth(index));
    await expect(builds.nth(index)).not.toContainText("attempt passed-retry");
    await expect(comparisonReading(panel).wallTimes.nth(index)).toHaveText(
      "Not recorded",
    );
  }
});
