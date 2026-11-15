// Project Intent's CI time without runner waits history in CI status
// (../../dashboard/src/IntentCiHistory.tsx): chart points, Latest measured
// build and prior-build readout use the kept measure; a retained build with
// wall time but no measure is a hollow mark whose status and evidence name
// why the measure is unavailable.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  evidenceByKeyboard,
  historyOf,
  measureHistoryChart,
  openJudgedCiStatus,
} from "../../dashboard/tests/intentCiHistoryPage.ts";
import { compactReadout } from "../../dashboard/tests/priorBuildReferencePage.ts";
import { keepLandedCiHistory } from "../../dashboard/tests/support/landedCiHistory.ts";
import { keepLandedCiMeasurements } from "../../dashboard/tests/support/keepLandedCiMeasurements.ts";

test("five prior builds at 5 min without runner waits and a 4 min landing show −1 min (−20%) on the chart and compact readout", async ({
  page,
  dashboard,
}) => {
  const fiveMin = 5 * 60_000;
  const fourMin = 4 * 60_000;
  await keepLandedCiMeasurements(dashboard.home, [
    fiveMin,
    fiveMin,
    fiveMin,
    fiveMin,
    fiveMin,
    fourMin,
  ]);
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(buildHistoryReading(history).heading).toContainText(
    "CI time without runner waits history",
  );
  await expect(buildHistoryReading(history).latest).toHaveText("4 min");
  await expect(compactReadout(history).average).toHaveText(
    "Prior-build average · 5 min · 5 prior builds used",
  );
  await expect(compactReadout(history).change).toHaveText(
    "vs. prior average · −1 min (−20%)",
  );
  await expect(buildHistoryReading(history).referenceTitle).toHaveText(
    "Prior-build average 5 min",
  );
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds).last()).toContainText("4 min");
  await expect(buildEvidenceRows(builds).first()).toContainText("5 min");
});

test("a build kept with wall time but no measure is a hollow mark whose status and evidence name the unavailable measure", async ({
  page,
  dashboard,
}) => {
  const measured = "1".repeat(40);
  const unavailable = "2".repeat(40);
  const reason = "The CI adapter gave no job graph: no job graph retained.";
  await keepLandedCiHistory(
    dashboard.home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([measured, unavailable])
      .measuredLanding({
        receipt: "0",
        revision: measured,
        receivedAt: "2026-11-01T10:00:00Z",
        runId: 1,
        startedAt: "2026-11-01T10:00:00Z",
        completedAt: "2026-11-01T10:05:00Z",
        timeWithoutRunnerWaits: { milliseconds: 5 * 60_000 },
      })
      .proofFor(
        "run/1/1",
        makeMe.aCiProof
          .forRun({ revision: measured, runId: 1 })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      )
      .measuredLanding({
        receipt: "1",
        revision: unavailable,
        receivedAt: "2026-11-02T10:00:00Z",
        runId: 2,
        startedAt: "2026-11-02T10:00:00Z",
        completedAt: "2026-11-02T10:06:00Z",
        timeWithoutRunnerWaits: { reason },
      })
      .proofFor(
        "run/2/1",
        makeMe.aCiProof
          .forRun({ revision: unavailable, runId: 2 })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      )
      .please(),
  );
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  const chart = measureHistoryChart(history);
  await expect(chart.measured).toHaveCount(1);
  await expect(chart.unavailable).toHaveCount(1);
  await expect(chart.mark(`Nov 2 · No timing · ${reason}`)).toBeVisible();
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveText([
    `Nov 1 · 5 min · exact revision ${shortSha(measured)} · Run 1 · attempt 1`,
    `Nov 2 · ${reason} · exact revision ${shortSha(unavailable)} · Run 2 · attempt 1`,
  ]);
});

test("chart points and Latest measured build use kept CI time without runner waits when it differs from wall time", async ({
  page,
  dashboard,
}) => {
  const revision = "a".repeat(40);
  await keepLandedCiHistory(
    dashboard.home,
    makeMe.aLandedCiHistory
      .inTrunkOrder([revision])
      .measuredLanding({
        receipt: "0",
        revision,
        receivedAt: "2026-11-05T10:00:00Z",
        runId: 41,
        startedAt: "2026-11-05T10:00:00Z",
        // Wall spans waits; the kept measure is the 2+3 min chain.
        completedAt: "2026-11-05T10:06:30Z",
        timeWithoutRunnerWaits: { milliseconds: 5 * 60_000 },
      })
      .proofFor(
        "run/41/1",
        makeMe.aCiProof
          .forRun({ revision, runId: 41 })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      )
      .please(),
  );
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(buildHistoryReading(history).latest).toHaveText("5 min");
  await expect(measureHistoryChart(history).drawing).toBeVisible();
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveText([
    `Nov 5 · 5 min · exact revision ${shortSha(revision)} · Run 41 · attempt 1`,
  ]);
});
