// Actual sortable headers over canonical endpoint proof, without acquisition setup.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  timedEntry,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import { expectSortedBy, rowNames } from "../support/expectSortedColumns.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";

test("Baseline and Counts display both sort directions with baseline gaps last", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const rendered = comparisonRenderFacts(facts, mixedEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expect(rowNames(table)).toHaveText([
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await expect(table.locator("th[aria-sort]")).toHaveCount(0);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "baseline", direction: "ascending" },
  });
  await expectSortedBy(table, "Baseline", "ascending", [
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "baseline", direction: "descending" },
  });
  await expectSortedBy(table, "Baseline", "descending", [
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "counts", direction: "ascending" },
  });
  await expectSortedBy(table, "Counts", "ascending", [
    "src/skills",
    "tests",
    "dashboard/tests",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "counts", direction: "descending" },
  });
  await expectSortedBy(table, "Counts", "descending", [
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
});

for (const column of ["Branch", "Landed"] as const) {
  test(`${column} sorts signed changes rather than duration or percentage and keeps gaps last both ways`, async ({
    page,
    comparisonRenderer,
  }) => {
    const facts = wallComparedFacts();
    const untimed = makeMe.aCiProofEntry.at("e/untimed").please();
    const rendered = comparisonRenderFacts(facts, [
      [
        timedEntry("e/big", 600_000),
        timedEntry("e/small", 60_000),
        timedEntry("e/down", 300_000),
        untimed,
      ],
      [
        timedEntry("e/big", 660_000),
        timedEntry("e/small", 90_000),
        timedEntry("e/down", 280_000),
        untimed,
        timedEntry("e/added", 5_000),
      ],
      [
        timedEntry("e/big", 720_000),
        timedEntry("e/small", 100_000),
        timedEntry("e/down", 240_000),
        untimed,
        timedEntry("e/added", 5_000),
      ],
    ]);
    const panel = await renderComparison(page, comparisonRenderer, rendered);
    await expectCiComparisonEntryRows(panel, [
      ["e/big", "1 test case (no change)", "10 min", "+1 min", "+2 min"],
      ["e/small", "1 test case (no change)", "1 min", "+30 s", "+40 s"],
      ["e/down", "1 test case (no change)", "5 min", "−20 s", "−1 min"],
      [
        "e/untimed",
        "1 test case (no change)",
        "No timings",
        "No timings",
        "No timings",
      ],
      ["e/added", "added → 1 test case", "added", "5 s", "5 s"],
    ]);
    const table = panel.getByRole("table", {
      name: "CI entry timing comparison",
    });
    await renderComparison(page, comparisonRenderer, rendered, {
      sort: {
        column: column === "Branch" ? "branch" : "landed",
        direction: "ascending",
      },
    });
    await expectSortedBy(table, column, "ascending", [
      "e/down",
      "e/small",
      "e/big",
      "e/untimed",
      "e/added",
    ]);
    await renderComparison(page, comparisonRenderer, rendered, {
      sort: {
        column: column === "Branch" ? "branch" : "landed",
        direction: "descending",
      },
    });
    await expectSortedBy(table, column, "descending", [
      "e/big",
      "e/small",
      "e/down",
      "e/untimed",
      "e/added",
    ]);
  });
}
