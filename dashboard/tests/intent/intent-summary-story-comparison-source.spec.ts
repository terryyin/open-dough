import { sourceRevision } from "../intentCodeBrowsePage.ts";
import { expectFileComparisonRow } from "../intentFileProofPage.ts";
// A completed story's unchanged file reads Purpose from its landed revision,
// excluding later inventory, while Proof keeps the compact build comparison.
// Changed-file Purpose and Proof journeys live in
// ./intent-summary-story-comparison-file.spec.ts.

import {
  expect,
  queuedClaudePreviewTest as test,
} from "../support/preparationPage.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { expectProofRowCues } from "../support/expectCiComparisonCues.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import { intentFile, intentDiffReading } from "../support/intentStoryPage.ts";
import { selectDoneStoryForChangedTests } from "../support/selectDoneStoryForSummaryComparison.ts";
import { unchangedFileRow } from "../support/summaryComparisonFileExpectedRows.ts";

for (const variant of [undefined, "own-conflict-extra"] as const) {
  test(`a done story's unchanged file reads its landed source and compact Proof with ${variant ?? "clean merges"}`, async ({
    page,
    origin,
  }) => {
    const setup = await publishSummaryComparisonStory(page, origin, {
      variant,
    });
    const unchangedReads: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.pathname === authenticatedReadEndpoint &&
        url.searchParams.get("path") === "dashboard/tests/root.spec.ts"
      )
        unchangedReads.push(url.searchParams.get("revision") ?? "");
    });
    const { intent } = await selectDoneStoryForChangedTests(page);
    await intentFile(intent, "dashboard/tests/root.spec.ts").click();
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const purposeOnly = purposeRegion(intent);
    await expect(purposeOnly).toContainText("root 11");
    await expect(
      sourceRevision(intent, "dashboard/tests/root.spec.ts"),
    ).toContainText(`at revision ${setup.completion.slice(0, 7)}`);
    expect(unchangedReads).toEqual([setup.completion]);
    await expect(
      intentFile(intent, "dashboard/tests/later.spec.ts"),
    ).toHaveCount(0);
    await expect(intentDiffReading(intent).code).toHaveCount(0);
    await expect(purposeOnly.getByRole("table")).toHaveCount(0);
    await fileReadingTab(intent, "Proof").click();
    await untilPageReadsAnswered(page);
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
}
