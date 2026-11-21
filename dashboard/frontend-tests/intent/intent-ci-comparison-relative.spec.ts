// Relative timing changes in a selected story's CI comparison
// (../../src/IntentCiTimeChange.tsx, ../../src/storyCiRelativeChange.ts),
// mounted in the production evidence owner under the real Show % preference
// (../../src/IntentCiComparisonPreference.tsx): each comparable change shows
// its signed words beside a mark whose zero sits at its centre, faster
// extending left and slower right on one scale shared by the summary and the
// entry cells, reaching one side at a 50% change and widening for a larger
// one. The choice survives a Project Intent visit; sharing it across the
// story's views is intent-ci-comparison-drilldown-relative.spec.ts's.
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { createElement } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { relativeOf, shownComparison } from "./intent-ci-comparison-page.ts";
import { ciReadsOf, StoryCiEvidence } from "./intent-ci-evidence-page.tsx";
import { IntentCiStatus } from "../../src/IntentCiStatus.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import type { ComparedStoryBuilder } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";

const Branch = 3;
const Landed = 4;

// Baseline → Branch → Landed: slower 4 min → 4 min 30 s (+13%) → 5 min
// (+25%); faster 2 min → 1 min 30 s (−25%) → 1 min (−50%); same 45 s
// throughout; zero 0 s → 30 s twice; added only after Baseline. CI wall time
// 3 min → 3 min 20 s → 4 min.
const relativeTimes: Record<string, readonly (number | undefined)[]> = {
  "e/slower": [240_000, 270_000, 300_000],
  "e/faster": [120_000, 90_000, 60_000],
  "e/same": [45_000, 45_000, 45_000],
  "e/zero": [0, 30_000, 30_000],
  "e/added": [undefined, 30_000, 30_000],
};

const relativelyTimed = (times = relativeTimes) =>
  makeMe.aComparedStory.wallTimed().withEntries(
    [0, 1, 2].map((at) =>
      Object.entries(times).flatMap(([path, ms]) => {
        const time = ms[at];
        if (time === undefined) return [];
        return [makeMe.aCiProofEntry.at(path).counting(1).timed(time).please()];
      }),
    ),
  );

// The evidence owner shows STORY, whose entries hold TIMES, reading its
// comparison and each endpoint's entries; the reader can then visit Project
// Intent in the same reading place and return to the story's CI comparison.
async function mountRelative(
  times = relativeTimes,
  arranged: ComparedStoryBuilder = relativelyTimed(times),
) {
  const story = arranged.please();
  const reads = ciReadsOf(story);
  reads.answers.comparison = () => story.answer;
  reads.answers.proof = (subject) =>
    story.entryProof(subject.runId as number).proof;
  const storyView = (visitingProject = false) =>
    createElement(StoryCiEvidence, {
      story,
      reads: reads.source,
      visitingProject,
      children: createElement(IntentCiStatus),
    });
  const mounted = await mountComponent(storyView());
  const comparison = await shownComparison();
  await expect
    .poll(() => comparison.entryRows().map(([name]) => name))
    .toEqual(Object.keys(times));
  return {
    ...comparison,
    async visitsProjectIntentAndReturns() {
      mounted.rerender(storyView(true));
      await expect.element(comparison.region).not.toBeInTheDocument();
      mounted.rerender(storyView());
      return shownComparison();
    },
  };
}

// The figure draws a centred mark extending in DIRECTION by REACH of one side.
function expectMark(
  figure: ReturnType<typeof relativeOf>,
  direction: string,
  reach: number,
) {
  expect(figure.mark?.direction).toBe(direction);
  expect(Math.abs(figure.mark?.zeroOffset ?? 99)).toBeLessThanOrEqual(1);
  expect(Math.abs(figure.mark?.barStartOffset ?? 99)).toBeLessThanOrEqual(1);
  expect(figure.mark?.reach).toBeCloseTo(reach, 1);
}

