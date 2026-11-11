import { comparisonReading } from "../intentCiComparisonPage.ts";
// The real GitHub Actions missing-proof connection keeps timed equivalent
// wall time separate from Branch's proof-backed entry comparison.
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { publishSkippedLandingWithoutProof } from "../support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";

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
