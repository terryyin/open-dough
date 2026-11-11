import { expectCiAnswer } from "../intentCiStatusPage.ts";
// Project Intent's CI wall time history in CI status
// (../../src/IntentCiHistory.tsx), on a real bare origin
// (../support/startOrigin.ts) whose dashboard collects recorded landings'
// CI: once a landing is collected, CI status shows its measured build beside
// the trunk's current judgment and Proof as a point in an image of CI wall
// time by build date, under a heading with the measured count and date span,
// and lists it under Builds and evidence with its date, wall time, exact
// revision and run link, reachable by keyboard on a phone without widening
// the page; a project with no measured landing says so in words and draws no
// chart (SEED-285#see-landed-ci-wall-time-history examples 1 and 9). A
// landing whose CI is still pending is in
// ./intent-ci-wall-time-history-pending.spec.ts. Collection and the history
// read's variants are in
// ../../backend-tests/intent/landed-ci-history-collection.spec.ts,
// ../../backend-tests/intent/landed-ci-history-lifecycle.spec.ts and
// ../../backend-tests/intent/landed-ci-history-pending.spec.ts.

import { shortSha } from "../../src/baseCiWording.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
} from "../ciEvidenceLabelsPage.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  evidenceByKeyboard,
  historyOf,
  openProjectCiStatus,
  publishTrunk,
} from "../intentCiHistoryPage.ts";
import { proofOf } from "../intentCiProofPage.ts";
import { expectNoSidewaysScrollIn } from "../pageLayout.ts";
import {
  collectingLandedCi,
  landedCiHistory,
  resultToLand,
} from "../support/landedCiHistory.ts";
import { passedBetween, trunkRun } from "../support/landedCiTrunk.ts";
import { expect, test } from "../support/preparationPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import { land } from "../support/startSessionLandingContext.ts";

test.use({ extraEnv: collectingLandedCi });

test("a collected landing's exact build is a point of CI wall time beside the trunk's judgment and Proof, listed with its date, wall time, exact revision and run, by keyboard on a phone", async ({
  page,
  dashboard,
  origin,
}) => {
  const { record, revision } = await resultToLand(dashboard, "landed.txt");
  await publishTrunk(page, origin, () => [
    trunkRun(
      revision,
      41,
      passedBetween("2026-11-05T10:00:00Z", "2026-11-05T10:06:05Z"),
    ),
  ]);
  land(record, origin, dashboard.home);
  // Collected without Intent, or any page, open.
  await expect
    .poll(() => landedCiHistory(dashboard))
    .toMatchObject({ body: { entries: [{ kind: "point", revision }] } });

  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openProjectCiStatus(page);

  // The current judgment and its Proof are the trunk's, unchanged.
  await expectCiAnswer(
    panel,
    `Passed at ${shortSha(revision)} (Result landed.txt)`,
  );
  await expectEvidenceLabels(evidenceLabels(proofOf(panel)), [
    "Run 41 · attempt 1",
    `Revision ${shortSha(revision)}`,
    "CI wall time 6 min",
  ]);

  const history = historyOf(panel);
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI wall time history 1 measured build · Nov 5",
  );
  await expect(history).toContainText(
    "Collected from dashboard-recorded landings",
  );
  await expect(buildHistoryReading(history).latestLabel).toHaveText(
    "Latest measured build",
  );
  await expect(buildHistoryReading(history).latest).toHaveText("6 min 5 s");
  await expect(buildHistoryReading(history).chart).toBeVisible();

  // Builds and evidence, between Proof and Check again by keyboard.
  await expect(buildHistoryReading(history).disclosure).toHaveText(
    "Builds and evidence",
  );
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveText([
    `Nov 5 · 6 min 5 s · exact revision ${shortSha(revision)} · Run 41 · attempt 1`,
  ]);
  await page.keyboard.press("Tab");
  const run = builds.getByRole("link", { name: "Run 41 · attempt 1" });
  await expect(run).toBeFocused();
  await expect(run).toHaveAttribute("href", "https://ci.invalid/runs/41");
  await expectNoSidewaysScrollIn(page, history);
});

test("a project with no recorded landing says no landing has been measured yet, draws no chart, and keeps its judgment and Proof", async ({
  page,
  origin,
}) => {
  const head = await originMain(origin);
  const subject = (
    await origin.originGit("log", "-1", "--format=%s", "main")
  ).trim();
  await publishTrunk(page, origin, () => [
    trunkRun(
      head,
      7,
      passedBetween("2026-11-05T09:00:00Z", "2026-11-05T09:03:00Z"),
    ),
  ]);

  const panel = await openProjectCiStatus(page);

  await expectCiAnswer(panel, `Passed at ${shortSha(head)} (${subject})`);
  await expectEvidenceLabels(evidenceLabels(proofOf(panel)), [
    "Run 7 · attempt 1",
    `Revision ${shortSha(head)}`,
    "CI wall time 3 min",
  ]);
  const history = historyOf(panel);
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI wall time history",
  );
  await expect(history).toContainText(
    "No dashboard-recorded landings have been measured yet.",
  );
  await expect(buildHistoryReading(history).charts).toHaveCount(0);
  await expect(buildHistoryReading(history).disclosure).toHaveCount(0);
});
