// Landed confirmed-skip journeys on Intent's CI timing comparison
// (../../src/IntentCiComparison.tsx): a planning-only merge reuses the
// equivalent build's proof when published, or its timed wall time without
// inventing proof when the equivalent published none
// (SEED-288#reuse-adapter-equivalent-timing); a code landing with no run
// keeps No build and uses no ancestor. Baseline skip/cancelled/No-build
// journeys stay in ./intent-ci-comparison-skipped.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { readWaitLimitMs } from "../../src/authenticatedReadRules.ts";
import {
  comparedStoryEntryRows,
  expectCiComparisonEntryRows,
} from "../support/expectCiComparisonEntryRows.ts";
import {
  publishCodeLandingWithoutBuild,
  publishSkippedLandingWithoutProof,
  publishSkippedPlanningLanding,
} from "../support/storyCiComparisonSkippedFixture.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { expectNoRunOrAttemptIds } from "../support/expectCiComparisonSourceCue.ts";

test("Landed names Skipped at a planning-only merge and uses the equivalent build proof", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedPlanningLanding(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const skippedAt = `Skipped at ${shortSha(setup.landingMerge)} because CI ignores every change since its nearest built ancestor ${shortSha(setup.trunkSide)}.`;
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).not.toContainText(skippedAt);
  await expect(landedIdentity).toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).toContainText("equivalent build");
  await expect(
    landedIdentity.locator(".intent-ci-comparison-source"),
  ).toHaveCount(0);
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  // Endpoint wall cells stay absolute; signed wall change is overall context
  // (SEED-255 before→after presentation).
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "5 min",
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
  await expectCiComparisonEntryRows(panel, comparedStoryEntryRows);
});

test("Landed reuses equivalent wall time when that build published no proof, walks no further, and keeps entry comparison on Branch", async ({
  page,
  origin,
}) => {
  const setup = await publishSkippedLandingWithoutProof(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).toContainText("equivalent build");
  await expect(landedIdentity).not.toContainText("run 201");
  await expect(landedIdentity).not.toContainText("run 101");
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "5 min",
  );
  await expect(panel.locator(".intent-ci-comparison-active")).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(panel.locator(".intent-ci-comparison-active-reason")).toHaveText(
    /Landed is not used: .+published no CI proof summary/,
  );
  await expect(
    panel.getByRole("table", { name: "CI entry timing comparison" }),
  ).toBeVisible({ timeout: readWaitLimitMs + 15_000 });
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

test("Landed names No build for a code landing with no run and uses no ancestor proof", async ({
  page,
  origin,
}) => {
  const setup = await publishCodeLandingWithoutBuild(page, origin);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = panel.locator(".intent-ci-comparison-identity").nth(2);
  await expect(landedIdentity).toContainText(
    `No build at ${shortSha(setup.landingMerge)}: changes CI does not ignore.`,
  );
  await expect(landedIdentity).not.toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).not.toContainText("run 201");
  await expect(landedIdentity).not.toContainText("equivalent build");
  await expect(panel.locator(".intent-ci-comparison-wall").nth(2)).toHaveText(
    "—",
  );
});
