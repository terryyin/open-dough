// Adapter proof absence stays distinct from GitHub run wording.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { StoryCiComparisonSlot } from "../../src/storyCiComparison.ts";
import { test, expect, mountComparison } from "./comparisonMountPage.ts";
import { wallComparedFacts } from "./mountedComparisonFacts.ts";
import { expectExactSourceCue } from "./expectCiComparisonSourceCue.ts";

function adapterSlot(
  slot: Extract<StoryCiComparisonSlot, { kind: "build" }>,
  attemptId: string,
  ambiguous = false,
) {
  return {
    ...slot,
    runBranch: "main",
    adapterAttempt: {
      runId: "pipeline",
      attemptId,
      ...(ambiguous ? { ambiguous: true as const } : {}),
    },
  };
}

test("adapter proof size limit is named separately for every endpoint", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: adapterSlot(facts.answer.baseline, "1"),
      branch: adapterSlot(facts.answer.branch, "2"),
      landed: adapterSlot(facts.answer.landed, "3"),
    })
    .please();
  Object.assign(comparisonServices, {
    comparison: () => ({ json: answer }),
    proof: (params: URLSearchParams) => ({
      json: {
        runId: "pipeline",
        attemptId: params.get("attempt-id"),
        branch: "main",
        revision: params.get("revision"),
        checkedAt: facts.answer.checkedAt,
        proof: makeMe.aCiProof.tooLarge(1024 * 1024).please(),
      },
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  const gaps = panel.locator(".intent-ci-comparison-entries");
  for (const label of ["Baseline", "Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt's CI proof is larger than the 1 MiB proof limit.`,
    );
});

test("invalid adapter Baseline and ambiguous Branch and Landed retain their own proof reasons", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: adapterSlot(facts.answer.baseline, "1"),
      branch: adapterSlot(facts.answer.branch, "2", true),
      landed: {
        ...adapterSlot(facts.answer.landed, "2", true),
        revision: "b".repeat(40),
      },
    })
    .please();
  Object.assign(comparisonServices, {
    comparison: () => ({ json: answer }),
    proof: () => ({
      json: {
        runId: "pipeline",
        attemptId: "1",
        branch: "main",
        revision: "a".repeat(40),
        checkedAt: facts.answer.checkedAt,
        proof: makeMe.aCiProof
          .unavailable("invalid", "schemaVersion is not 1 or 2")
          .please(),
      },
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  const gaps = panel.locator(".intent-ci-comparison-entries");
  await expect(gaps).toContainText(
    "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1 or 2.",
  );
  for (const label of ["Branch", "Landed"])
    await expect(gaps).toContainText(
      `${label} — This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.`,
    );
  expect(comparisonServices.proofs).toBe(1);
});

test("adapter builds with no recorded wall time keep exact source words and hide attempt ids", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  const gap = {
    kind: "none" as const,
    explanation:
      "No build at aaaaaaa: no ancestor build was found to compare against.",
  };
  const slot = {
    ...facts.answer.branch,
    startedAt: undefined,
    completedAt: undefined,
    runBranch: "main",
    adapterAttempt: { runId: "landing", attemptId: "passed-retry" },
  };
  const answer = makeMe.aStoryCiComparison
    .with({ ...facts.answer, baseline: gap, branch: slot, landed: slot })
    .please();
  Object.assign(comparisonServices, {
    comparison: () => ({ json: answer }),
    proof: () => ({
      json: {
        runId: "landing",
        attemptId: "passed-retry",
        branch: "main",
        revision: slot.revision,
        checkedAt: facts.answer.checkedAt,
        proof: makeMe.aCiProof.unavailable("none", "no proof kept").please(),
      },
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  const builds = panel.locator(".intent-ci-comparison-identity");
  await expect(builds.first()).toHaveText(gap.explanation);
  for (const index of [1, 2]) {
    await expect(builds.nth(index)).toContainText("bbbbbbb");
    await expectExactSourceCue(builds.nth(index));
    await expect(builds.nth(index)).not.toContainText("attempt passed-retry");
    await expect(
      panel.locator(".intent-ci-comparison-wall").nth(index),
    ).toHaveText("Not recorded");
  }
});
