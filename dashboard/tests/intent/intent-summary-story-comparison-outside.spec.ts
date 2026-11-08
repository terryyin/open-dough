// What a story comparison Summary (../../src/IntentScopeComparisonTable.tsx)
// says beyond its rows, as a single-run Summary does
// (./intent-summary-ci-proof-gaps.spec.ts): the labels after the table say
// what **Not in the rows above** holds in the primary endpoint's proof, and
// an entry that proof does not break down by file is labelled
// **No file breakdown**, naming that endpoint.

import { expect, test } from "../support/preparationPage.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import {
  outsideLandedProofs,
  publishSummaryComparisonStory,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { scopeTable } from "../intentScopeProofPage.ts";

const outsideRow = "Not in the rows above";

test("a comparison Summary labels what Not in the rows above holds and an entry without a file breakdown", async ({
  page,
  origin,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  setup.serveProofs(
    outsideLandedProofs({
      baseline: setup.baseline,
      branchSide: setup.branchSide,
      completion: setup.completion,
    }),
  );
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(
    scopeTable(summary, "dashboard/tests")
      .locator("tbody")
      .getByRole("row")
      .last()
      .getByRole("rowheader"),
  ).toHaveText(outsideRow);
  const outside = evidenceLabels(summary, outsideRow);
  await expectEvidenceLabels(outside, [
    "1 file not in the tree",
    "Part 2 no breakdown",
  ]);
  await expectLabelInFull(
    outside,
    "1 file not in the tree",
    "Not in the tree: dashboard/tests/ghost.spec.ts",
  );
  await expectLabelInFull(
    outside,
    "Part 2 no breakdown",
    "part 2 of 2 has no file breakdown",
  );
  await expect(evidenceLabel(summary, "No file breakdown")).toHaveCount(0);

  const tests = await openSummaryComparison(intent, "tests");
  await expect(evidenceLabels(tests, "About these figures"))
    .toMatchAriaSnapshot(`
    - list "About these figures":
      - listitem: No file breakdown , The Landed CI proof summary does not break tests down by file
  `);
  await expectInFull(
    evidenceLabel(tests, "No file breakdown"),
    "The Landed CI proof summary does not break tests down by file",
  );
  await expect(evidenceLabels(tests, outsideRow)).toHaveCount(0);
});
