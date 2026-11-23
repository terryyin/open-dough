// Test cases and test files stay separate units, each with its own time,
// through the real comparison, location tree, Summary and file Proof
// (example 39).
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  aSpec,
  dashboardTests,
  entry,
  folder,
} from "../../test-support/support/ciComparisonUnitsJourney.ts";
import { cueOf, mountComparison } from "./intent-ci-comparison-page.ts";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

// Five/six/seven test cases and one test file.
const unitsStory = () =>
  makeMe.aComparedStory
    .inSummaryScope()
    .withEntries([
      [dashboardTests("case", 3, 30_000, 7_000)],
      [dashboardTests("case", 4, 35_000, 8_000)],
      [dashboardTests("case", 5, 40_000, 7_000)],
    ])
    .please();

const parts = "1 of 1 part present";
const cases = "3 → 4 test cases (+1) → 5 test cases (+2)";
const files = "1 test file (no change)";
const modified = "Modified dashboard/tests/folder/a.spec.ts";

test("with case and file units, the overall Counts and each unit's own entry row keep the units separate with their own times (example 39)", async () => {
  const comparison = await mountComparison({
    ...unitsStory(),
    scope: undefined,
  });
  await expect
    .poll(() => comparison.entryRows())
    .toEqual([
      [
        entry,
        "5 → 6 test cases (+1) → 7 test cases (+2)",
        "40 s",
        "+5 s",
        "+10 s",
      ],
      [entry, files, "7 s", "+1 s", "0 s"],
    ]);
  expect(comparison.overallCounts()).toEqual([
    "5 → 7 test cases (+2); 1 test file (no change)",
  ]);
  expect(comparison.overallCountsCues()).toMatchObject([
    { count: "more-light" },
  ]);
});

test("with case and file units, the location tree, location and folder Summary and file Proof keep the units separate with their own times (example 39)", async () => {
  const story = unitsStory();
  const scope = await mountCiScope(story, scopeReadsOf(story).source);
  const tree = page.getByRole("navigation", { name: "Intent files" });
  await expect
    .element(tree.getByRole("button", { name: new RegExp(`^${entry}, `) }))
    .toHaveAccessibleName(
      `${entry}, typescript, **/*.spec.ts, 5 → 6 test cases (+1) → 7 test cases (+2), +10.0 s; ${files}, 0 ms`,
    );
  await tree.getByRole("button", { name: "Expand folder" }).click();
  const file = tree.getByRole("button", { name: new RegExp(`^${modified}, `) });
  await expect
    .element(file)
    .toHaveAccessibleName(`${modified}, ${cases}, +10.0 s; ${files}, 0 ms`);
  expect(cueOf(file.element())).toMatchObject({
    count: "more-strong",
    duration: "slower-light",
  });

  const { summary } = scope;
  await expect
    .poll(() => summary.figuresOf(`CI proof of ${entry}: test cases`))
    .toEqual([
      "5 → 6 test cases (+1) → 7 test cases (+2)",
      "40.0 s",
      "+5.0 s",
      "+10.0 s",
      parts,
    ]);
  expect(summary.figuresOf(`CI proof of ${entry}: test files`)).toEqual([
    files,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  const unitRows = (path: string, named: readonly string[]) =>
    summary
      .rowsOf(`CI proof of the immediate folders and files of ${path}`)
      .filter(([name]) => named.includes(name ?? ""));
  expect(unitRows(entry, ["folder/", "root.spec.ts"])).toEqual([
    ["folder/", "", cases, "30.0 s", "+5.0 s", "+10.0 s"],
    ["folder/", "", files, "7.0 s", "+1.0 s", "0 ms"],
    ["root.spec.ts", "", "2 test cases (no change)", "10.0 s", "0 ms", "0 ms"],
  ]);

  await summary.open("folder/");
  await expect
    .poll(() => summary.figuresOf(`CI proof of ${folder}: test cases`))
    .toEqual([cases, "30.0 s", "+5.0 s", "+10.0 s", parts]);
  expect(summary.figuresOf(`CI proof of ${folder}: test files`)).toEqual([
    files,
    "7.0 s",
    "+1.0 s",
    "0 ms",
    parts,
  ]);
  expect(unitRows(folder, ["a.spec.ts"])).toEqual([
    ["a.spec.ts", "modified", cases, "30.0 s", "+5.0 s", "+10.0 s"],
    ["a.spec.ts", "modified", files, "7.0 s", "+1.0 s", "0 ms"],
  ]);

  await summary.open("a.spec.ts");
  await expect
    .poll(() => scope.proof.rowsOf(`CI proof of ${aSpec}`))
    .toEqual([
      [`${aSpec} modified`, cases, "30.0 s", "+5.0 s", "+10.0 s"],
      [`${aSpec} modified`, files, "7.0 s", "+1.0 s", "0 ms"],
    ]);
});
