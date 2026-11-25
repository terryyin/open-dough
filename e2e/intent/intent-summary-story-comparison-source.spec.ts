import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { expectFileComparisonRow } from "../../dashboard/test-support/intentFileProofPage.ts";
// A completed story's unchanged file reads Purpose from its landed revision,
// excluding later inventory, while Proof keeps the compact build comparison.
// Changed-file Purpose and Proof journeys live in
// ../../dashboard/frontend-tests/intent/intent-summary-story-comparison-file.spec.ts.

import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { expectProofRowCues } from "../../dashboard/test-support/support/expectCiComparisonCues.ts";
import { publishSummaryComparisonStory } from "../../dashboard/test-support/support/intentSummaryStoryComparisonFixture.ts";
import {
  intentFile,
  intentDiffReading,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { selectDoneStoryForChanges } from "../../dashboard/test-support/support/selectDoneStoryForSummaryComparison.ts";
import { trackStoryResultReads } from "../../dashboard/test-support/support/storyResultRequests.ts";
import { unchangedFileRow } from "../../dashboard/test-support/support/summaryComparisonFileExpectedRows.ts";

const unchangedPath = "dashboard/tests/root.spec.ts";

for (const variant of [undefined, "own-conflict-extra"] as const) {
  test(`a done story's unchanged file reads its landed source and compact Proof with ${variant ?? "clean merges"}`, async ({
    page,
    origin,
  }) => {
    const setup = await publishSummaryComparisonStory(page, origin, {
      variant,
    });
    const { text: unchangedReads } = trackStoryResultReads(page, unchangedPath);
    const { intent } = await selectDoneStoryForChanges(page);
    await intentFile(intent, unchangedPath).click();
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const purposeOnly = purposeRegion(intent);
    await expect(purposeOnly).toContainText("root 11");
    await expect(sourceRevision(intent, unchangedPath)).toContainText(
      `at revision ${setup.completion.slice(0, 7)}`,
    );
    expect(unchangedReads).toEqual([setup.completion]);
    await expect(
      intentFile(intent, "dashboard/tests/later.spec.ts"),
    ).toHaveCount(0);
    await expect(intentDiffReading(intent).code).toHaveCount(0);
    await expect(purposeOnly.getByRole("table")).toHaveCount(0);
    await fileReadingTab(intent, "Proof").click();
    await untilPageReadsAnswered(page);
    const rootProof = proofRegion(intent);
    await expectFileComparisonRow(rootProof, unchangedPath, unchangedFileRow);
    if (variant === undefined) {
      await expectProofRowCues(rootProof, unchangedPath, {
        count: "none",
        duration: "none",
        countReason: "unchanged",
        durationReason: "unchanged",
      });
    }
  });
}
