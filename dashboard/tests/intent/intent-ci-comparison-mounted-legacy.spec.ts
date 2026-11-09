import {
  expect,
  test,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  summaryScopeFacts,
  serveComparison,
} from "../support/comparisonScopeFacts.ts";
import { expandIntentFolders } from "../intentPerspectivePage.ts";
import {
  aSpec,
  dashboardTests,
  entry,
  expectNamedRows,
  expectOwnFigures,
} from "../support/ciComparisonUnitsJourney.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { summaryComparisonChanges } from "../support/intentSummaryStoryComparisonFixture.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import type { Locator } from "@playwright/test";

async function fileProofRows(
  intent: Locator,
  file: string,
  rows: readonly (readonly string[])[],
) {
  await intentFile(intent, summaryComparisonChanges.modified).click();
  const body = intent
    .getByRole("table", { name: `CI proof of ${file}`, exact: true })
    .locator("tbody tr");
  await expect(body).toHaveCount(rows.length);
  for (const [at, cells] of rows.entries()) {
    await expect(body.nth(at).getByRole("rowheader")).toHaveText(
      `${file} modified`,
    );
    await expect(body.nth(at).getByRole("cell")).toHaveText([...cells]);
  }
}

// Seven test cases and one test file at Landed.
const landed = dashboardTests({ cases: true }, 5, 40_000, 7_000);
// Six legacy "tests" results at Baseline, nine at Branch.
const legacyAtBaselineAndBranch = {
  baseline: [dashboardTests({ legacy: "tests" }, 4, 35_000)],
  branch: [dashboardTests({ legacy: "tests" }, 7, 42_000)],
  landed: [landed],
};

const parts = "1 of 1 part present";
// The entry's and folder's Counts with legacy results at Baseline and Branch.
const entryCounts =
  "6 legacy test results → 9 legacy test results → 7 test cases and 1 test file (legacy unit unknown)";
const folderCounts =
  "4 legacy test results → 7 legacy test results → 5 test cases and 1 test file (legacy unit unknown)";

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the overall Counts and entry row keep both labelled ends readable and say why there is no test case or test file difference (examples 38, 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(
    comparisonServices,
    facts,
    Object.values(legacyAtBaselineAndBranch),
  );
  const panel = await mountComparison(page, comparisonServer, {
    ...facts,
    scope: undefined,
  });
  const overall = panel.locator(".intent-ci-comparison-overall-counts");
  await expect(overall).toHaveText(
    "6 legacy test results → 7 test cases and 1 test file (legacy unit unknown)",
  );
  await expectCueState(overall, {
    count: "none",
    countReason: "no overall count",
  });
  await expectCiComparisonEntryRows(panel, [
    [entry, entryCounts, "45 s", "52 s", "50 s (test cases); 7 s (test files)"],
  ]);
});

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the location Summary's own figures and child rows keep both labelled ends readable and say why there is no difference (examples 38, 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(
    comparisonServices,
    facts,
    Object.values(legacyAtBaselineAndBranch),
  );
  await mountComparison(page, comparisonServer, facts);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expectOwnFigures(summary, `CI proof of ${entry}`, [
    entryCounts,
    "45.0 s",
    "52.0 s",
    "50.0 s (test cases); 7.0 s (test files)",
    `test cases: ${parts}; test files: ${parts}`,
  ]);
  await expectNamedRows(summary, entry, "folder/", [
    [
      "",
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
  // Equal totals in a changed unit are no "no change".
  await expectNamedRows(summary, entry, "root.spec.ts", [
    [
      "",
      "2 legacy test results → 2 legacy test results → 2 test cases (legacy unit unknown)",
      "10.0 s",
      "10.0 s",
      "10.0 s",
    ],
  ]);
});

test("with legacy results at Baseline and at Branch, spelled alike with different totals, the changed file's Proof row keeps both labelled ends readable and says why there is no difference (examples 38, 39)", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  serveComparison(
    comparisonServices,
    facts,
    Object.values(legacyAtBaselineAndBranch),
  );
  await mountComparison(page, comparisonServer, facts);
  const intent = page.locator("#root");
  await expandIntentFolders(intent, entry);
  await fileProofRows(intent, aSpec, [
    [
      folderCounts,
      "35.0 s",
      "42.0 s",
      "40.0 s (test cases); 7.0 s (test files)",
    ],
  ]);
});
