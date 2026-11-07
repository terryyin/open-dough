// Entry-proof gap journeys for Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): expired summaries keep wall time, and
// missing or partial entry durations stay explained without inventing zero
// (SEED-244#compare-story-ci-timing-changes examples 2 and 6). Named-build
// and wall-time journeys live in ./intent-ci-comparison.spec.ts; build-slot
// gaps live in ./intent-ci-comparison-gaps.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { untimedBaselineMixedProofs } from "../support/storyCiComparisonFixture.ts";
import { publishComparedStoryBranch } from "../support/storyCiComparisonDoneFixture.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

test.setTimeout(240_000);

test("expired entry proofs keep wall times and explain the entry gap", async ({
  page,
  origin,
}) => {
  test.slow();
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
  test.slow();
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
      "not recorded: this summary has no test execution durations",
      "4 min 30 s",
      "5 min",
      "1 of 1 part present",
    ],
    [
      "tests",
      "5 checks (no change)",
      "partial: part 2 of 2 has no duration",
      "1 min 30 s",
      "1 min",
      "1 of 1 part present",
    ],
    [
      "src/skills",
      "added → 3 checks",
      "added",
      "30 s",
      "30 s",
      "1 of 1 part present",
    ],
  ]);
});
