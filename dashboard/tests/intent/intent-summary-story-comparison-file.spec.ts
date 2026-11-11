import { timeMarks } from "../support/relativeTimingMarks.ts";
import { comparisonReading } from "../intentCiComparisonPage.ts";
import { expectFileComparisonRow } from "../intentFileProofPage.ts";
// File-level Purpose and CI Proof (../../src/IntentFileProof.tsx).
// Purpose shows a changed-file diff without comparison above it; Proof keeps
// precise A/B/C times, count differences and change kinds, including a test
// file only the story's integration merge edited, and returns directly to the
// story's CI comparison (../../src/intentStoryTabs.tsx), Changed tests keeping
// the file and Proof for the way back. Added, renamed-across-units and
// unchanged files keep Proof. Landed unchanged source is covered in
// ./intent-summary-story-comparison-source.spec.ts; story-free Purpose and
// judged-run Proof are in ./intent-file-purpose-proof.spec.ts.

import { expect, test } from "../support/preparationPage.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  comparisonLabels,
  expectEvidenceLabels,
  expectNoComparisonFraming,
  expectObservedNotAttributed,
} from "../ciEvidenceLabelsPage.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { storyReviewFileEndpoint } from "../../src/storyReviewContract.ts";
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
import { selectDoneStoryForChangedTests } from "../support/selectDoneStoryForSummaryComparison.ts";
import {
  addedFileRow,
  mergeEditedFileRow,
  modifiedFileRow,
  renamedFileRow,
} from "../support/summaryComparisonFileExpectedRows.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

for (const variant of [undefined, "own-conflict-extra"] as const) {
  test(`a selected done story's changed test file shows Purpose as the diff and Proof as the compact comparison with ${variant ?? "clean merges"}`, async ({
    page,
    origin,
  }) => {
    const setup = await publishSummaryComparisonStory(page, origin, variant);
    const ci = await holdAuthenticatedReadsWhere(
      page,
      (params) => params.get("intent") === "ci-comparison",
      releases,
    );
    const { intent } = await selectDoneStoryForChangedTests(page);
    // Choosing Changed tests does not depend on the CI comparison finishing.
    await expect.poll(() => ci.held()).toBeGreaterThan(0);
    ci.release();
    const nextDiff = (path: string) =>
      page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          url.pathname === storyReviewFileEndpoint &&
          url.searchParams.get("path") === path
        );
      });

    const modifiedRead = nextDiff("dashboard/tests/folder/a.spec.ts");
    await intentFile(intent, summaryComparisonChanges.modified).click();
    await modifiedRead;
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
    await untilPageReadsAnswered(page);
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
        await expect(timeMarks(renamedProof)).toHaveCount(0);
        await fileReadingTab(intent, "Purpose").click();
      });

    if (variant !== undefined)
      await test.step("a test file only the integration merge edited shows that edit and keeps Proof", async () => {
        const editedRead = nextDiff("dashboard/tests/folder/nested/c.spec.ts");
        await intentFile(intent, summaryComparisonChanges.mergeEdited).click();
        await editedRead;
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
  });
}
