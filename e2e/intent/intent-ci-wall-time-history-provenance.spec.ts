// Project Intent's CI wall time history in CI status
// (../../dashboard/src/IntentCiHistory.tsx) for landings the CI timing comparison's
// Landed rule measures by their own build or a confirmed skip's equivalent
// build, or not at all, on a real bare origin (../../dashboard/tests/support/startOrigin.ts)
// whose dashboard collects the landings its launch records name, checking
// them at a test's pace: an execution's exact build and the two
// planning-only refinements that reuse it are one point naming all three,
// counted once; a refinement reusing a trunk build no landing measured is a
// reused point with that build's identity; one whose equivalent build has
// its timing but published no CI proof summary is that build's reused-
// equivalent point with the same wall time
// (SEED-285#see-landed-ci-wall-time-history examples 4 and 5;
// SEED-288#reuse-adapter-equivalent-timing). Each point's CI wall time is
// the CI timing comparison's (`wallTimeMs`). Trunk builds no landing
// resolves to are not shown, nor any average, difference, excluded mark,
// slowdown or story's place. A phone reader reaches each item and link by
// keyboard and tells points from gaps by their words. A cancelled landing's
// later trunk build and a failed build are in
// ./intent-ci-wall-time-history-later.spec.ts; the single exact point and
// the empty history in ../../dashboard/tests/intent/intent-ci-wall-time-history.spec.ts; the window in
// ../../dashboard/tests/intent/intent-ci-wall-time-history-window.spec.ts.

import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import {
  wallTimeMs,
  wholeSecondWords,
} from "../../dashboard/src/ciProofTimeWords.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  chartOf,
  chooseProjectCiStatus,
  evidenceByKeyboard,
  historyOf,
  expectLinksByKeyboard,
  publishTrunk,
  runLink,
} from "../../dashboard/tests/intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../../dashboard/tests/pageLayout.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  landedCiHistory,
  recheckingLandedCi,
  storyLandingRecord,
  untilKept,
} from "../../dashboard/tests/support/landedCiHistory.ts";
import type { CiRunAnswer } from "../../dashboard/tests/support/baseCiActions.ts";
import {
  landedTrunk,
  passedBetween,
  trunkRun,
  usableProofOf,
} from "../../dashboard/tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";

test.use({ extraEnv: recheckingLandedCi });

// A run's CI wall time as the CI timing comparison words a build's: its
// attempt's wall time (`wallTimeMs`) in whole seconds.
function comparisonWallTimeWords(run: CiRunAnswer): string {
  const ms = wallTimeMs(run.startedAt, run.completedAt);
  if (ms === undefined) throw new Error("The run names no CI wall time.");
  return wholeSecondWords(ms);
}

