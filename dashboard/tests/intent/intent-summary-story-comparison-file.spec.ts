// File-level CI Proof for a selected done story
// (../../src/IntentFileProof.tsx, ../../src/IntentFileReading.tsx): opening a
// changed test file shows Purpose as the story diff with no comparison above
// it, and Proof as a compact comparison with precise baseline → branch/landed
// times, counted-results differences, change kind and the
// observed-not-attributed statement
// (SEED-245#compare-story-intent-entry-folder-and-file-summaries example 2;
// SEED-247#restore-file-purpose-and-proof). Added and unchanged files carry
// the same Proof comparison; without a selected story, Purpose is the source
// and Proof is the judged-run file row (./intent-file-purpose-proof.spec.ts).

import type { Locator } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import {
  comparisonScopeColumns,
  type ComparisonScopeRow,
} from "../intentScopeProofPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import { selectDoneStoryForSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";

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

async function expectFileComparisonRow(
  proof: Locator,
  path: string,
  row: ComparisonScopeRow,
) {
  const table = proof.getByRole("table", { name: `CI proof of ${path}` });
  await expect(table.getByRole("columnheader")).toHaveText([
    ...comparisonScopeColumns,
  ]);
  const body = table.locator("tbody").getByRole("row");
  await expect(body).toHaveCount(1);
  const [scope, ...cells] = row;
  await expect(body.nth(0).getByRole("rowheader")).toHaveText(scope);
  await expect(body.nth(0).getByRole("cell")).toHaveText([...cells]);
}

test("a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison", async ({
  page,
  origin,
}) => {
  test.slow();
  const setup = await publishSummaryComparisonStory(page, origin);
  const { intent } = await selectDoneStoryForSummaryComparison(page);

  await intentFile(intent, summaryComparisonChanges.modified).click();
  const purpose = purposeRegion(intent);
  const purposeTab = fileReadingTab(intent, "Purpose");
  const proofTab = fileReadingTab(intent, "Proof");

  await expect(purposeTab).toHaveAttribute("aria-selected", "true");
  await expect(purpose.locator(".intent-story-diff-name")).toHaveText(
    summaryComparisonChanges.modified,
  );
  await expect(purpose.locator(".story-review-code")).toContainText("changed");
  await expect(purpose.getByRole("table")).toHaveCount(0);
  await expect(purpose.locator(".intent-ci-comparison-framing")).toHaveCount(0);
  await expect(
    intent.getByRole("region", { name: "File summary", exact: true }),
  ).toHaveCount(0);

  await proofTab.click();
  const proof = proofRegion(intent);
  await expect(proofTab).toHaveAttribute("aria-selected", "true");
  await expect(proof.locator(".intent-summary-evidence")).toContainText(
    `CI timing comparison for ${setup.identity}`,
  );
  await expect(proof.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.baseline),
  );
  await expect(proof.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.branchSide),
  );
  await expect(proof.locator(".intent-summary-evidence")).toContainText(
    shortSha(setup.completion),
  );
  await expect(proof.locator(".intent-ci-comparison-framing")).toContainText(
    observedNotAttributed,
  );
  await expectFileComparisonRow(
    proof,
    "dashboard/tests/folder/a.spec.ts",
    modifiedFileRow,
  );

  await test.step("an added file keeps Proof selected and shows added with no baseline difference", async () => {
    await intentFile(intent, summaryComparisonChanges.added).click();
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expectFileComparisonRow(
      proofRegion(intent),
      "dashboard/tests/added.spec.ts",
      addedFileRow,
    );
    await fileReadingTab(intent, "Purpose").click();
    await expect(
      purposeRegion(intent).locator(".intent-story-diff-name"),
    ).toHaveText(summaryComparisonChanges.added);
  });

  await test.step("an unchanged file shows its source on Purpose with the same compact Proof", async () => {
    await intentFile(intent, "dashboard/tests/root.spec.ts").click();
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const purposeOnly = purposeRegion(intent);
    await expect(purposeOnly).toContainText("root 11");
    await expect(purposeOnly.locator(".story-review-code")).toHaveCount(0);
    await expect(purposeOnly.getByRole("table")).toHaveCount(0);
    await fileReadingTab(intent, "Proof").click();
    await expectFileComparisonRow(
      proofRegion(intent),
      "dashboard/tests/root.spec.ts",
      unchangedFileRow,
    );
  });
});
