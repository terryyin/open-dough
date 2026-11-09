// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx) for a CI adapter project
// (../intentCiAdapterProofProject.ts), on a real bare origin
// (../support/startOrigin.ts) whose dashboard collects its recorded landings
// through the adapter's discovery at a test's pace: an attempt with its start
// and completion is a point measured the same way as a GitHub Actions run; a
// planning-only landing the adapter has no equivalent timing for, an attempt
// that stopped without a verdict, and one with no start or completion are
// gaps that say why, listed by keyboard on a phone
// (SEED-285#see-landed-ci-wall-time-history example 10). Its pending attempt
// is in ../../backend-tests/intent/landed-ci-history-pending-sources.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import {
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
import { landedTrunk } from "../support/landedCiTrunk.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { expect, test } from "../support/preparationPage.ts";

test.use({ extraEnv: recheckingLandedCi });

test("a CI adapter's timed attempt is a point of CI wall time, and its skipped, cancelled and untimed landings are gaps that say why, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  // P's attempt passes in 6 min 5 s; S changes planning only; Q's attempt
  // stops without a verdict; U's passes, naming no start or completion.
  const { landing, landings } = landedTrunk(
    origin,
    [
      { title: "ci", kind: "ci-workflow" },
      { title: "p", kind: "code" },
      { title: "s", kind: "planning" },
      { title: "q", kind: "code" },
      { title: "u", kind: "code" },
    ],
    ["p", "s", "q", "u"],
  );
  const p = landing("p");
  const s = landing("s");
  const q = landing("q");
  const u = landing("u");
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
  ]);
  await untilKept(dashboard.home, landings);
  await expect
    .poll(async () => (await landedCiHistory(dashboard)).body)
    .toMatchObject({
      entries: [
        { kind: "point", revision: p.revision },
        { kind: "gap", reason: "no-equivalent", revision: s.revision },
        { kind: "gap", reason: "cancelled", revision: q.revision },
        { kind: "gap", reason: "not-recorded", revision: u.revision },
      ],
    });

  const { history, builds } = await evidenceOnPhone(page);
  await expect(history.getByRole("heading")).toHaveText(
    "CI wall time history 1 measured build · Nov 5",
  );
  await expect(builds.getByRole("listitem")).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${shortSha(p.revision)} (SEED-9#p) · Attempt attempt-p`,
    `${dayWords(s.at)} · Equivalent timing unavailable · landed revision ${shortSha(s.revision)} (SEED-9#s)`,
    `${dayWords(q.at)} · Cancelled · landed revision ${shortSha(q.revision)} (SEED-9#q)`,
    `${dayWords(u.at)} · CI wall time not recorded · exact revision ${shortSha(u.revision)} (SEED-9#u) · Attempt attempt-u`,
  ]);
  for (const id of ["p", "u"]) {
    await page.keyboard.press("Tab");
    const link = builds.getByRole("link", { name: `Attempt attempt-${id}` });
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute(
      "href",
      `https://ci.invalid/builds/run-${id}`,
    );
  }
  await expectNoSidewaysScrollIn(page, history);
});
