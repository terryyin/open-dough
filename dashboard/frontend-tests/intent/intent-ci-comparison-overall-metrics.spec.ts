// The overall comparison keeps observed counts, CI wall time and CI time
// without runner waits distinct, including an unavailable execution time.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CiTimeWithoutRunnerWaits } from "../../src/storyCiComparison.ts";
import { mountComparison } from "./intent-ci-comparison-page.ts";

test("overall metrics keep counts, wall time and execution time distinct whether execution time is measured or unavailable", async () => {
  const timed = (wallMs: number, timing: CiTimeWithoutRunnerWaits) => ({
    completedAt: new Date(
      Date.parse("2026-11-09T00:00:00Z") + wallMs,
    ).toISOString(),
    timeWithoutRunnerWaits: timing,
  });
  const story = (landedTiming: CiTimeWithoutRunnerWaits) =>
    makeMe.aComparedStory
      .withBaseline(timed(299_000, { milliseconds: 295_000 }))
      .withBranch(timed(807_000, { milliseconds: 287_000 }))
      .withLanded(timed(319_000, landedTiming))
      .withMixedEntries()
      .please();
  const comparison = await mountComparison(story({ milliseconds: 312_000 }));
  await expect
    .poll(() => comparison.headings())
    .toEqual([
      expect.stringMatching(/^Baseline compared with /),
      "CI entry timing comparison",
    ]);
  expect(comparison.text()).toContain(
    "Observed builds; differences are not attributed to the story",
  );
  expect(comparison.activeComparison()).toEqual([
    "Baseline compared with Landed",
  ]);
  expect(comparison.overallCounts()).toEqual([
    "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
  ]);
  expect(comparison.overallCountsCues()).toMatchObject([
    { count: "more-strong" },
  ]);
  expect(comparison.overallTiming()).toEqual(["+17 s"]);
  expect(comparison.overallTimingCues()).toMatchObject([
    { duration: "none", durationReason: "below threshold" },
  ]);
  expect(comparison.overallWallTime()).toEqual(["+20 s"]);
  expect(comparison.metricNames()).toEqual([
    "Counts",
    "CI time without runner waits",
    "CI wall time",
  ]);
  expect(comparison.wallTimes()).toEqual([
    "4 min 59 s",
    "13 min 27 s",
    "5 min 19 s",
  ]);
  expect(comparison.timesWithoutWaits()).toEqual([
    "4 min 55 s",
    "4 min 47 s",
    "5 min 12 s",
  ]);
  for (const absent of [
    "Entry comparison is not yet shown.",
    "merge resolutions whose story changes cannot be attributed safely",
    "merge resolutions affecting this story's files whose changes cannot be attributed safely",
  ])
    expect(comparison.text()).not.toContain(absent);

  comparison.showsStory(
    story({ reason: "The build's attempt jobs could not be read." }),
  );
  await expect
    .poll(() => comparison.metricNames())
    .toEqual(["Counts", "CI wall time"]);
  expect(comparison.overallTiming()).toEqual([]);
  expect(comparison.overallWallTime()).toEqual(["+20 s"]);
  expect(comparison.overallCounts()).toEqual([
    "2,090 → 2,092 test cases (+2); 5 → 8 test files (+3)",
  ]);
  expect(comparison.wallTimes()).toEqual([
    "4 min 59 s",
    "13 min 27 s",
    "5 min 19 s",
  ]);
  expect(comparison.timesWithoutWaits()).toEqual([
    "4 min 55 s",
    "4 min 47 s",
    "Unavailable. The build's attempt jobs could not be read.",
  ]);
});
