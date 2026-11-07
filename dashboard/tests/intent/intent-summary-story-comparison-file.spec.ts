// File-level Purpose and CI Proof (../../src/IntentFileProof.tsx).
// Purpose shows a changed-file diff without comparison above it; Proof keeps
// precise A/B/C times, count differences and change kinds, even when Review
// cannot attribute merges. Added/unchanged files keep Proof; story-free source
// Purpose and judged-run Proof are in ./intent-file-purpose-proof.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { observedNotAttributed } from "../../src/storyCiComparisonWording.ts";
import {
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { expectProofRowCues } from "../support/expectCiComparisonCues.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import { folderToggle, intentFile } from "../support/intentStoryPage.ts";
import { selectDoneStoryForSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  addedFileRow,
  addedFileRowWithoutOverlay,
  expectFileComparisonRow,
  fileRowWithoutOverlay,
  modifiedFileRow,
  unchangedFileRow,
} from "../support/summaryComparisonFileExpectedRows.ts";

test.setTimeout(240_000);

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
  await expectProofRowCues(proof, "dashboard/tests/folder/a.spec.ts", {
    count: "none",
    duration: "slower-light",
    countReason: "unchanged",
  });

  await test.step("an added file keeps Proof selected and shows added with no baseline difference", async () => {
    await intentFile(intent, summaryComparisonChanges.added).click();
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const addedProof = proofRegion(intent);
    await expectFileComparisonRow(
      addedProof,
      "dashboard/tests/added.spec.ts",
      addedFileRow,
    );
    await expectProofRowCues(addedProof, "dashboard/tests/added.spec.ts", {
      count: "none",
      duration: "none",
      countReason: "added",
      durationReason: "added",
    });
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
    const rootProof = proofRegion(intent);
    await expectFileComparisonRow(
      rootProof,
      "dashboard/tests/root.spec.ts",
      unchangedFileRow,
    );
    await expectProofRowCues(rootProof, "dashboard/tests/root.spec.ts", {
      count: "none",
      duration: "none",
      countReason: "unchanged",
      durationReason: "unchanged",
    });
  });
});

for (const variant of [
  "own-conflict-extra",
  "non-owning-story-file",
] as const) {
  const label =
    variant === "own-conflict-extra"
      ? "owning merge-resolution edits"
      : "non-owning merge resolution on a story file";
  test(`a selected done story with ${label}: Proof keeps A, B, C without Review overlay`, async ({
    page,
    origin,
  }) => {
    test.slow();
    const setup = await publishSummaryComparisonStory(page, origin, variant);
    const { intent } = await selectDoneStoryForSummaryComparison(page);

    await expandIntentGroup(intent, "dashboard/tests");
    await folderToggle(intent, "folder", false).click();
    await intentFile(intent, "dashboard/tests/folder/a.spec.ts").click();
    await fileReadingTab(intent, "Proof").click();
    const proof = proofRegion(intent);

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
    await expect(proof).not.toContainText(
      "merge resolutions whose story changes cannot be attributed safely",
    );
    await expect(proof).not.toContainText(
      "merge resolutions affecting this story's files whose changes cannot be attributed safely",
    );
    await expectFileComparisonRow(
      proof,
      "dashboard/tests/folder/a.spec.ts",
      fileRowWithoutOverlay,
    );

    await test.step("an added trunk file keeps its Proof comparison", async () => {
      await intentFile(intent, "dashboard/tests/added.spec.ts").click();
      await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expectFileComparisonRow(
        proofRegion(intent),
        "dashboard/tests/added.spec.ts",
        addedFileRowWithoutOverlay,
      );
    });

    await test.step("an unchanged file keeps Proof selected with the same comparison", async () => {
      await intentFile(intent, "dashboard/tests/root.spec.ts").click();
      await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expectFileComparisonRow(
        proofRegion(intent),
        "dashboard/tests/root.spec.ts",
        unchangedFileRow,
      );
      await fileReadingTab(intent, "Purpose").click();
      const purposeOnly = purposeRegion(intent);
      await expect(purposeOnly).toContainText("root 11");
      await expect(purposeOnly.locator(".story-review-code")).toHaveCount(0);
    });
  });
}
