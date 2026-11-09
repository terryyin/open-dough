// Endpoint-only gap words; imported by the mounted wording spec.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "./pageTest.ts";
import { test as mountedTest, mountComparison } from "./comparisonMountPage.ts";
import { renderComparison } from "./comparisonRendering.ts";
import { comparisonRenderFacts } from "./comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  wallComparedFacts,
} from "./mountedComparisonFacts.ts";
import { expectCiComparisonEntryRows } from "./expectCiComparisonEntryRows.ts";

for (const reason of [
  "Job “lint” has an ambiguous workflow job match.",
  "The workflow file could not be read at this build's revision.",
  "The CI adapter answered no job graph: it exited with status 2 (unsupported CI adapter operation).",
  "The CI adapter's job “test” needs unknown job “lint”.",
  "The CI adapter gave no job graph: Job history expired!",
]) {
  test(`a final timing gap keeps endpoint and wall time: ${reason}`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = wallComparedFacts();
    const answer = makeMe.aStoryCiComparison
      .with({
        ...facts.answer,
        landed: { ...facts.answer.landed, timeWithoutRunnerWaits: { reason } },
      })
      .please();
    const rendered = comparisonRenderFacts(
      { ...facts, answer },
      mixedEntryFacts(),
    );
    const panel = await renderComparison(page, comparisonRenderer, rendered);
    await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
      "3 min",
      "3 min 20 s",
      "4 min",
    ]);
    await expect(
      panel.locator(".intent-ci-comparison-without-waits"),
    ).toHaveText(["2 min", "2 min", `Unavailable. ${reason}`]);
    await expect(
      panel.locator(".intent-ci-comparison-identity").last(),
    ).toContainText("ccccccc");
    await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
      "Baseline compared with Landed",
    );
  });
}

test("running Landed retains Branch fallback and its added-entry words", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: { ...facts.answer.landed, kind: "running" },
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, answer },
    mixedEntryFacts(),
  );
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(panel.locator(".intent-ci-comparison-wall")).toHaveText([
    "3 min",
    "3 min 20 s",
    "—",
  ]);
  await expect(panel.locator(".intent-ci-comparison-without-waits")).toHaveText(
    ["2 min", "2 min", "Unavailable while the build is running."],
  );
  await expect(
    panel.locator(".intent-ci-comparison-identity").last(),
  ).toContainText("running");
  const added = panel
    .getByRole("table", { name: "CI entry timing comparison" })
    .locator("tbody tr")
    .filter({ hasText: "src/skills" });
  await expect(added.getByRole("cell")).toHaveText([
    "added → 3 test files",
    "added",
    "30 s",
    "Build is still running.",
  ]);
});

test("unavailable Landed proof retains the Branch counts, time and exact adapter reason", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      landed: {
        ...facts.answer.landed,
        runBranch: "main",
        adapterAttempt: { runId: "pipeline", attemptId: "landing" },
      },
    })
    .please();
  const entries = mixedEntryFacts();
  const rendered = comparisonRenderFacts({ ...facts, answer }, undefined, [
    makeMe.aCiProof.summaryFor(facts.proof(1), entries[0]).please(),
    makeMe.aCiProof.summaryFor(facts.proof(2), entries[1]).please(),
    makeMe.aCiProof
      .unavailable("none", "no summary retained for this attempt")
      .please(),
  ]);
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "2,090 → 2,092 test cases (+2)",
      "4 min",
      "+30 s",
      "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.",
    ],
    [
      "tests",
      "5 test files (no change)",
      "2 min",
      "−30 s",
      "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.",
    ],
    [
      "src/skills",
      "added → 3 test files",
      "added",
      "30 s",
      "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.",
    ],
  ]);
});

for (const reason of [
  "adapter CI service has no discovery access",
  "The CI adapter did not answer discovery within 2 seconds.",
]) {
  mountedTest(
    `every endpoint retains the unavailable discovery reason: ${reason}`,
    async ({ page, comparisonServer, comparisonServices }) => {
      const facts = wallComparedFacts();
      const slot = { kind: "unavailable" as const, explanation: reason };
      const answer = makeMe.aStoryCiComparison
        .with({ ...facts.answer, baseline: slot, branch: slot, landed: slot })
        .please();
      Object.assign(comparisonServices, {
        comparison: () => ({ json: answer }),
      });
      const panel = await mountComparison(page, comparisonServer, facts);
      await expect(panel.locator(".intent-ci-comparison-identity")).toHaveText([
        reason,
        reason,
        reason,
      ]);
      expect(comparisonServices.proofs).toBe(0);
    },
  );
}
