// Entry-proof gap journeys for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): expired summaries keep wall time, and
// missing or partial entry durations read as No timings or a gap label, with
// the full explanation as the cell's accessible description, without
// inventing zero (SEED-244#compare-story-ci-timing-changes examples 2 and 6,
// SEED-259#scan-intent-ci-summaries key example 4). Named-build
// and wall-time journeys live in ./intent-ci-comparison.spec.ts; build-slot
// gaps live in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { untimedBaselineMixedProofs } from "../support/storyCiComparisonFixture.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test("expired entry proofs keep wall times and explain the entry gap", async ({
  page,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  setup.serveProofs({
    101: { kind: "expired", artifactId: 1001 },
    102: { kind: "expired", artifactId: 1002 },
    103: { kind: "expired", artifactId: 1003 },
  });
  const { panel } = await selectDoneStoryForCiComparison(page);
  await expect(panel.locator(".intent-ci-comparison-wall").nth(1)).toHaveText(
    "3 min 20 s",
  );
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "4 min",
  );
  await expect(panel.locator(".intent-ci-comparison-entries")).toContainText(
    "This run's CI proof summary has expired.",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toHaveCount(0);
});

test("a summary without durations and a part without duration leave totals explained, never zero", async ({
  page,
  origin,
}) => {
  const setup = await publishComparedStoryBranch(page, origin);
  setup.serveProofs(
    untimedBaselineMixedProofs({
      baseline: setup.baseline,
      branchSide: setup.branchSide,
      completion: setup.completion,
    }),
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  // Exact cells prove missing durations stay explained and are never a
  // measured zero.
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "2,090 → 2,092 tests (+2)",
      "No timings",
      "4 min 30 s",
      "5 min",
    ],
    ["tests", "5 checks (no change)", "Part 2 untimed", "1 min 30 s", "1 min"],
    ["src/skills", "added → 3 checks", "added", "30 s", "30 s"],
  ]);
  const baselineCell = (row: number) =>
    panel
      .getByRole("table", { name: "CI entry timing comparison" })
      .locator("tbody")
      .getByRole("row")
      .nth(row)
      .getByRole("cell")
      .nth(1);
  await expect(baselineCell(0)).toHaveAccessibleDescription(
    "Not recorded: this summary has no test execution durations",
  );
  await expect(baselineCell(1)).toHaveAccessibleDescription(
    "Partial: part 2 of 2 has no duration",
  );
  await expect(baselineCell(1)).toHaveAttribute(
    "title",
    "Partial: part 2 of 2 has no duration",
  );
});
