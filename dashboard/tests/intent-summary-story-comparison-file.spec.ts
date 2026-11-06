// File-level CI timing comparison for a selected done story
// (../src/IntentFileComparison.tsx, ../src/IntentFileReading.tsx): opening a
// changed test file shows a compact summary above Purpose with precise
// baseline → branch/landed times, counted-results differences, change kind
// and the observed-not-attributed statement, while the diff beneath stays
// unchanged (SEED-245#compare-story-intent-entry-folder-and-file-summaries
// example 2). Added and unchanged files carry the same compact summary;
// without a selected story, Purpose alone stays the file reading
// (./intent-story-*.spec.ts and other file-reading consumers).

import type { Locator } from "@playwright/test";
import { expect, test } from "./support/preparationPage.ts";
import { shortSha } from "../src/baseCiWording.ts";
import { observedNotAttributed } from "../src/storyCiComparisonWording.ts";
import { purposeRegion } from "./intentPerspectivePage.ts";
import {
  comparisonScopeColumns,
  type ComparisonScopeRow,
} from "./intentScopeProofPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "./support/intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "./support/intentStoryPage.ts";
import { selectDoneStoryForSummaryComparison } from "./support/selectDoneStoryForSummaryComparison.ts";

test.setTimeout(240_000);

const parts = "1 of 1 part present";

const modifiedFileRow: ComparisonScopeRow = [
  "dashboard/tests/folder/a.spec.ts modified",
  "1 → 1 0 tests",
  "10.0 s",
  "14.0 s +4.0 s",
  "14.0 s +4.0 s",
  parts,
];

const addedFileRow: ComparisonScopeRow = [
  "dashboard/tests/added.spec.ts added",
  "added → 1 tests",
  "added",
  "800 ms",
  "800 ms",
  parts,
];

const unchangedFileRow: ComparisonScopeRow = [
  "dashboard/tests/root.spec.ts",
  "1 → 1 0 tests",
  "1.2 s",
  "1.2 s 0 ms",
  "1.2 s 0 ms",
  parts,
];

function fileSummary(intent: Locator) {
  return intent.getByRole("region", { name: "File summary", exact: true });
}

async function expectFileComparisonRow(
  summary: Locator,
  path: string,
  row: ComparisonScopeRow,
) {
  const table = summary.getByRole("table", { name: `CI proof of ${path}` });
  await expect(table.getByRole("columnheader")).toHaveText([
    ...comparisonScopeColumns,
  ]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(1);
  const [scope, ...cells] = row;
  await expect(body.nth(0).getByRole("rowheader")).toHaveText(scope);
  await expect(body.nth(0).getByRole("cell")).toHaveText([...cells]);
}

test("a selected done story's changed test file shows a compact comparison above an unchanged Purpose diff", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSummaryComparisonStory(page, origin);
  const { intent } = await selectDoneStoryForSummaryComparison(page);

  await intentFile(intent, summaryComparisonChanges.modified).click();
  const summary = fileSummary(intent);
  const purpose = purposeRegion(intent);

  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    `CI timing comparison for ${setup.identity}`,
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.branchSide),
  );
  await expect(summary.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.completion),
  );
  await expect(summary.locator(".intent-ci-comparison-framing")).toContainText(
    observedNotAttributed,
  );
  await expectFileComparisonRow(
    summary,
    "dashboard/tests/folder/a.spec.ts",
    modifiedFileRow,
  );

  // Diff stays primary beneath: Purpose holds the story change, not the
  // comparison table.
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(
    summaryComparisonChanges.modified,
  );
  await expect(purpose.locator(".story-review-code")).toContainText("changed");
  await expect(purpose.getByRole("table")).toHaveCount(0);
  await expect(purpose.locator(".intent-ci-comparison-framing")).toHaveCount(0);

  await test.step("an added file shows added with no baseline difference", async () => {
    await intentFile(intent, summaryComparisonChanges.added).click();
    await expectFileComparisonRow(
      fileSummary(intent),
      "dashboard/tests/added.spec.ts",
      addedFileRow,
    );
    await expect(
      purposeRegion(intent).locator(".intent-story-diff-name"),
    ).toHaveText(summaryComparisonChanges.added);
  });

  await test.step("an unchanged file shows its source with the same compact summary", async () => {
    await intentFile(intent, "dashboard/tests/root.spec.ts").click();
    await expectFileComparisonRow(
      fileSummary(intent),
      "dashboard/tests/root.spec.ts",
      unchangedFileRow,
    );
    const purposeOnly = purposeRegion(intent);
    await expect(purposeOnly).toContainText("root 11");
    await expect(purposeOnly.locator(".story-review-code")).toHaveCount(0);
    await expect(purposeOnly.getByRole("table")).toHaveCount(0);
  });
});
