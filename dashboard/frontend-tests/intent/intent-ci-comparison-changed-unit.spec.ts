// A location changes its declared unit between Baseline and later builds.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  aSpec,
  dashboardTests,
  entry,
} from "../../test-support/support/ciComparisonUnitsJourney.ts";
import { mountComparison } from "./intent-ci-comparison-page.ts";
import { mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";

const changedUnitStory = () =>
  makeMe.aComparedStory
    .inSummaryScope()
    .withEntries([
      [dashboardTests("file", 1, 35_000)],
      [dashboardTests("case", 7, 42_000)],
      [dashboardTests("case", 5, 40_000)],
    ]);

const parts = "1 of 1 part present";
const entryCounts =
  "2 test files → 9 test cases → 7 test cases (different units)";
const folderCounts =
  "1 test file → 7 test cases → 5 test cases (different units)";
const landedTiming = "40.0 s";

test("when Baseline counts files and later builds count cases, the overall Counts and entry row keep both labelled ends readable and say why there is no difference", async () => {
  const comparison = await mountComparison({
    ...changedUnitStory().please(),
    scope: undefined,
  });
  await expect
    .poll(() => comparison.entryRows())
    .toEqual([[entry, entryCounts, "45 s", "52 s", "50 s"]]);
  expect(comparison.overallCounts()).toEqual([
    "2 test files → 7 test cases (different units)",
  ]);
  expect(comparison.overallCountsCues()).toMatchObject([
    { count: "none", countReason: "no overall count" },
  ]);
});

test("when Baseline counts files and later builds count cases, the location Summary's own figures and child rows keep both labelled ends readable", async () => {
  const summaryFacts = changedUnitStory().please();
  const scope = await mountCiScope(
    summaryFacts,
    scopeReadsOf(summaryFacts).source,
  );
  const children = `CI proof of the immediate folders and files of ${entry}`;
  await expect
    .poll(() => scope.summary.figuresOf(`CI proof of ${entry}`))
    .toEqual([entryCounts, "45.0 s", "52.0 s", "50.0 s", parts]);
  const named = new Set(["folder/", "root.spec.ts"]);
  expect(
    scope.summary.rowsOf(children).filter(([name]) => named.has(name ?? "")),
  ).toEqual([
    ["folder/", "", folderCounts, "35.0 s", "42.0 s", landedTiming],
    [
      "root.spec.ts",
      "",
      "1 test file → 2 test cases (different units)",
      "10.0 s",
      "10.0 s",
      "10.0 s",
    ],
  ]);
});

test("when Baseline counts files and later builds count cases, the changed file's Proof row keeps both labelled ends readable", async () => {
  const fileFacts = changedUnitStory().selecting(aSpec, "file").please();
  const scope = await mountCiScope(fileFacts, scopeReadsOf(fileFacts).source);
  await expect
    .poll(() => scope.proof.rowsOf(`CI proof of ${aSpec}`))
    .toEqual([
      [`${aSpec} modified`, folderCounts, "35.0 s", "42.0 s", landedTiming],
    ]);
});
