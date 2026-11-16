import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Endpoint-only gap words; imported by the mounted wording spec.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/support/pageTest.ts";
import { expectCiComparisonEntryRows } from "../../tests/support/expectCiComparisonEntryRows.ts";

for (const reason of [
  "Job “lint” has an ambiguous workflow job match.",
  "The workflow file could not be read at this build's revision.",
  "The CI adapter answered no job graph: it exited with status 2 (unsupported CI adapter operation).",
  "The CI adapter's job “test” needs unknown job “lint”.",
  "The CI adapter gave no job graph: Job history expired!",
]) {
  test(`a final timing gap keeps endpoint and wall time: ${reason}`, async ({
    renderComparison,
  }) => {
    const panel = await renderComparison(
      makeMe.aComparedStory
        .wallTimed()
        .withLanded({ timeWithoutRunnerWaits: { reason } })
        .withMixedEntries()
        .please(),
    );
    await expect(comparisonReading(panel).wallTimes).toHaveText([
      "3 min",
      "3 min 20 s",
      "4 min",
    ]);
    await expect(comparisonReading(panel).timesWithoutWaits).toHaveText([
      "2 min",
      "2 min",
      `Unavailable. ${reason}`,
    ]);
    await expect(comparisonReading(panel).identities.last()).toContainText(
      "ccccccc",
    );
    await expect(comparisonReading(panel).activeComparison).toHaveText(
      "Baseline compared with Landed",
    );
  });
}

test("running Landed retains Branch fallback and its added-entry words", async ({
  renderComparison,
}) => {
  const panel = await renderComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withLanded({ kind: "running" })
      .withMixedEntries()
      .please(),
  );
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(comparisonReading(panel).wallTimes).toHaveText([
    "3 min",
    "3 min 20 s",
    "—",
  ]);
  await expect(comparisonReading(panel).timesWithoutWaits).toHaveText([
    "2 min",
    "2 min",
    "Unavailable while the build is running.",
  ]);
  await expect(comparisonReading(panel).identities.last()).toContainText(
    "running",
  );
  const added = comparisonReading(panel)
    .entryTable.locator("tbody tr")
    .filter({ hasText: "src/skills" });
  await expect(added.getByRole("cell")).toHaveText([
    "added → 3 test files",
    "added",
    "30 s",
    "Build is still running.",
  ]);
});

test("unavailable Landed proof retains the Branch counts, time and exact adapter reason", async ({
  renderComparison,
}) => {
  const panel = await renderComparison(
    makeMe.aComparedStory
      .wallTimed()
      .withAdapterAttemptAt("landed", { attemptId: "landing" })
      .withMixedEntries()
      .withProofAt(
        "landed",
        makeMe.aCiProof
          .unavailable("none", "no summary retained for this attempt")
          .please(),
      )
      .please(),
  );
  await expect(comparisonReading(panel).activeComparison).toHaveText(
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
  test(`every endpoint retains the unavailable discovery reason: ${reason}`, async ({
    renderComparison,
  }) => {
    const slot = { kind: "unavailable" as const, explanation: reason };
    const panel = await renderComparison(
      makeMe.aComparedStory
        .wallTimed()
        .withAnswer({ baseline: slot, branch: slot, landed: slot })
        .withProofs()
        .please(),
    );
    await expect(comparisonReading(panel).identities).toHaveText([
      reason,
      reason,
      reason,
    ]);
  });
}
