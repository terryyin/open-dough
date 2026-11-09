// Relative marks and Show % use actual preference state and rendered geometry.
import type { Locator } from "@playwright/test";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import { serveComparison } from "../support/comparisonScopeFacts.ts";
import {
  relativeEntryFacts,
  timedEntry,
  wallComparedFacts,
} from "../support/mountedComparisonFacts.ts";
import {
  expectMark,
  markGeometry,
  percentages,
  showPercent,
} from "../support/relativeTimingMarks.ts";
import { rowNames, sortButton } from "../support/expectSortedColumns.ts";

const tableOf = (panel: Locator) =>
  panel.getByRole("table", { name: "CI entry timing comparison" });
const cell = (panel: Locator, entry: string, column: "Branch" | "Landed") =>
  tableOf(panel)
    .locator("tbody tr")
    .filter({
      has: panel.page().getByRole("rowheader", { name: entry, exact: true }),
    })
    .getByRole("cell")
    .nth(column === "Branch" ? 2 : 3);

test("summary and entries share a centred fifty percent scale with faster left and slower right", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  serveComparison(comparisonServices, facts, relativeEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(cell(panel, "e/slower", "Branch")).toHaveText("+30 s");
  await expectMark(cell(panel, "e/slower", "Branch"), "slower", 0.25);
  await expectMark(cell(panel, "e/slower", "Landed"), "slower", 0.5);
  await expect(cell(panel, "e/faster", "Landed")).toHaveText("−1 min");
  await expectMark(cell(panel, "e/faster", "Branch"), "faster", 0.5);
  await expectMark(cell(panel, "e/faster", "Landed"), "faster", 1);
  const overall = panel.locator(".intent-ci-comparison-overall-wall");
  await expect(overall).toHaveText("+1 min");
  await expectMark(overall, "slower", 2 / 3);
});

test("measured unchanged time is centred while added and zero-baseline entries have no relative mark", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  serveComparison(comparisonServices, facts, relativeEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(cell(panel, "e/same", "Landed")).toHaveText("0 s");
  await expectMark(cell(panel, "e/same", "Landed"), "none", 0);
  for (const [entry, words] of [
    ["e/zero", "+30 s"],
    ["e/added", "30 s"],
  ] as const) {
    const target = cell(panel, entry, "Landed");
    await expect(target).toHaveText(words);
    await expect(target.locator(".intent-ci-time-mark")).toHaveCount(0);
  }
});

test("keyboard Show % reveals every comparable percentage without changing sort or geometry", async ({
  page,
  comparisonServer,
  comparisonServices,
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
  serveComparison(comparisonServices, facts, relativeEntryFacts());
  const panel = await mountComparison(page, comparisonServer, facts);
  const toggle = showPercent(panel);
  await expect(toggle).not.toBeChecked();
  await expect(percentages(panel)).toHaveCount(0);
  await sortButton(tableOf(panel), "Landed").click();
  const order = await rowNames(tableOf(panel)).allTextContents();
  const before = await markGeometry(cell(panel, "e/faster", "Landed"));
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await expect(cell(panel, "e/slower", "Branch")).toHaveText("+30 s+13%");
  expect((await percentages(panel).allTextContents()).sort()).toEqual(
    ["+13%", "−25%", "0%", "+25%", "−50%", "0%", "+33%"].sort(),
  );
  await expect(
    cell(panel, "e/zero", "Landed").locator(".intent-ci-time-percent"),
  ).toHaveCount(0);
  await expect(rowNames(tableOf(panel))).toHaveText(order);
  expect(await markGeometry(cell(panel, "e/faster", "Landed"))).toEqual(before);
});

test("a one hundred fifty percent outlier widens every mark's shared scale", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = wallComparedFacts();
  const entries = relativeEntryFacts();
  entries[0].push(timedEntry("e/outlier", 60_000));
  entries[1].push(timedEntry("e/outlier", 150_000));
  entries[2].push(timedEntry("e/outlier", 150_000));
  serveComparison(comparisonServices, facts, entries);
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(cell(panel, "e/outlier", "Landed")).toHaveText("+1 min 30 s");
  await expectMark(cell(panel, "e/outlier", "Landed"), "slower", 1);
  await expectMark(cell(panel, "e/faster", "Landed"), "faster", 0.5 / 1.5);
  await expectMark(cell(panel, "e/slower", "Landed"), "slower", 0.25 / 1.5);
  await expectMark(
    panel.locator(".intent-ci-comparison-overall-wall"),
    "slower",
    1 / 3 / 1.5,
  );
  await showPercent(panel).check();
  await expect(
    cell(panel, "e/outlier", "Landed").locator(".intent-ci-time-percent"),
  ).toHaveText("+150%");
});
