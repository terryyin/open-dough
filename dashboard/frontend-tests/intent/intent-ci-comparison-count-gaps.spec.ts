// Count eligibility reaches overall Counts, entry rows, Summary, Proof and
// tree accessible evidence in the built app. The comparison and each run's
// proof are canonical endpoint answers
// (../../test-support/support/frontendIntentComparison.ts); acquiring and counting
// them is ../../backend-tests/intent/ci-comparison-*.spec.ts's and
// ../../../e2e/intent/intent-ci-comparison*.spec.ts's. Endpoint/unit rule
// variants are intent-ci-comparison-gaps.spec.ts's and
// intent-summary-story-comparison-gaps.spec.ts's.
import { fileProofTable } from "../../test-support/intentFileProofPage.ts";
import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { Page } from "@playwright/test";
import type { CiProofEntry } from "../../src/ciProof.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  intentLocationName,
  proofRegion,
} from "../../test-support/intentPerspectivePage.ts";
import {
  childName,
  scopeTable,
} from "../../test-support/intentScopeProofPage.ts";
import { intentLocationHeader } from "../../test-support/intentLocationHeaderLook.ts";
import {
  aSpec,
  entry,
  folder,
} from "../../test-support/support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../../test-support/support/expectCiComparisonCues.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import type { FrontendServiceState } from "../../test-support/support/frontendServiceState.ts";
import { selectDoneStoryForCiComparison } from "../../test-support/support/selectDoneStoryForCiComparison.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../../test-support/support/selectDoneStoryForSummaryComparison.ts";
import { intentFile } from "../../test-support/support/intentStoryPage.ts";
import { summaryComparisonChanges } from "../../test-support/support/intentSummaryStoryComparisonFixture.ts";

// The decisive case gap belongs to Baseline; complete files remain independent.
function countedEntry(
  aCount: number,
  fileCount: number,
  status?: "missing" | "ambiguous",
) {
  return makeMe.aCiProofEntry
    .at(entry)
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .brokenDown(
          { path: aSpec, passed: aCount, durationMs: 30_000 },
          { path: `${entry}/root.spec.ts`, passed: 2, durationMs: 10_000 },
        )
        .inParts(status ? 2 : 1, status ? { [status]: [2] } : {})
        .please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .brokenDown({ path: aSpec, passed: fileCount, durationMs: 7_000 })
        .please(),
    )
    .please();
}

// The Done story whose Baseline, Branch and Landed proofs hold ENTRIES.
async function prepareCountedComparison(
  page: Page,
  services: FrontendServiceState,
  entries: readonly CiProofEntry[],
) {
  await prepareFrontendDoneIntent(page, services, undefined, {
    comparison: (story) => story.withEntries(entries.map((held) => [held])),
  });
}

test("partial case observations retain their gap in overall Counts and entry rows while complete files alone supply the cue", async ({
  page,
  frontendServices,
}) => {
  await prepareCountedComparison(page, frontendServices, [
    countedEntry(3, 1, "missing"),
    countedEntry(4, 2),
    countedEntry(5, 2),
  ]);
  const { panel } = await selectDoneStoryForCiComparison(page);
  const overall = comparisonReading(panel).overallCounts;
  await expect(overall).toContainText(
    "5 test cases (dashboard/tests: part 2 of 2 missing; count difference unavailable) → 7 test cases",
  );
  await expect(overall).toContainText("1 → 2 test files (+1)");
  await expect(overall).not.toContainText("(+2)");
  await expectCueState(overall, { count: "more-strong" });
  const rows = comparisonReading(panel).entryTable.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).getByRole("cell").first()).toHaveText(
    "5 test cases (part 2 of 2 missing; count difference unavailable) → 6 test cases → 7 test cases",
  );
  await expectCueState(rows.nth(0), { count: "none", countReason: "partial" });
  await expect(rows.nth(1).getByRole("cell").first()).toHaveText(
    "1 → 2 test files (+1)",
  );
  await expectCueState(rows.nth(1), { count: "more-strong" });
  await expect(
    rows.nth(0).getByText("Part 2 missing", { exact: true }),
  ).toBeVisible();
});

test("ambiguous Baseline parts keep count claims out of Summary, file Proof and the tree's visible and accessible evidence", async ({
  page,
  frontendServices,
}) => {
  await prepareCountedComparison(page, frontendServices, [
    countedEntry(3, 1, "ambiguous"),
    countedEntry(4, 1),
    countedEntry(5, 1),
  ]);
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  const summary = await openSummaryComparison(intent, entry);
  const own = summary.getByRole("group", {
    name: `CI proof of ${entry}: test cases`,
    exact: true,
  });
  await expect(own.getByRole("definition").first()).toHaveText(
    "5 test cases (part 2 of 2 ambiguous; count difference unavailable) → 6 test cases → 7 test cases",
  );
  await expectCueState(own, { count: "none", countReason: "partial" });
  await expect(
    own.getByTitle("Partial: part 2 of 2 ambiguous", { exact: true }),
  ).toBeVisible();
  const caseCounts =
    "3 test cases (part 2 of 2 ambiguous; count difference unavailable) → 4 test cases → 5 test cases";
  await expect(
    scopeTable(summary, entry).getByRole("cell", {
      name: caseCounts,
      exact: true,
    }),
  ).toBeVisible();
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(folder);
  const folderOwn = summary.getByRole("group", {
    name: `CI proof of ${folder}: test cases`,
    exact: true,
  });
  await expect(folderOwn.getByRole("definition").first()).toHaveText(
    caseCounts,
  );
  await expectCueState(folderOwn, { count: "none", countReason: "partial" });
  await expect(
    scopeTable(summary, folder).getByRole("cell", {
      name: caseCounts,
      exact: true,
    }),
  ).toBeVisible();
  await expandIntentGroup(intent, entry);
  await expandIntentFolders(intent, entry);
  const file = intentFile(intent, summaryComparisonChanges.modified);
  await expect(file).toHaveAccessibleName(
    new RegExp(caseCounts.replace(/[()]/g, "\\$&")),
  );
  await expectCueState(file, { count: "none" });
  await expect(intentLocationName(intent, entry)).toHaveAccessibleName(
    /part 2 of 2 ambiguous; count difference unavailable/,
  );
  await expectCueState(intentLocationHeader(intent, entry), { count: "none" });
  await file.click();
  await fileReadingTab(intent, "Proof").click();
  const proof = fileProofTable(proofRegion(intent), aSpec);
  const caseRow = proof.locator("tbody tr").first();
  await expect(caseRow.getByRole("cell").first()).toHaveText(caseCounts);
  await expectCueState(caseRow, { count: "none", countReason: "partial" });
  await expect(
    caseRow.getByText("Part 2 ambiguous", { exact: true }),
  ).toBeVisible();
});