test("a one hundred fifty percent outlier widens the shared centred scale while an unchanged time stays at zero and an added entry or zero baseline draws no mark", async () => {
  const { relative, overallRelative } = await mountRelative({
    ...relativeTimes,
    "e/outlier": [60_000, 150_000, 150_000],
  });
  expect(relative("e/outlier", Landed).words).toBe("+1 min 30 s");
  expectMark(relative("e/outlier", Landed), "slower", 1);
  expectMark(relative("e/slower", Landed), "slower", 0.25 / 1.5);
  expectMark(relative("e/faster", Landed), "faster", 0.5 / 1.5);
  expectMark(overallRelative(), "slower", 1 / 3 / 1.5);
  expect(relative("e/same", Landed).words).toBe("0 s");
  expectMark(relative("e/same", Landed), "none", 0);
  expect(relative("e/zero", Landed)).toMatchObject({
    words: "+30 s",
    mark: null,
  });
  expect(relative("e/added", Landed)).toMatchObject({
    words: "30 s",
    mark: null,
  });
});

test("Show % starts off and by keyboard reveals every comparable percentage on the fifty percent scale without moving a mark or reordering sorted rows", async () => {
  const comparison = await mountRelative();
  const { relative, overallRelative, entryTable, showPercent } = comparison;
  expect(relative("e/slower", Branch).words).toBe("+30 s");
  expectMark(relative("e/slower", Branch), "slower", 0.25);
  expectMark(relative("e/slower", Landed), "slower", 0.5);
  expect(relative("e/faster", Landed).words).toBe("−1 min");
  expectMark(relative("e/faster", Branch), "faster", 0.5);
  expectMark(relative("e/faster", Landed), "faster", 1);
  expect(overallRelative().words).toBe("+1 min");
  expectMark(overallRelative(), "slower", 2 / 3);
  await expect.element(showPercent).not.toBeChecked();
  expect(comparison.percentages()).toEqual([]);
  await entryTable.getByRole("button", { name: "Landed", exact: true }).click();
  const order = () => comparison.entryRows().map(([name]) => name);
  await expect
    .element(entryTable.getByRole("columnheader", { name: "Landed" }))
    .toHaveAttribute("aria-sort", "ascending");
  const marks = () =>
    ["e/slower", "e/faster", "e/same"].flatMap((row) =>
      [Branch, Landed].map((column) => relative(row, column).mark),
    );
  const before = { order: order(), marks: marks() };

  (showPercent.element() as HTMLElement).focus();
  await userEvent.keyboard(" ");
  await expect.element(showPercent).toBeChecked();
  await expect.poll(() => relative("e/slower", Branch).words).toBe("+30 s+13%");
  expect([...comparison.percentages()].sort()).toEqual(
    ["+13%", "−25%", "0%", "+25%", "−50%", "0%", "+33%", "0%"].sort(),
  );
  expect(relative("e/zero", Landed).percentages).toEqual([]);
  expect(relative("e/added", Landed).percentages).toEqual([]);
  expect({ order: order(), marks: marks() }).toEqual(before);
});

test("Show % stays on after a Project Intent visit", async () => {
  const shown = await mountRelative();
  await shown.showPercent.click();
  await expect.element(shown.showPercent).toBeChecked();
  const back = await shown.visitsProjectIntentAndReturns();
  await expect.element(back.showPercent).toBeChecked();
  await expect
    .poll(() => back.relative("e/slower", Branch).words)
    .toBe("+30 s+13%");
});

test("a Landed time without runner waits that is unavailable shows neither mark nor percentage", async () => {
  const shown = await mountRelative(
    relativeTimes,
    relativelyTimed().withLanded({
      timeWithoutRunnerWaits: { reason: "No job graph was recorded." },
    }),
  );
  await shown.showPercent.click();
  await expect
    .poll(() => shown.relative("e/slower", Branch).words)
    .toBe("+30 s+13%");
  expect(shown.timesWithoutWaitsRelative().at(-1)).toMatchObject({
    mark: null,
    percentages: [],
  });
});
