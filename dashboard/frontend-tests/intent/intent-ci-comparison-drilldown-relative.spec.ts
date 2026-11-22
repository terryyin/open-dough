// One comparison language while drilling: each displayed scope scales only
// its own figures and rows, with one live Show % preference, no source-text
// read for a Summary and no comparison or proof reread.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { markOf, mountCiScope, scopeReadsOf } from "./intent-ci-scope-page.tsx";
import type { Locator } from "vitest/browser";

const landed = ["Baseline compared with Landed"];
const file = "dashboard/tests/folder/nested/c.spec.ts";

// The figure's mark extends slower by REACH of one side.
async function slowerBy(figure: Locator, reach: number) {
  await expect.element(figure).toBeVisible();
  const mark = markOf(figure);
  expect(mark.direction).toBe("slower");
  expect(mark.reach).toBeCloseTo(reach, 1);
}

test("story, location, folder and file share signed words, preference and per-display relative scales without rereading CI", async () => {
  const story = makeMe.aComparedStory.inSummaryScope().please();
  const ci = scopeReadsOf(story);
  const scope = await mountCiScope(story, ci.source);
  await expect.poll(() => scope.story.activeComparison()).toEqual(landed);
  await expect.element(scope.story.showPercent).not.toBeChecked();
  expect(scope.story.percentages()).toEqual([]);
  await expect.poll(() => ci.asked.proofs).toHaveLength(3);
  expect(ci.asked.comparisons).toHaveLength(1);

  const { summary, proof } = scope;
  expect(summary.activeComparison()).toEqual(landed);
  expect(summary.framing()).toEqual([
    "Observed builds; differences are not attributed to the story",
  ]);
  await expect.element(summary.showPercent).not.toBeChecked();
  await expect
    .element(summary.figure("dashboard/tests", "Branch"))
    .toHaveTextContent("+9.5 s");
  await slowerBy(summary.figure("dashboard/tests", "Branch"), 1);
  // Entry scale includes its own +9470/12040 and immediate child +7070/10340.
  await slowerBy(
    summary.cell("dashboard/tests", "folder/", "Branch"),
    7070 / 10340 / (9470 / 12040),
  );
  await summary.showPercent.click();
  await expect
    .element(summary.figure("dashboard/tests", "Branch"))
    .toHaveTextContent("+9.5 s+79%");
  await expect.element(scope.story.showPercent).toBeChecked();

  await summary.open("folder/");
  await slowerBy(
    summary.figure("dashboard/tests/folder", "Branch"),
    7070 / 10340 / 0.7,
  );
  await slowerBy(
    summary.cell("dashboard/tests/folder", "a.spec.ts", "Branch"),
    1,
  );
  await expect.element(summary.showPercent).toBeChecked();
  await summary.open("nested/");
  const nested = "dashboard/tests/folder/nested";
  await expect
    .element(summary.figure(nested, "Branch"))
    .toHaveTextContent("+70 ms+21%");
  await slowerBy(summary.figure(nested, "Branch"), 70 / 340 / 0.5);
  await slowerBy(summary.cell(nested, "c.spec.ts", "Branch"), 70 / 340 / 0.5);
  expect(scope.textReads).toEqual([]); // Summaries do not ask for source text.

  await summary.open("c.spec.ts");
  await expect.poll(() => proof.activeComparison()).toEqual(landed);
  const branch = proof.fileCell(file, "Branch");
  await expect.element(branch).toHaveTextContent("+70 ms+21%");
  await slowerBy(branch, 70 / 340 / 0.5);
  const before = markOf(branch);
  await proof.showPercent.click();
  await expect.element(branch).not.toHaveTextContent("%");
  await expect.element(branch).toHaveTextContent("+70 ms");
  expect(markOf(branch)).toEqual(before);
  await expect.element(scope.story.showPercent).not.toBeChecked();
  await scope.story.showPercent.click();
  await expect.element(proof.showPercent).toBeChecked();
  await expect.element(branch).toHaveTextContent("+70 ms+21%");

  expect(ci.asked.comparisons).toHaveLength(1);
  expect(ci.asked.proofs).toHaveLength(3);
});
