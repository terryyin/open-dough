// Sorting CI status Proof by its columns (../../src/CiProofTable.tsx,
// ../../src/ciProofSort.ts): declaration order until a header is activated;
// Test execution time sorts by measured time with the partial row last in
// either direction; Counts sorts by counted results with failed results first
// among equal totals; multi-unit locations move as whole rows, comparing each
// unit in case/file/legacy order without summing types; each header is a
// button reached by Tab and activated by click, Enter or Space, its column
// header carrying aria-sort and a direction arrow; no totals row
// (SEED-259#scan-intent-ci-summaries key example 1). The comparator's cases
// live in ../../../Distribution/tests/support/intent-ci-proof-sort.test.mjs.

import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountJudgedRunProof } from "./intent-ci-status-fixtures.ts";
import { intentCiProof } from "./intent-ci-status-page.ts";

// tests/a 12.5 s with 4 tests; tests/b 340 ms with 3 tests, 1 failed;
// tests/c Part 2 untimed with 3 tests.
const exampleEntries = () => [
  makeMe.aCiProofEntry.at("tests/a").counting(4, "case").timed(12_500).please(),
  makeMe.aCiProofEntry
    .at("tests/b")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .counting(2, 1, 0)
        .timed(340)
        .inParts(1)
        .please(),
    )
    .please(),
  makeMe.aCiProofEntry
    .at("tests/c")
    .holding(
      makeMe.aCiProofEvidence
        .inUnit("case")
        .counting(2, 0, 0)
        .timed(1_000)
        .inParts(2)
        .withPresentPart(2, { passed: 1, failed: 0, other: 0, untimed: 0 })
        .please(),
    )
    .please(),
];

// Mixed-unit locations: whole-row sort compares case figures first, then file.
const groupedEntries = () => [
  makeMe.aCiProofEntry
    .at("grouped/slow")
    .holding(
      makeMe.aCiProofEvidence.inUnit("case").counting(10).timed(5_000).please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(2).timed(900).please(),
    )
    .please(),
  makeMe.aCiProofEntry
    .at("grouped/fast")
    .holding(
      makeMe.aCiProofEvidence.inUnit("case").counting(10).timed(500).please(),
      makeMe.aCiProofEvidence.inUnit("file").counting(4).timed(2_000).please(),
    )
    .please(),
  makeMe.aCiProofEntry
    .at("grouped/gap")
    .holding(
      makeMe.aCiProofEvidence.inUnit("case").counting(3).timed(800).please(),
      makeMe.aCiProofEvidence
        .inUnit("file")
        .inParts(2, { missing: [2] })
        .withPresentPart(1, {
          passed: 1,
          failed: 0,
          other: 0,
          durationMs: 100,
        })
        .please(),
    )
    .please(),
];

test("Proof sorts by Test execution time and Counts by click, Enter and Space, unmeasured last", async () => {
  await mountJudgedRunProof(exampleEntries());
  const proof = intentCiProof();
  // Declaration order, no header sorted, and no totals row.
  await proof.showsUnsorted(["tests/a", "tests/b", "tests/c"]);
  expect(
    proof.executionCells().map((cell) => cell.element().textContent.trim()),
  ).toEqual(["12.5 s", "340 ms", "Part 2 untimed"]);
  expect(proof.table.getByRole("row").elements()).toHaveLength(4);

  const time = proof.sortButton("Test execution time");
  await userEvent.click(time);
  await proof.showsSortedBy("Test execution time", "ascending", [
    "tests/b",
    "tests/a",
    "tests/c",
  ]);
  await userEvent.click(time);
  // The partial row stays last.
  await proof.showsSortedBy("Test execution time", "descending", [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);

  // Tab reaches the next header from the one before it; Enter and Space
  // activate it.
  (proof.sortButton("Entry").element() as HTMLElement).focus();
  await userEvent.tab();
  const countsButton = proof.sortButton("Counts");
  await expect.element(countsButton).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  // 3 with 1 failed before 3 passed, then 4.
  await proof.showsSortedBy("Counts", "ascending", [
    "tests/b",
    "tests/c",
    "tests/a",
  ]);
  await userEvent.keyboard("{Space}");
  // Failed first among equal totals in either direction.
  await proof.showsSortedBy("Counts", "descending", [
    "tests/a",
    "tests/b",
    "tests/c",
  ]);
  expect(proof.table.getByRole("row").elements()).toHaveLength(4);
});

test("a multi-unit location sorts as one row by each unit's figures without summing types", async () => {
  await mountJudgedRunProof(groupedEntries(), { state: "failed" });
  const proof = intentCiProof();
  await proof.showsUnsorted(["grouped/slow", "grouped/fast", "grouped/gap"]);
  expect(proof.table.getByRole("row").elements()).toHaveLength(4);

  const time = proof.sortButton("Test execution time");
  (proof.sortButton("Entry").element() as HTMLElement).focus();
  await userEvent.tab();
  await userEvent.tab();
  await expect.element(time).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  // Case times 500, 800, 5000; gap's file line stays with its row.
  await proof.showsSortedBy("Test execution time", "ascending", [
    "grouped/fast",
    "grouped/gap",
    "grouped/slow",
  ]);
  const gapRow = proof.table.element().querySelectorAll("tbody tr")[1];
  const gapLine = [
    ...(gapRow?.querySelectorAll(".intent-ci-proof-unit-line") ?? []),
  ].find((node) => node.textContent.includes("Part 2 missing"));
  expect(gapLine?.getAttribute("aria-label")).toBe(
    "test files: Part 2 missing",
  );

  await userEvent.keyboard("{Space}");
  await proof.showsSortedBy("Test execution time", "descending", [
    "grouped/slow",
    "grouped/gap",
    "grouped/fast",
  ]);

  await userEvent.click(proof.sortButton("Counts"));
  // Case totals 3, then 10/10; file breaks the 10-tie (2 before 4).
  await proof.showsSortedBy("Counts", "ascending", [
    "grouped/gap",
    "grouped/slow",
    "grouped/fast",
  ]);
});
