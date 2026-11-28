import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { relativeOf } from "./intent-ci-comparison-page.ts";
import { comparisonIn } from "./intent-ci-scope-page.tsx";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  openComparedFileProof,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import {
  expectSortedBy,
  openSummary,
  press,
  scopeTable,
  shownSortButton,
} from "./intent-summary-proof-page.ts";
import {
  expectNoRelativeTiming,
  expectTimingMark,
  expectTimingWords,
  togglePercent,
} from "./intent-summary-relative-reading.ts";

const entry = "dashboard/tests";
const folder = `${entry}/folder`;
const nested = `${folder}/nested`;

async function openComparison(path = entry) {
  await openSummaryComparison(makeMe.aComparedStory.inSummaryScope().please());
  const summary = await openSummary(entry);
  if (path === folder || path === nested) {
    await openComparedFolder(summary, folder);
  }
  if (path === nested) {
    await openComparedFolder(summary, nested);
  }
  return summary;
}

async function showsRelativeScale(
  path: string,
  [words, percent, reach]: readonly [string, string, number],
  child: string,
  childReach: number,
) {
  const summary = await openComparison(path);
  const comparison = comparisonIn(summary);
  const own = comparison.figure(path, "Branch");
  const childFigure = comparison.cell(path, child, "Branch");
  await expectTimingWords(own, words);
  await expectTimingMark(own, "slower", reach);
  await expectTimingMark(childFigure, "slower", childReach);
  await togglePercent(summary, true);
  await expectTimingWords(own, words + percent);
}

test("Summary dashboard/tests shares its precise relative scale with immediate children", async () => {
  await showsRelativeScale(
    entry,
    ["+9.5 s", "+79%", 1],
    "folder/",
    7070 / 10340 / (9470 / 12040),
  );
});

test("Summary dashboard/tests/folder shares its precise relative scale with immediate children", async () => {
  await showsRelativeScale(
    folder,
    ["+7.1 s", "+68%", 7070 / 10340 / 0.7],
    "a.spec.ts",
    1,
  );
});

test("Summary dashboard/tests/folder/nested shares its precise relative scale with immediate children", async () => {
  await showsRelativeScale(
    nested,
    ["+70 ms", "+21%", 70 / 340 / 0.5],
    "c.spec.ts",
    70 / 340 / 0.5,
  );
});

test("file Proof toggles precise percentages without changing its timing geometry", async () => {
  const summary = await openComparison(nested);
  const proof = await openComparedFileProof(summary, "c.spec.ts");
  const branch = comparisonIn(proof).fileCell(`${nested}/c.spec.ts`, "Branch");
  await togglePercent(proof, true);
  await expectTimingWords(branch, "+70 ms+21%");
  const before = await expectTimingMark(branch, "slower", 70 / 340 / 0.5);
  await togglePercent(proof, false);
  await expectTimingWords(branch, "+70 ms");
  expect(relativeOf(branch.element()).mark).toEqual(before);
});

test("added and unchanged historical file Proofs distinguish absence from a measured zero", async () => {
  const summary = await openComparison();
  const added = await openComparedFileProof(summary, "added.spec.ts");
  await togglePercent(added, true);
  await expectTimingWords(
    comparisonIn(added).fileCell(`${entry}/added.spec.ts`, "Branch"),
    "800 ms",
  );
  expectNoRelativeTiming(added);

  await openSummary(entry);
  const unchanged = await openComparedFileProof(summary, "root.spec.ts");
  await expect.element(comparisonIn(unchanged).showPercent).toBeChecked();
  const zero = comparisonIn(unchanged).fileCell(
    `${entry}/root.spec.ts`,
    "Branch",
  );
  await expectTimingWords(zero, "0 ms0%");
  await expectTimingMark(zero, "none", 0);
});

test("Show % keeps Summary sort and removed files have no relative marks or later-only rows", async () => {
  const summary = await openComparison();
  const table = scopeTable(summary, entry);
  const order = [
    "root.spec.ts",
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ];
  press(await shownSortButton(table, "Landed"));
  await expectSortedBy(table, "Landed", "ascending", order);
  await togglePercent(summary, true);
  await expectSortedBy(table, "Landed", "ascending", order);
  await togglePercent(summary, false);
  await expectSortedBy(table, "Landed", "ascending", order);

  const removed = table.getByRole("row").filter({
    has: page.getByRole("rowheader", { name: "gone.spec.ts", exact: true }),
  });
  await expectTimingWords(removed.getByRole("cell").first(), "removed");
  expectNoRelativeTiming(removed);
  await expect
    .element(
      table.getByRole("rowheader", { name: "later.spec.ts", exact: true }),
    )
    .not.toBeInTheDocument();
});
