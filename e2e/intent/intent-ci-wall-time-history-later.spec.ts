// Project Intent's CI wall time history in CI status
// (../../dashboard/src/IntentCiHistory.tsx) for landings the CI timing comparison's
// Landed rule measures by a later trunk build, or not at all, on a real bare
// origin (../../dashboard/tests/support/startOrigin.ts) whose dashboard collects the landings
// its launch records name, checking them at a test's pace: a cancelled
// landing joins its later trunk build's point, which an ad hoc landing at
// that build also names, with no break in the line, and a failed build is a
// Failed gap linked to its run with no point drawn
// (SEED-285#see-landed-ci-wall-time-history examples 6 and 7). A phone
// reader reaches each item and link by keyboard and tells points from gaps
// by their words. Exact and reused equivalent points are in
// ./intent-ci-wall-time-history-provenance.spec.ts.

import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  chartOf,
  dayWords,
  evidenceOnPhone,
  expectLinksByKeyboard,
  publishTrunk,
  runLink,
} from "../../dashboard/tests/intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../../dashboard/tests/pageLayout.ts";
import {
  landedCiHistory,
  recheckingLandedCi,
  storyLandingRecord,
  untilKept,
} from "../../dashboard/tests/support/landedCiHistory.ts";
import {
  landedTrunk,
  passedBetween,
  trunkRun,
  usableProofOf,
} from "../../dashboard/tests/support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";

test.use({ extraEnv: recheckingLandedCi });

test("a cancelled landing joins the later trunk build's point a landing there also names, with no break in the line, and a failed build is a Failed gap linked to its run with no point drawn, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  // B's execution builds its revision; F's build at d4 is cancelled by the
  // push of d6, which an ad hoc session's landing G builds; H's build at e5
  // fails after 2 min.
  const { landing, landings } = landedTrunk(
    origin,
    [
      { title: "b", kind: "code" },
      { title: "f", kind: "code" },
      { title: "g", kind: "code" },
      { title: "h", kind: "code" },
    ],
    ["b", "f", "g", "h"],
  );
  const b = landing("b");
  const f = landing("f");
  const g = landing("g");
  const h = landing("h");
  const d6Run = trunkRun(
    g.revision,
    46,
    passedBetween("2026-11-05T11:00:00Z", "2026-11-05T11:07:10Z"),
  );
  await publishTrunk(
    page,
    origin,
    () => [
      trunkRun(
        b.revision,
        40,
        passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
      ),
      trunkRun(f.revision, 44, {
        conclusion: "cancelled",
        createdAt: "2026-11-05T10:40:00Z",
        startedAt: "2026-11-05T10:40:00Z",
        completedAt: "2026-11-05T10:41:00Z",
      }),
      d6Run,
      trunkRun(h.revision, 45, {
        conclusion: "failure",
        createdAt: "2026-11-05T14:00:00Z",
        startedAt: "2026-11-05T14:00:00Z",
        completedAt: "2026-11-05T14:02:00Z",
      }),
    ],
    () => ({ 46: usableProofOf(d6Run) }),
  );
  keepLaunchRecords(dashboard.home, [
    storyLandingRecord(b, "execution"),
    storyLandingRecord(f, "execution"),
    storyLandingRecord(g, "ad hoc"),
    storyLandingRecord(h, "execution"),
  ]);
  await untilKept(dashboard.home, landings);
  await expect
    .poll(async () => (await landedCiHistory(dashboard)).body)
    .toMatchObject({
      entries: [
        { kind: "point", revision: b.revision },
        { kind: "point", revision: g.revision },
        { kind: "gap", reason: "failed", revision: h.revision },
      ],
    });
  const { history, builds } = await evidenceOnPhone(page);

  // d6 is counted once, for G and for F.
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI wall time history 2 measured builds · Nov 5",
  );
  const sha = shortSha;
  await expect(buildEvidenceRows(builds)).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${sha(b.revision)} (SEED-9#b) · Run 40 · attempt 1`,
    `Nov 5 · 7 min 10 s · exact revision ${sha(g.revision)} · later trunk build ${sha(g.revision)} for ${sha(f.revision)} (SEED-9#f) · Run 46 · attempt 1`,
    `${dayWords(h.at)} · Failed · exact revision ${sha(h.revision)} (SEED-9#h) · Run 45 · attempt 1`,
  ]);
  await expectLinksByKeyboard(page, builds, [40, 46, 45].map(runLink));
  // One stroke joins b's and d6's points, F's cancelled build breaking
  // nothing; the failed build draws no point.
  const chart = await chartOf(history);
  expect(chart.points).toHaveLength(2);
  expect(chart.strokes).toEqual([2]);
  await expectNoSidewaysScrollIn(page, history);
});
