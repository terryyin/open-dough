// File-level Purpose and CI Proof (../../src/IntentFileProof.tsx).
// Purpose shows a changed-file diff without comparison above it; Proof keeps
// precise A/B/C times, count differences and change kinds, including a test
// file only the story's integration merge edited, and returns directly to the
// story's CI comparison (../../src/intentStoryTabs.tsx), Changed tests keeping
// the file and Proof for the way back. Added, renamed-across-units and
// unchanged files keep Proof; story-free source Purpose and judged-run Proof
// are in ./intent-file-purpose-proof.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../ciEvidenceLabelsPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { expectProofRowCues } from "../support/expectCiComparisonCues.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  expectStoryTab,
  intentFile,
  storyTab,
} from "../support/intentStoryPage.ts";
import { selectDoneStoryForSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  addedFileRow,
  expectFileComparisonRow,
  mergeEditedFileRow,
  modifiedFileRow,
  renamedFileRow,
  unchangedFileRow,
} from "../support/summaryComparisonFileExpectedRows.ts";

for (const variant of [undefined, "own-conflict-extra"] as const) {
  test(`a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with ${variant ?? "clean merges"}`, async ({
    page,
    origin,
  }) => {
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
    await expectNoComparisonFraming(purpose);
    await expect(
      intent.getByRole("region", { name: "File summary", exact: true }),
    ).toHaveCount(0);

    await proofTab.click();
    const proof = proofRegion(intent);
    await expect(proofTab).toHaveAttribute("aria-selected", "true");
    // The file's Proof shares the Summary's comparison labels.
    await expectEvidenceLabels(comparisonLabels(proof, setup.identity), [
      `Baseline No build ${shortSha(setup.baseline)}`,
      `Branch ${shortSha(setup.branchSide)}`,
      `Landed ${shortSha(setup.completion)}`,
    ]);
    await expectObservedNotAttributed(proof);
    await expectFileComparisonRow(
      proof,
      "dashboard/tests/folder/a.spec.ts",
      modifiedFileRow,
    );
    if (variant === undefined) {
      await expectProofRowCues(proof, "dashboard/tests/folder/a.spec.ts", {
        count: "none",
        duration: "slower-light",
        countReason: "unchanged",
      });
    }

    if (variant === undefined)
      await test.step("the file's Proof returns directly to the story's CI comparison by keyboard, and Changed tests keeps the file and Proof", async () => {
        await proof
          .getByRole("button", {
            name: "View story CI comparison",
            exact: true,
          })
          .focus();
        await page.keyboard.press("Enter");
        await expectStoryTab(intent, "CI comparison");
        await expect(storyTab(intent, "CI comparison")).toBeFocused();
        await expect(
          intent
            .getByRole("tabpanel", { name: "CI comparison" })
            .getByRole("table", { name: "CI entry timing comparison" }),
        ).toBeVisible();
        await expect(proof).toBeHidden();
        // Arrow keys move along the story's views.
        await page.keyboard.press("ArrowRight");
        await expectStoryTab(intent, "Changed tests");
        await expect(
          intentFile(intent, summaryComparisonChanges.modified),
        ).toHaveAttribute("aria-pressed", "true");
        await expect(proofTab).toHaveAttribute("aria-selected", "true");
        await expect(proof).toBeVisible();
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
      if (variant === undefined) {
        await expectProofRowCues(addedProof, "dashboard/tests/added.spec.ts", {
          count: "none",
          duration: "none",
          countReason: "added",
          durationReason: "added",
        });
      }
      await fileReadingTab(intent, "Purpose").click();
      await expect(
        purposeRegion(intent).locator(".intent-story-diff-name"),
      ).toHaveText(summaryComparisonChanges.added);
    });

    if (variant === undefined)
      await test.step("a file renamed from a shell check's test file into a Playwright test case keeps each endpoint's own time, with no change, mark or cue across units", async () => {
        await intentFile(intent, summaryComparisonChanges.renamed).click();
        await fileReadingTab(intent, "Proof").click();
        const renamedProof = proofRegion(intent);
        await expectFileComparisonRow(
          renamedProof,
          "dashboard/tests/renamed.spec.ts",
          renamedFileRow,
        );
        await expectProofRowCues(
          renamedProof,
          "dashboard/tests/renamed.spec.ts",
          {
            count: "none",
            duration: "none",
            countReason: "units not comparable",
            durationReason: "units not comparable",
          },
        );
        await expect(renamedProof.locator(".intent-ci-time-mark")).toHaveCount(
          0,
        );
        await fileReadingTab(intent, "Purpose").click();
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
      const rootProof = proofRegion(intent);
      await expectFileComparisonRow(
        rootProof,
        "dashboard/tests/root.spec.ts",
        unchangedFileRow,
      );
      if (variant === undefined) {
        await expectProofRowCues(rootProof, "dashboard/tests/root.spec.ts", {
          count: "none",
          duration: "none",
          countReason: "unchanged",
          durationReason: "unchanged",
        });
      }
    });
  });
}
