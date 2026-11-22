// An endpoint whose timing or discovery is unavailable keeps the exact cause
// beside the figures that were measured, without a fabricated zero.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { mountComparison } from "./intent-ci-comparison-page.ts";

// Independent adapter and history causes that each leave Landed without a
// time without runner waits.
const finalTimingGaps: [string, ...string[]] = [
  "Job “lint” has an ambiguous workflow job match.",
  "The workflow file could not be read at this build's revision.",
  "The CI adapter answered no job graph: it exited with status 2 (unsupported CI adapter operation).",
  "The CI adapter's job “test” needs unknown job “lint”.",
  "The CI adapter gave no job graph: Job history expired!",
];

const landedTimingGap = (reason: string) =>
  makeMe.aComparedStory
    .wallTimed()
    .withLanded({ timeWithoutRunnerWaits: { reason } })
    .withMixedEntries()
    .please();

test("each final timing gap keeps the Landed endpoint, its wall time and the exact cause", async () => {
  const comparison = await mountComparison(landedTimingGap(finalTimingGaps[0]));
  for (const reason of finalTimingGaps) {
    comparison.showsStory(landedTimingGap(reason));
    await expect
      .poll(() => comparison.timesWithoutWaits())
      .toEqual(["2 min", "2 min", `Unavailable. ${reason}`]);
    expect(comparison.wallTimes(), reason).toEqual([
      "3 min",
      "3 min 20 s",
      "4 min",
    ]);
    expect(comparison.identities()[2]?.text, reason).toContain("ccccccc");
    expect(comparison.activeComparison(), reason).toEqual([
      "Baseline compared with Landed",
    ]);
  }
});

const unavailableDiscovery = (reason: string) => {
  const slot = { kind: "unavailable" as const, explanation: reason };
  return makeMe.aComparedStory
    .wallTimed()
    .withAnswer({ baseline: slot, branch: slot, landed: slot })
    .withProofs()
    .please();
};

test("every endpoint retains each unavailable discovery reason", async () => {
  const reasons: [string, ...string[]] = [
    "adapter CI service has no discovery access",
    "The CI adapter did not answer discovery within 2 seconds.",
  ];
  const comparison = await mountComparison(unavailableDiscovery(reasons[0]));
  for (const reason of reasons) {
    comparison.showsStory(unavailableDiscovery(reason));
    await expect
      .poll(() => comparison.identities().map(({ text }) => text))
      .toEqual([reason, reason, reason]);
  }
});
