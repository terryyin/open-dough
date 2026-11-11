import { fileProofTable } from "../intentFileProofPage.ts";
// Signed quantity and zero-baseline rendering over independent literal rows.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../support/comparisonScopeFacts.ts";
import { scopeTable, scopeComparisonCell } from "../intentScopeProofPage.ts";
import {
  expectRenderedSortedBy,
  rowNames,
} from "../support/expectSortedColumns.ts";
import {
  showPercent,
  timeMarks,
  percentages,
} from "../support/relativeTimingMarks.ts";
import { mountedSummarySortExpected } from "../support/mountedSummarySortExpected.ts";
const entry = "dashboard/tests";
const timed = (path: string, ms: number) =>
  makeMe.aCiProofEntry.at(path).timed(ms).please();

for (const column of ["Branch", "Landed", "Baseline"] as const) {
  test(`Summary ${column} sorts its displayed quantity with gaps last in both directions`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = summaryScopeFacts();
    const after = [
      timed(entry, 1_000_000),
      timed(`${entry}/folder`, 90_000),
      timed(`${entry}/root.spec.ts`, 660_000),
      timed(`${entry}/renamed.spec.ts`, 280_000),
      timed(`${entry}/added.spec.ts`, 5_000),
    ];
    const rendered = comparisonRenderFacts(facts, [
      [
        timed(entry, 1_000_000),
        timed(`${entry}/folder`, 60_000),
        timed(`${entry}/root.spec.ts`, 600_000),
        timed("tests/old.sh", 300_000),
      ],
      after,
      after,
    ]);
    await renderComparison(page, comparisonRenderer, rendered);
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const table = scopeTable(summary, entry);
    await expect(rowNames(table)).toHaveText([
      "folder/",
      "added.spec.ts",
      "gone.spec.ts",
      "renamed.spec.ts",
      "root.spec.ts",
    ]);
    await expect(showPercent(summary)).not.toBeChecked();
    const { ascending, descending } =
      mountedSummarySortExpected[column === "Baseline" ? "baseline" : "signed"];
    await renderComparison(page, comparisonRenderer, rendered, {
      showPercent: true,
      sort: {
        column:
          column === "Baseline"
            ? "baseline"
            : column === "Branch"
              ? "branch"
              : "landed",
        direction: "ascending",
      },
    });
    if (column !== "Baseline") {
      await expect(
        scopeComparisonCell(summary, entry, "folder/", column),
      ).toHaveText("+30.0 s+50%");
      await expect(
        scopeComparisonCell(summary, entry, "root.spec.ts", column),
      ).toHaveText("+1 min+10%");
      await expect(
        scopeComparisonCell(summary, entry, "renamed.spec.ts", column),
      ).toHaveText("−20.0 s−7%");
    }
    await expectRenderedSortedBy(table, column, "ascending", ascending);
    await renderComparison(page, comparisonRenderer, rendered, {
      showPercent: true,
      sort: {
        column:
          column === "Baseline"
            ? "baseline"
            : column === "Branch"
              ? "branch"
              : "landed",
        direction: "descending",
      },
    });
    await expectRenderedSortedBy(table, column, "descending", descending);
  });
}

test("a measured zero Baseline file keeps its signed change without relative marks or percentages", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const path = `${entry}/root.spec.ts`;
  const after = [timed(entry, 350_000), timed(path, 30_000)];
  const rendered = comparisonRenderFacts(facts, [
    [timed(entry, 300_000), timed(path, 0)],
    after,
    after,
  ]);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: { ...facts.scope, selection: { path, scope: "file" } },
  });
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  const cells = fileProofTable(proof, path)
    .locator("tbody tr")
    .getByRole("cell");
  await expect(cells.nth(1)).toHaveText("0 ms");
  await renderComparison(
    page,
    comparisonRenderer,
    {
      ...rendered,
      scope: { ...facts.scope, selection: { path, scope: "file" } },
    },
    { showPercent: true },
  );
  for (const at of [2, 3]) {
    await expect(cells.nth(at)).toHaveText("+30.0 s");
    await expect(timeMarks(cells.nth(at))).toHaveCount(0);
    await expect(percentages(cells.nth(at))).toHaveCount(0);
  }
});
