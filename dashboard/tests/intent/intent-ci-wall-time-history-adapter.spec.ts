// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) for a CI adapter project
// (../intentCiAdapterProofProject.ts), on a real bare origin
// (../support/startOrigin.ts) whose dashboard collects its recorded landings
// through the adapter's discovery at a test's pace: an attempt with its start
// and completion is a point measured the same way as a GitHub Actions run;
// a planning-only landing whose equivalent attempt has its timing but no CI
// proof joins that attempt as a reused-equivalent landing on the same point;
// an attempt that stopped without a verdict, one with no start or
// completion, and a planning-only landing resting on that untimed attempt
// are gaps that say why, each naming that attempt and linked to it, listed
// by keyboard on a phone (SEED-285#see-landed-ci-wall-time-history example
// 10; SEED-288#reuse-adapter-equivalent-timing). Its pending attempt is in
// ../../backend-tests/intent/landed-ci-history-pending-sources.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import {
  dayWords,
  chooseProjectCiStatus,
  evidenceByKeyboard,
  historyOf,
  expectLinksByKeyboard,
  publishTrunk,
} from "../intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  landedCiHistory,
  recheckingLandedCi,
  storyLandingRecord,
  untilKept,
} from "../support/landedCiHistory.ts";
import { landedTrunk } from "../support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";

test.use({ extraEnv: recheckingLandedCi });

test("a CI adapter's timed attempt is a point of CI wall time that a planning-only skip reuses without proof, and its cancelled and untimed landings are gaps that say why and name their attempt, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  // P's attempt passes in 6 min 5 s; S changes planning only and reuses P;
  // Q's attempt stops without a verdict; U's passes, naming no start or
  // completion; T changes planning only.
  const { landing, landings } = landedTrunk(
    origin,
    [
      { title: "ci", kind: "ci-workflow" },
      { title: "p", kind: "code" },
      { title: "s", kind: "planning" },
      { title: "q", kind: "code" },
      { title: "u", kind: "code" },
      { title: "t", kind: "planning" },
    ],
    ["p", "s", "q", "u", "t"],
  );
  const p = landing("p");
  const s = landing("s");
  const q = landing("q");
  const u = landing("u");
  const t = landing("t");
  const adapter = adapterProject(dashboard.home);
  const attempt = (revision: string, id: string) => ({
    sha: revision,
    runId: `run-${id}`,
    attemptId: `attempt-${id}`,
    branch: "main",
  });
  adapter.answer({
    discover: {
      main: [
        makeMe.aCiAdapterAttempt
          .passed({
            ...attempt(p.revision, "p"),
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:06:05Z",
          })
          .please(),
        makeMe.aCiAdapterAttempt
          .incomplete({
            ...attempt(q.revision, "q"),
            time: "2026-11-05T10:20:00Z",
          })
          .please(),
        makeMe.aCiAdapterAttempt
          .passedWithoutTimes({
            ...attempt(u.revision, "u"),
            time: "2026-11-05T10:30:00Z",
          })
          .please(),
      ],
    },
    proof: { unavailable: "no summary retained for this attempt" },
  });
  await publishTrunk(page, origin, () => []);
  keepLaunchRecords(dashboard.home, [
    storyLandingRecord(p, "execution"),
    storyLandingRecord(s, "refinement"),
    storyLandingRecord(q, "execution"),
    storyLandingRecord(u, "execution"),
    storyLandingRecord(t, "refinement"),
  ]);
  await page.setViewportSize({ width: 390, height: 844 });
  // Read the initial page while collection works; select Intent's CI status
  // only after the recorded history is ready.
  await Promise.all([untilKept(dashboard.home, landings), openUntilRead(page)]);
  await expect
    .poll(async () => (await landedCiHistory(dashboard)).body)
    .toMatchObject({
      entries: [
        {
          kind: "point",
          revision: p.revision,
          landings: [
            { revision: p.revision, provenance: "exact" },
            { revision: s.revision, provenance: "equivalent" },
          ],
        },
        { kind: "gap", reason: "cancelled", revision: q.revision },
        { kind: "gap", reason: "not-recorded", revision: u.revision },
        { kind: "gap", reason: "no-equivalent", revision: t.revision },
      ],
    });

  const panel = await chooseProjectCiStatus(page);
  const builds = await evidenceByKeyboard(page, panel);
  const history = historyOf(panel);
  await expect(history.getByRole("heading")).toHaveText(
    "CI wall time history 1 measured build · Nov 5",
  );
  const sha = shortSha;
  await expect(builds.getByRole("listitem")).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${sha(p.revision)} (SEED-9#p) · reused equivalent ${sha(p.revision)} for ${sha(s.revision)} (SEED-9#s) · Attempt attempt-p`,
    `${dayWords(q.at)} · Cancelled · exact revision ${sha(q.revision)} (SEED-9#q) · Attempt attempt-q`,
    `${dayWords(u.at)} · CI wall time not recorded · exact revision ${sha(u.revision)} (SEED-9#u) · Attempt attempt-u`,
    `${dayWords(t.at)} · Equivalent timing unavailable · reused equivalent ${sha(u.revision)} for ${sha(t.revision)} (SEED-9#t) · Attempt attempt-u`,
  ]);
  // Each item's attempt link in turn.
  await expectLinksByKeyboard(
    page,
    builds,
    ["p", "q", "u", "u"].map((id) => ({
      name: `Attempt attempt-${id}`,
      href: `https://ci.invalid/builds/run-${id}`,
    })),
  );
  await expectNoSidewaysScrollIn(page, history);
});