test("an execution's exact build and the refinements reusing it are one point naming all three, a refinement reusing a build no landing measured is a reused point with that build's identity, and one whose equivalent build published no CI proof is that build's reused-equivalent point, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  // Trunk's CI workflow is built, but no landing rests on it. E's execution
  // builds a1; refinements R1 and R2 change planning only. c3 is built, but
  // no recorded landing names it; R3 changes planning only. x is built
  // without CI proof; R4 changes planning only and reuses x's timing.
  const { revision, landing, landings } = landedTrunk(
    origin,
    [
      { title: "ci", kind: "ci-workflow" },
      { title: "e", kind: "code" },
      { title: "r1", kind: "planning" },
      { title: "r2", kind: "planning" },
      { title: "c3", kind: "code" },
      { title: "r3", kind: "planning" },
      { title: "x", kind: "code" },
      { title: "r4", kind: "planning" },
    ],
    ["e", "r1", "r2", "r3", "r4"],
  );
  const e = landing("e");
  const r1 = landing("r1");
  const r2 = landing("r2");
  const r3 = landing("r3");
  const r4 = landing("r4");
  const ci = revision("ci");
  const c3 = revision("c3");
  const x = revision("x");
  const a1Run = trunkRun(
    e.revision,
    41,
    passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
  );
  const c3Run = trunkRun(
    c3,
    43,
    passedBetween("2026-11-05T12:00:00Z", "2026-11-05T12:05:00Z"),
  );
  const xRun = trunkRun(
    x,
    47,
    passedBetween("2026-11-05T13:00:00Z", "2026-11-05T13:04:00Z"),
  );
  // a1's and c3's builds published their CI proof; x's did not.
  await publishTrunk(
    page,
    origin,
    () => [
      trunkRun(
        ci,
        39,
        passedBetween("2026-11-05T09:00:00Z", "2026-11-05T09:03:00Z"),
      ),
      a1Run,
      c3Run,
      xRun,
    ],
    () => ({ 41: usableProofOf(a1Run), 43: usableProofOf(c3Run) }),
  );
  keepLaunchRecords(dashboard.home, [
    storyLandingRecord(e, "execution"),
    storyLandingRecord(r1, "refinement"),
    storyLandingRecord(r2, "refinement"),
    storyLandingRecord(r3, "refinement"),
    storyLandingRecord(r4, "refinement"),
  ]);
  await page.setViewportSize({ width: 390, height: 844 });
  // Read the initial page while collection works; select Intent's CI status
  // only after the recorded history is ready.
  await Promise.all([untilKept(dashboard.home, landings), openUntilRead(page)]);
  await expect
    .poll(async () => (await landedCiHistory(dashboard)).body)
    .toMatchObject({
      entries: [
        { kind: "point", revision: e.revision },
        { kind: "point", revision: c3 },
        { kind: "point", revision: x },
      ],
    });
  const panel = await chooseProjectCiStatus(page);
  const builds = await evidenceByKeyboard(page, panel);
  const history = historyOf(panel);

  // Three builds measured: R1, R2, R3 and R4 add none of their own.
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI wall time history 3 measured builds · Nov 5",
  );
  const sha = shortSha;
  await expect(buildEvidenceRows(builds)).toHaveText([
    `Nov 5 · ${comparisonWallTimeWords(a1Run)} · exact revision ${sha(e.revision)} (SEED-9#e) · reused equivalent ${sha(e.revision)} for ${sha(r1.revision)} (SEED-9#r1) and ${sha(r2.revision)} (SEED-9#r2) · Run 41 · attempt 1`,
    `Nov 5 · ${comparisonWallTimeWords(c3Run)} · reused equivalent ${sha(c3)} for ${sha(r3.revision)} (SEED-9#r3) · Run 43 · attempt 1`,
    `Nov 5 · ${comparisonWallTimeWords(xRun)} · reused equivalent ${sha(x)} for ${sha(r4.revision)} (SEED-9#r4) · Run 47 · attempt 1`,
  ]);
  // Latest measured build callout (newest point).
  await expect(buildHistoryReading(history).latest).toHaveText(
    comparisonWallTimeWords(xRun),
  );
  // Trunk builds no landing resolves to are not shown.
  await expect(builds).not.toContainText(sha(ci));
  // The selected proofless equivalent keeps its observed point, while the
  // two complete prior attempts are insufficient for a numeric reference.
  await expect(history).toContainText("2 prior builds used");
  await expect(history).toContainText("Insufficient history");
  await expect(history).toContainText(`Selected landing ${sha(r4.revision)}`);
  await expect(history).toContainText("CI proof unavailable: none");
  await expect(buildHistoryReading(history).reference).toHaveCount(0);
  await expect(history).not.toContainText("Possible CI slowdown");
  await expectLinksByKeyboard(page, builds, [41, 43, 47].map(runLink));
  const chart = await chartOf(history);
  expect(chart.points).toHaveLength(3);
  expect(chart.strokes).toEqual([3]);
  await expectNoSidewaysScrollIn(page, history);
});
