// A selected entry's or folder's Summary from one CI proof shows the scope's
// own figures as a labelled group above a table of its immediate folders and
// files, and sorts that table by its columns (../../src/IntentScopeProof.tsx,
// ../../src/IntentScopeFigures.tsx, ../../src/CiProofTable.tsx): the tree's
// order until a header is activated, the row for what no child row shows kept
// last under any sort, the group unmoved, and the sort kept in memory while
// drilling down and across Development and back, never on the URL or in
// storage (SEED-259#scan-intent-ci-summaries key example 2).

import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountAttemptSummary } from "./intent-attempt-summary-fixture.ts";
import {
  childName,
  expectOwnScopeFigures,
  expectScopeRows,
  expectSortedBy,
  expectUnsortedRows,
  figuresAboveTable,
  openSummary,
  scopeTable,
  showsSummaryPath,
  sortButton,
} from "./intent-summary-proof-page.ts";

const outside = "Not in the rows above";
const one = "1 of 1 part present";

// `dashboard/tests` holds `folder/` (13 tests, 6 of them in a file the tree
// does not list), `added.spec.ts` (no CI result), `root.spec.ts` (14 tests,
// 1 failed) and 3 tests in a file the tree does not list.
const entry = makeMe.aCiProofEntry
  .at("dashboard/tests")
  .holding(
    makeMe.aCiProofEvidence
      .inUnit("case")
      .withFile("dashboard/tests/folder/a.spec.ts", {
        passed: 1,
        durationMs: 300,
      })
      .withFile("dashboard/tests/folder/b.spec.ts", {
        passed: 4,
        durationMs: 400,
      })
      .withFile("dashboard/tests/folder/nested/c.spec.ts", {
        passed: 2,
        durationMs: 100,
      })
      .withFile("dashboard/tests/folder/old.spec.ts", {
        passed: 6,
        durationMs: 60,
      })
      .withFile("dashboard/tests/root.spec.ts", {
        passed: 13,
        failed: 1,
        durationMs: 280,
      })
      .withFile("dashboard/tests/gone.spec.ts", { passed: 3, durationMs: 30 })
      .please(),
  )
  .please();
test("a folder's Summary shows its own figures above its children and keeps a Counts sort, outside row last, while drilling down and across Development", async () => {
  await mountAttemptSummary([entry]);
  const summary = await openSummary("dashboard/tests");
  const startUrl = window.location.href;
  const entryFigures = [
    "dashboard/tests",
    "29 passed and 1 failed test cases",
    "1.2 s",
    one,
  ] as const;

  await expectScopeRows(summary, [
    entryFigures,
    ["folder/", "13 passed test cases", "860 ms"],
    ["added.spec.ts", "no CI result", "no CI result"],
    ["root.spec.ts", "13 passed and 1 failed test cases", "280 ms"],
    [outside, "3 passed test cases", "30 ms"],
  ]);
  const table = scopeTable(summary, "dashboard/tests");
  await expectUnsortedRows(table, [
    "folder/",
    "added.spec.ts",
    "root.spec.ts",
    outside,
  ]);
  expect(figuresAboveTable(summary, "dashboard/tests")).toBe(true);

  const counts = sortButton(table, "Counts");
  await userEvent.click(counts);
  await expectSortedBy(table, "Counts", "ascending", [
    "folder/",
    "root.spec.ts",
    "added.spec.ts",
    outside,
  ]);
  (counts.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expectSortedBy(table, "Counts", "descending", [
    "root.spec.ts",
    "folder/",
    "added.spec.ts",
    outside,
  ]);
  await expectOwnScopeFigures(
    summary,
    "dashboard/tests",
    entryFigures.slice(1),
  );
  expect(figuresAboveTable(summary, "dashboard/tests")).toBe(true);

  const folderPath = "dashboard/tests/folder";
  const folderSorted = async () => {
    await showsSummaryPath(summary, folderPath);
    await expectSortedBy(
      scopeTable(summary, folderPath),
      "Counts",
      "descending",
      ["b.spec.ts", "nested/", "a.spec.ts", outside],
    );
    await expectOwnScopeFigures(summary, folderPath, [
      "13 passed test cases",
      "860 ms",
      one,
    ]);
    expect(figuresAboveTable(summary, folderPath)).toBe(true);
  };
  await userEvent.click(childName(summary, "folder/"));
  await folderSorted();

  await userEvent.click(
    page.getByRole("radio", { name: "Development", exact: true }),
  );
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  await expect
    .poll(() => intent.query()?.checkVisibility() ?? false)
    .toBe(false);
  await userEvent.click(
    page.getByRole("radio", { name: "Intent", exact: true }),
  );
  await folderSorted();

  expect(window.location.href).toBe(startUrl);
  expect(
    JSON.stringify([
      Object.entries(localStorage),
      Object.entries(sessionStorage),
    ]),
  ).not.toMatch(/descending|ascending|summaryCiSort/);
});
