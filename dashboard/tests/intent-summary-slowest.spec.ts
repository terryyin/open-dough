// A Gherkin summary's slowest scenarios list holds at most ten of the proven
// rows anywhere in the selection, slowest first, equal durations in tree then
// source order (../src/intentSummaryProofCost.ts,
// ../src/IntentSummarySlowest.tsx); the rows' cells are proven in
// `./intent-summary-proof-cost.spec.ts`.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { intentLocationName } from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  bulkPath,
  doughnut,
  publishedFiles,
} from "./intentSummaryProofCostFixtures.ts";
import { slowestList, sumLine } from "./intentSummaryProofCostPage.ts";

test("9.1: the slowest list holds the ten slowest rows from anywhere in the selection, ties in tree then source order", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishFiles(page, {
    repository: doughnut.repository,
    ref: doughnut.ref,
    revision: doughnut.revision,
    files: publishedFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await intentLocationName(intent, bulkPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(
    summary.getByText(`${sumLine}: 41.6 s over 12 of 12 scenarios`, {
      exact: true,
    }),
  ).toBeVisible();
  const slowest = slowestList(summary);
  // T6 (200 ms) and D6 (100 ms) fall outside the ten.
  await expect(slowest.locator("tbody th")).toHaveText(
    "D1 T1 D2 D3 T2 T3 T4 D4 T5 D5".split(" "),
  );
  const files = slowest.locator("tbody tr td:nth-of-type(1)");
  await expect(files.first()).toHaveText("z_sub/deep.feature");
  await expect(files.nth(1)).toHaveText("a_top.feature");
});
