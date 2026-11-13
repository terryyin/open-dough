import { comparisonReading } from "../../dashboard/tests/intentCiComparisonPage.ts";
// The real GitHub Actions missing-proof connection keeps timed equivalent
// wall time separate from Branch's proof-backed entry comparison.
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { readWaitLimitMs } from "../../dashboard/src/authenticatedReadRules.ts";
import { expectCiComparisonEntryRows } from "../../dashboard/tests/support/expectCiComparisonEntryRows.ts";
import { publishSkippedLandingWithoutProof } from "../../dashboard/tests/support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/tests/support/selectDoneStoryForCiComparison.ts";

test("Landed reuses equivalent wall time when that build published no proof, walks no further, and keeps entry comparison on Branch", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedLandingWithoutProof(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = comparisonReading(panel).identities.nth(2);
  await expect(landedIdentity).toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).toContainText("equivalent build");
  await expect(landedIdentity).not.toContainText("run 201");
  await expect(landedIdentity).not.toContainText("run 101");
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("5 min");
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(comparisonReading(panel).fallbackReason).toHaveText(
    /Landed is not used: .+published no CI proof summary/,
  );
  await expect(comparisonReading(panel).entryTable).toBeVisible({
    timeout: readWaitLimitMs + 15_000,
  });
  const missingProof = "This run published no CI proof summary.";
  await expectCiComparisonEntryRows(panel, [
    [
      "dashboard/tests",
      "2,090 → 2,092 test cases (+2)",
      "4 min",
      "+30 s",
      missingProof,
    ],
    ["tests", "5 test files (no change)", "2 min", "−30 s", missingProof],
    ["src/skills", "added → 3 test files", "added", "30 s", missingProof],
  ]);
});
