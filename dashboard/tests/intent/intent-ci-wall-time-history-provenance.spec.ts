// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) for landings the CI timing comparison's
// Landed rule measures by another build or not at all, on a real bare origin
// (../support/startOrigin.ts) whose dashboard collects the landings its
// launch records name, checking them at a test's pace: an execution's exact
// build and the two planning-only refinements that reuse it are one point
// naming all three, counted once; a refinement reusing a trunk build no
// landing measured is a reused point with that build's identity; one whose
// equivalent build has no timing is an "Equivalent timing unavailable" gap
// (SEED-285#see-landed-ci-wall-time-history examples 4 and 5); a cancelled
// landing joins its later trunk build's point, which an ad hoc landing at
// that build also names, with no break in the line, and a failed build is a
// Failed gap linked to its run with no point drawn (examples 6 and 7). Trunk
// builds no landing resolves to are not shown, nor any average, difference,
// excluded mark, slowdown or story's place. A phone reader reaches each item
// and link by keyboard and tells points from gaps by their words. The single
// exact point and the empty history are in
// ./intent-ci-wall-time-history.spec.ts; the window in
// ./intent-ci-wall-time-history-window.spec.ts.

import { shortSha } from "../../src/baseCiWording.ts";
import {
  chartOf,
  dayWords,
  evidenceOnPhone,
  publishTrunk,
} from "../intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import {
  landedCiHistory,
  recheckingLandedCi,
  storyLandingRecord,
  untilKept,
} from "../support/landedCiHistory.ts";
import {
  landedTrunk,
  passedBetween,
  trunkRun,
  usableProofOf,
} from "../support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";
import type { Locator, Page } from "@playwright/test";

test.use({ extraEnv: recheckingLandedCi });

// Each run link of the list in turn by keyboard.
async function expectRunLinksByKeyboard(
  page: Page,
  builds: Locator,
  runs: readonly number[],
) {
  for (const run of runs) {
    await page.keyboard.press("Tab");
    await expect(
      builds.getByRole("link", { name: `Run ${String(run)} · attempt 1` }),
    ).toBeFocused();
  }
}

test("an execution's exact build and the refinements reusing it are one point naming all three, a refinement reusing a build no landing measured is a reused point with that build's identity, and one without equivalent timing is a gap saying so, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  // E's execution builds a1; refinements R1 and R2 change planning only. c3
  // is built, but no recorded landing names it; R3 changes planning only. x
  // is built without CI proof; R4 changes planning only.
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
  // Every build published its CI proof but x's.
  await publishTrunk(
    page,
    origin,
    () => [
      a1Run,
      c3Run,
      trunkRun(
        x,
        47,
        passedBetween("2026-11-05T13:00:00Z", "2026-11-05T13:04:00Z"),
      ),
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
  await untilKept(dashboard.home, landings);
  await expect
    .poll(async () => (await landedCiHistory(dashboard)).body)
    .toMatchObject({
      entries: [
        { kind: "point", revision: e.revision },
        { kind: "point", revision: c3 },
        { kind: "gap", reason: "no-equivalent", revision: r4.revision },
      ],
    });
  const { history, builds } = await evidenceOnPhone(page);

  // Two builds measured: R1, R2 and R3 add none of their own.
  await expect(history.getByRole("heading")).toHaveText(
    "CI wall time history 2 measured builds · Nov 5",
  );
  const sha = shortSha;
  await expect(builds.getByRole("listitem")).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${sha(e.revision)} (SEED-9#e) · reused equivalent ${sha(e.revision)} for ${sha(r1.revision)} (SEED-9#r1) and ${sha(r2.revision)} (SEED-9#r2) · Run 41 · attempt 1`,
    `Nov 5 · 5 min · reused equivalent ${sha(c3)} for ${sha(r3.revision)} (SEED-9#r3) · Run 43 · attempt 1`,
    `${dayWords(r4.at)} · Equivalent timing unavailable · landed revision ${sha(r4.revision)} (SEED-9#r4)`,
  ]);
  // Trunk builds no landing resolves to are not shown.
  await expect(builds).not.toContainText(sha(x));
  // No average, difference, excluded mark, slowdown flag or story's place.
  await expect(history).not.toContainText(
    /average|slower|faster|slowdown|exclu|selected landing/i,
  );
  await expectRunLinksByKeyboard(page, builds, [41, 43]);
  const chart = await chartOf(history);
  expect(chart.points).toHaveLength(2);
  expect(chart.strokes).toEqual([2]);
  await expectNoSidewaysScrollIn(page, history);
});

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
  await expect(history.getByRole("heading")).toHaveText(
    "CI wall time history 2 measured builds · Nov 5",
  );
  const sha = shortSha;
  await expect(builds.getByRole("listitem")).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${sha(b.revision)} (SEED-9#b) · Run 40 · attempt 1`,
    `Nov 5 · 7 min 10 s · exact revision ${sha(g.revision)} · later trunk build ${sha(g.revision)} for ${sha(f.revision)} (SEED-9#f) · Run 46 · attempt 1`,
    `${dayWords(h.at)} · Failed · exact revision ${sha(h.revision)} (SEED-9#h) · Run 45 · attempt 1`,
  ]);
  await expectRunLinksByKeyboard(page, builds, [40, 46, 45]);
  await expect(
    builds.getByRole("link", { name: "Run 45 · attempt 1" }),
  ).toHaveAttribute("href", "https://ci.invalid/runs/45");
  // One stroke joins b's and d6's points, F's cancelled build breaking
  // nothing; the failed build draws no point.
  const chart = await chartOf(history);
  expect(chart.points).toHaveLength(2);
  expect(chart.strokes).toEqual([2]);
  await expectNoSidewaysScrollIn(page, history);
});
