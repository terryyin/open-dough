// File-level Purpose and CI Proof (../../src/IntentFileProof.tsx).
// Purpose shows a changed-file diff without comparison above it; Proof keeps
// precise A/B/C times, count differences and change kinds, including a test
// file only the story's integration merge edited. Added and
// unchanged files keep Proof; story-free source Purpose and judged-run Proof
// are in ./intent-file-purpose-proof.spec.ts.

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
const mergeEditedFileRow: ComparisonScopeRow = [
  "dashboard/tests/folder/nested/c.spec.ts modified",
  "1 → 1 0 tests",
  "340 ms",
  "410 ms +70 ms",
  "410 ms +70 ms",
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

for (const variant of [undefined, "own-conflict-extra"] as const)
  test(`a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with ${variant ?? "clean merges"}`, async ({
    page,
    origin,
  }) => {
    test.slow();
    const setup = await publishSummaryComparisonStory(page, origin, variant);
    const { intent } = await selectDoneStoryForSummaryComparison(page);

    await intentFile(intent, summaryComparisonChanges.modified).click();
    const purpose = purposeRegion(intent);
    const purposeTab = fileReadingTab(intent, "Purpose");
    const proofTab = fileReadingTab(intent, "Proof");

    await expect(purposeTab).toHaveAttribute("aria-selected", "true");
    await expect(purpose.locator(".intent-story-diff-name")).toHaveText(
      summaryComparisonChanges.modified,
    );
    await expect(purpose.locator(".story-review-code")).toContainText(
      "changed",
    );
    await expect(purpose.getByRole("table")).toHaveCount(0);
    await expect(purpose.locator(".intent-ci-comparison-framing")).toHaveCount(
      0,
    );
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

    if (variant !== undefined)
      await test.step("a test file only the integration merge edited shows that edit and keeps Proof", async () => {
        await intentFile(intent, summaryComparisonChanges.mergeEdited).click();
        const edited = purposeRegion(intent);
        await expect(edited.locator(".intent-story-diff-name")).toHaveText(
          summaryComparisonChanges.mergeEdited,
        );
        await expect(edited.locator(".story-review-code")).toContainText(
          "merge edit",
        );
        await expect(edited.locator(".story-review-code")).not.toContainText(
          "changed",
        );
        await fileReadingTab(intent, "Proof").click();
        await expectFileComparisonRow(
          proofRegion(intent),
          "dashboard/tests/folder/nested/c.spec.ts",
          mergeEditedFileRow,
        );
        await fileReadingTab(intent, "Purpose").click();
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
