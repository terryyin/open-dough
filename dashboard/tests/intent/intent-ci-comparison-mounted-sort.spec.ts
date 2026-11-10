// Actual sortable headers over canonical endpoint proof, without acquisition setup.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import {
  mixedEntryFacts,
  timedEntry,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import { expectRenderedSortedBy } from "../support/expectSortedColumns.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";

test("Baseline sorts measured durations both ways and keeps gaps last", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const rendered = comparisonRenderFacts(facts, mixedEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "baseline", direction: "ascending" },
  });
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expectRenderedSortedBy(table, "Baseline", "ascending", [
    "tests",
    "dashboard/tests",
    "src/skills",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "baseline", direction: "descending" },
  });
  await expectRenderedSortedBy(table, "Baseline", "descending", [
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
});

test("Counts sorts counted-result totals in both directions", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const rendered = comparisonRenderFacts(facts, mixedEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "counts", direction: "ascending" },
  });
  const table = panel.getByRole("table", {
    name: "CI entry timing comparison",
  });
  await expectRenderedSortedBy(table, "Counts", "ascending", [
    "src/skills",
    "tests",
    "dashboard/tests",
  ]);
  await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "counts", direction: "descending" },
  });
  await expectRenderedSortedBy(table, "Counts", "descending", [
    "dashboard/tests",
    "tests",
    "src/skills",
  ]);
});

// Fresh canonical endpoint entries; the signed quantities stay explicit in each case.
function signedEntries(
  endpoints: readonly (readonly [number, number, number, number?])[],
) {
  const untimed = makeMe.aCiProofEntry.at("e/untimed").please();
  return endpoints.map(([big, small, down, added]) => [
    timedEntry("e/big", big),
    timedEntry("e/small", small),
    timedEntry("e/down", down),
    untimed,
    ...(added === undefined ? [] : [timedEntry("e/added", added)]),
  ]);
}

test("signed entry figures keep their precise words and authored initial order", async ({
  page,
  comparisonRenderer,
}) => {
  const rendered = comparisonRenderFacts(
    wallComparedFacts(),
    signedEntries([
      [600_000, 60_000, 300_000],
      [660_000, 90_000, 280_000, 5_000],
      [720_000, 100_000, 240_000, 5_000],
    ]),
  );
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
});

for (const column of ["Branch", "Landed"] as const) {
  test(`${column} sorts signed changes rather than duration or percentage and keeps gaps last both ways`, async ({
    page,
    comparisonRenderer,
  }) => {
    const rendered = comparisonRenderFacts(
      wallComparedFacts(),
      signedEntries([
        [600_000, 60_000, 300_000],
        [660_000, 90_000, 280_000, 5_000],
        [720_000, 100_000, 240_000, 5_000],
      ]),
    );
    const panel = await renderComparison(page, comparisonRenderer, rendered, {
      sort: {
        column: column === "Branch" ? "branch" : "landed",
        direction: "ascending",
      },
    });
    const table = panel.getByRole("table", {
      name: "CI entry timing comparison",
    });
    await expectRenderedSortedBy(table, column, "ascending", [
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
    await expectRenderedSortedBy(table, column, "descending", [
      "e/big",
      "e/small",
      "e/down",
      "e/untimed",
      "e/added",
    ]);
  });
}
