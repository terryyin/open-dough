// File-level Purpose and CI Proof in the built app (../../src/IntentFileProof.tsx).
// Purpose shows the changed file's diff without comparison above it; Proof
// keeps the compared row of a modified, added, renamed-across-units and
// merge-edited file, and returns directly to the story's CI comparison
// (../../src/intentStoryTabs.tsx), Changed tests keeping the file and Proof
// for the way back. The changed files, merge edit included, are the
// Backend's explicit review answer; its Git judgment is
// ../../../e2e/intent/intent-summary-story-comparison-{source,renamed}.spec.ts's.
// Row counts, times and cue rules are
// intent-summary-story-comparison-file-proof-counts.spec.ts's.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { timeMarks } from "../../test-support/support/relativeTimingMarks.ts";
import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
import { expectFileComparisonRow } from "../../test-support/intentFileProofPage.ts";
import { holdAuthenticatedReadsWhere } from "../../test-support/holdAuthenticatedReads.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../../test-support/intentPerspectivePage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { summaryComparisonChanges } from "../../test-support/support/intentSummaryStoryComparisonShared.ts";
import {
  expectStoryTab,
  intentFile,
  storyTab,
  intentDiffReading,
} from "../../test-support/support/intentStoryPage.ts";
import { selectDoneStoryForChangedTests } from "../../test-support/support/selectDoneStoryForSummaryComparison.ts";
import {
  addedFileRow,
  mergeEditedFileRow,
  modifiedFileRow,
  renamedFileRow,
} from "../../test-support/support/summaryComparisonFileExpectedRows.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

const mergeEdited = "dashboard/tests/folder/nested/c.spec.ts";

for (const merge of ["clean", "merge-edited"] as const) {
  test(`a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with ${merge} merges`, async ({
    page,
    frontendServices,
  }) => {
    const setup = await prepareFrontendDoneIntent(
      page,
      frontendServices,
      undefined,
      merge === "clean"
        ? {}
        : {
            comparison: (story) =>
              story.withChanged(
                makeMe.aReviewedFile
                  .with({ kind: "modified", path: mergeEdited })
                  .please(),
              ),
          },
    );
    for (const [path, line] of [
      ["dashboard/tests/added.spec.ts", "added"],
      ["dashboard/tests/renamed.spec.ts", "renamed"],
      [mergeEdited, "merge edit"],
    ] as const)
      setup.review.answerFile(frontendFileDiff(path, [line]), path);
    const ci = await holdAuthenticatedReadsWhere(
      page,
      (params) => params.get("intent") === "ci-comparison",
      releases,
    );
    const { intent } = await selectDoneStoryForChangedTests(page);
    // Choosing Changed tests does not depend on the CI comparison finishing.
    await expect.poll(() => ci.held()).toBeGreaterThan(0);
    ci.release();

    await intentFile(intent, summaryComparisonChanges.modified).click();
    const purpose = purposeRegion(intent);
    const purposeTab = fileReadingTab(intent, "Purpose");
    const proofTab = fileReadingTab(intent, "Proof");
    await expect(purposeTab).toHaveAttribute("aria-selected", "true");
    await expect(intentDiffReading(intent).name).toHaveText(
      summaryComparisonChanges.modified,
    );
    await expect(intentDiffReading(intent).code).toContainText("changed");
    await expect(purpose.getByRole("table")).toHaveCount(0);
    await expectNoComparisonFraming(purpose);
    await expect(
      intent.getByRole("region", { name: "File summary", exact: true }),
    ).toHaveCount(0);

    await proofTab.click();
    await untilPageReadsAnswered(page);
    const proof = proofRegion(intent);
    await expect(proofTab).toHaveAttribute("aria-selected", "true");
    // The file's Proof shares the Summary's comparison labels.
    await expectEvidenceLabels(comparisonLabels(proof, setup.identity), [
      "Baseline No build aaaaaaa",
      "Branch bbbbbbb",
      "Landed ccccccc",
    ]);
    await expectObservedNotAttributed(proof);
    await expectFileComparisonRow(
      proof,
      "dashboard/tests/folder/a.spec.ts",
      modifiedFileRow,
    );

    if (merge === "clean")
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
          comparisonReading(
            intent.getByRole("tabpanel", { name: "CI comparison" }),
          ).entryTable,
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
      await expect(proofTab).toHaveAttribute("aria-selected", "true");
      await expectFileComparisonRow(
        proofRegion(intent),
        "dashboard/tests/added.spec.ts",
        addedFileRow,
      );
      await purposeTab.click();
      await expect(intentDiffReading(intent).name).toHaveText(
        summaryComparisonChanges.added,
      );
    });

    if (merge === "clean")
      await test.step("a file renamed from a shell check's test file into a Playwright test case keeps each endpoint's own time, with no mark across units", async () => {
        await intentFile(intent, summaryComparisonChanges.renamed).click();
        await proofTab.click();
        const renamedProof = proofRegion(intent);
        await expectFileComparisonRow(
          renamedProof,
          "dashboard/tests/renamed.spec.ts",
          renamedFileRow,
        );
        await expect(timeMarks(renamedProof)).toHaveCount(0);
        await purposeTab.click();
      });

    if (merge === "merge-edited")
      await test.step("a test file only the integration merge edited shows that edit and keeps Proof", async () => {
        await intentFile(intent, summaryComparisonChanges.mergeEdited).click();
        await expect(intentDiffReading(intent).name).toHaveText(
          summaryComparisonChanges.mergeEdited,
        );
        await expect(intentDiffReading(intent).code).toContainText(
          "merge edit",
        );
        await expect(intentDiffReading(intent).code).not.toContainText(
          "changed",
        );
        await proofTab.click();
        await expectFileComparisonRow(
          proofRegion(intent),
          mergeEdited,
          mergeEditedFileRow,
        );
        await purposeTab.click();
      });
  });
}
