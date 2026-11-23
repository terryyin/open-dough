import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  expectSortedBy,
  openSummary,
  scopeTable,
  sortButton,
} from "./intent-summary-proof-page.ts";

test("Summary header bindings route Change, Baseline, Branch and Counts", async () => {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  const { comparisonReads, proofReads } = await openSummaryComparison(story);
  const entry = "dashboard/tests";
  const summary = await openSummary(entry);
  const table = scopeTable(summary, entry);

  await sortButton(table, "Change").click();
  await expectSortedBy(table, "Change", "ascending", [
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "root.spec.ts",
  ]);
  const baseline = sortButton(table, "Baseline");
  (baseline.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expectSortedBy(table, "Baseline", "ascending", [
    "gone.spec.ts",
    "root.spec.ts",
    "renamed.spec.ts",
    "folder/",
    "added.spec.ts",
  ]);
  await sortButton(table, "Branch").click();
  await expectSortedBy(table, "Branch", "ascending", [
    "root.spec.ts",
    "folder/",
    "added.spec.ts",
    "gone.spec.ts",
    "renamed.spec.ts",
  ]);
  const counts = sortButton(table, "Counts");
  (counts.element() as HTMLElement).focus();
  await userEvent.keyboard(" ");
  await expectSortedBy(table, "Counts", "ascending", [
    "added.spec.ts",
    "renamed.spec.ts",
    "root.spec.ts",
    "folder/",
    "gone.spec.ts",
  ]);
  expect(comparisonReads.map(({ identity }) => identity)).toEqual([
    story.identity,
  ]);
  expect(proofReads.map(({ subject }) => subject.runId)).toEqual([1, 2, 3]);
});
