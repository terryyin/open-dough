import {
  comparisonReading,
  comparisonEntryCell,
} from "../intentCiComparisonPage.ts";
// Relative marks and Show % use actual preference state and rendered geometry.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import {
  relativeEntryFacts,
  timedEntry,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import {
  expectMark,
  relativeFigures,
  expectMarkGeometry,
  showPercent,
  timeMarks,
  percentages,
} from "../support/relativeTimingMarks.ts";
import { rowNames } from "../support/expectSortedColumns.ts";

test("summary and entries share a centred fifty percent scale with faster left and slower right", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const rendered = comparisonRenderFacts(facts, relativeEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  await expect(comparisonEntryCell(panel, "e/slower", "Branch")).toHaveText(
    "+30 s",
  );
  await expectMark(
    comparisonEntryCell(panel, "e/slower", "Branch"),
    "slower",
    0.25,
  );
  await expectMark(
    comparisonEntryCell(panel, "e/slower", "Landed"),
    "slower",
    0.5,
  );
  await expect(comparisonEntryCell(panel, "e/faster", "Landed")).toHaveText(
    "−1 min",
  );
  await expectMark(
    comparisonEntryCell(panel, "e/faster", "Branch"),
    "faster",
    0.5,
  );
  await expectMark(
    comparisonEntryCell(panel, "e/faster", "Landed"),
    "faster",
    1,
  );
  const overall = comparisonReading(panel).overallWallTime;
  await expect(overall).toHaveText("+1 min");
  await expectMark(overall, "slower", 2 / 3);
});

test("measured unchanged time is centred while added and zero-baseline entries have no relative mark", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const rendered = comparisonRenderFacts(facts, relativeEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  await expect(comparisonEntryCell(panel, "e/same", "Landed")).toHaveText(
    "0 s",
  );
  await expectMark(comparisonEntryCell(panel, "e/same", "Landed"), "none", 0);
  for (const [entry, words] of [
    ["e/zero", "+30 s"],
    ["e/added", "30 s"],
  ] as const) {
    const target = comparisonEntryCell(panel, entry, "Landed");
    await expect(target).toHaveText(words);
    await expect(timeMarks(target)).toHaveCount(0);
  }
});

test("Show % displays every comparable percentage without changing sort or geometry", async ({
  page,
  comparisonRenderer,
}) => {
  const prepared = wallComparedFacts();
  const answer = makeMe.aStoryCiComparison
    .with({
      ...prepared.answer,
      landed: {
        ...prepared.answer.landed,
        timeWithoutRunnerWaits: { reason: "No job graph was recorded." },
      },
    })
    .please();
  const facts = { ...prepared, answer };
  const rendered = comparisonRenderFacts(facts, relativeEntryFacts());
  const panel = await renderComparison(page, comparisonRenderer, rendered, {
    sort: { column: "landed", direction: "ascending" },
  });
  const toggle = showPercent(panel);
  await expect(toggle).not.toBeChecked();
  const order = await rowNames(
    comparisonReading(panel).entryTable,
  ).allTextContents();
  const selected = comparisonEntryCell(panel, "e/faster", "Landed")
    .or(comparisonEntryCell(panel, "e/zero", "Landed"))
    .or(comparisonEntryCell(panel, "e/slower", "Branch"));
  const before = await relativeFigures(selected, panel);
  expect(before.figures.map((figure) => figure.identity)).toEqual([
    { row: "e/faster", column: 4, overallWall: false },
    { row: "e/zero", column: 4, overallWall: false },
    { row: "e/slower", column: 3, overallWall: false },
  ]);
  expect(before.figures.map((figure) => figure.marks.length)).toEqual([
    1, 0, 1,
  ]);
  expect(before.percentages).toEqual([]);
  await renderComparison(page, comparisonRenderer, rendered, {
    showPercent: true,
    sort: { column: "landed", direction: "ascending" },
  });
  await expect(toggle).toBeChecked();
  const after = await relativeFigures(selected, panel);
  expect(after.figures.map((figure) => figure.identity)).toEqual(
    before.figures.map((figure) => figure.identity),
  );
  expect(after.figures.map((figure) => figure.marks.length)).toEqual([1, 0, 1]);
  expect(after.figures[2]?.words).toBe("+30 s+13%");
  expect([...after.percentages].sort()).toEqual(
    ["+13%", "−25%", "0%", "+25%", "−50%", "0%", "+33%"].sort(),
  );
  expect(after.figures[1]?.percentages).toEqual([]);
  await expect(rowNames(comparisonReading(panel).entryTable)).toHaveText(order);
  expect(after.figures[0]?.marks[0]).toEqual(before.figures[0]?.marks[0]);
});

test("a one hundred fifty percent outlier widens every mark's shared scale", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = wallComparedFacts();
  const entries = relativeEntryFacts();
  entries[0].push(timedEntry("e/outlier", 60_000));
  entries[1].push(timedEntry("e/outlier", 150_000));
  entries[2].push(timedEntry("e/outlier", 150_000));
  const rendered = comparisonRenderFacts(facts, entries);
  const panel = await renderComparison(page, comparisonRenderer, rendered);
  const selected = comparisonEntryCell(panel, "e/outlier", "Landed")
    .or(comparisonEntryCell(panel, "e/faster", "Landed"))
    .or(comparisonEntryCell(panel, "e/slower", "Landed"))
    .or(comparisonReading(panel).overallWallTime);
  const observed = await relativeFigures(selected);
  expect(observed.figures.map((figure) => figure.identity)).toEqual([
    { row: null, column: null, overallWall: true },
    { row: "e/slower", column: 4, overallWall: false },
    { row: "e/faster", column: 4, overallWall: false },
    { row: "e/outlier", column: 4, overallWall: false },
  ]);
  expect(observed.figures.map((figure) => figure.marks.length)).toEqual([
    1, 1, 1, 1,
  ]);
  expect(observed.figures[3]?.words).toBe("+1 min 30 s");
  for (const [at, direction, reach] of [
    [0, "slower", 1 / 3 / 1.5],
    [1, "slower", 0.25 / 1.5],
    [2, "faster", 0.5 / 1.5],
    [3, "slower", 1],
  ] as const) {
    const geometry = observed.figures[at]?.marks[0];
    expect(geometry).toBeDefined();
    if (geometry !== undefined) expectMarkGeometry(geometry, direction, reach);
  }
  await renderComparison(page, comparisonRenderer, rendered, {
    showPercent: true,
  });
  await expect(
    percentages(comparisonEntryCell(panel, "e/outlier", "Landed")),
  ).toHaveText("+150%");
});
