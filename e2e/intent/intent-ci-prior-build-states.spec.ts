import { attemptLink } from "../../dashboard/tests/ciEvidenceLabelsPage.ts";
import {
  compactReadout,
  priorBuildReferenceReading,
} from "../../dashboard/tests/priorBuildReferencePage.ts";
// Boundary states consume raw retained supplier observations through the
// authenticated reader; no fixture supplies a calculated average.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  evidenceByKeyboard,
  historyOf,
  openJudgedCiStatus,
} from "../../dashboard/tests/intentCiHistoryPage.ts";
import { expectNoSidewaysScrollIn } from "../../dashboard/tests/pageLayout.ts";
import { keepLandedCiHistory } from "../../dashboard/tests/support/landedCiHistory.ts";

async function keepMeasurements(
  home: string,
  values: readonly number[],
  selectedProof = true,
) {
  const history = makeMe.aLandedCiHistory;
  const order = Array.from(values.keys(), (index) =>
    (index + 1).toString(16).padStart(40, "0"),
  );
  for (const [index, ms] of values.entries()) {
    const revision = order[index];
    if (revision === undefined)
      throw new Error("Measurement revision is missing");
    const startedAt = `2026-11-0${index + 1}T10:00:00Z`;
    history.measuredLanding({
      receipt: String(index),
      revision,
      receivedAt: startedAt,
      runId: index + 1,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
    });
    if (selectedProof || index < values.length - 1)
      history.proofFor(
        `run/${index + 1}/1`,
        makeMe.aCiProof
          .forRun({ revision, runId: index + 1 })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      );
  }
  await keepLandedCiHistory(home, history.inTrunkOrder(order).please());
}

test("five complete zeros give a zero reference with its median, line and each build's evidence", async ({
  page,
  dashboard,
}) => {
  await keepMeasurements(dashboard.home, [0, 0, 0, 0, 0, 1200]);
  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(history).toContainText("Prior-build average · 0 s");
  await expect(history).toContainText("Median 0 s");
  await expect(history).toContainText("0 s · 5 prior builds used");
  await expect(buildHistoryReading(history).referenceLine).toHaveCount(1);
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveCount(6);
  await expect(buildEvidenceRows(builds).first()).toContainText("0 s");
  await expectNoSidewaysScrollIn(page, history);
});

test("selected missing proof keeps a usable prior average and available observed timing, with no invented difference", async ({
  page,
  dashboard,
}) => {
  await keepMeasurements(
    dashboard.home,
    [100000, 100000, 100000, 100000, 100000, 120000],
    false,
  );
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(history).toContainText("Prior-build average · 1 min 40 s");
  await expect(history).toContainText(
    "No timing · Validated CI proof summary is not retained",
  );
  await expect(compactReadout(history).change).toHaveCount(0);
  await expect(history).toContainText("5 prior builds used");
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds).last()).toContainText("2 min");
  await expect(priorBuildReferenceReading(history).selected).toHaveText(
    /Validated CI proof summary is not retained/,
  );
});

test("four post-filter values show their evidence and insufficient history without a numeric average or reference line", async ({
  page,
  dashboard,
}) => {
  await keepMeasurements(
    dashboard.home,
    [100000, 100000, 100000, 100000, 116000, 120000],
  );
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(history).toContainText(
    "Prior-build average · Insufficient history · 4 prior builds used",
  );
  await expect(compactReadout(history).change).toHaveCount(0);
  await expect(buildHistoryReading(history).reference).toHaveCount(0);
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds)).toHaveCount(6);
  await expect(buildEvidenceRows(builds).nth(4)).toContainText("1 min 56 s");
  await expect(priorBuildReferenceReading(history).excluded).toHaveText(
    /1 min 56 s.*Slow outlier/,
  );
});

test("refresh recomputes the displayed endpoint reference from the changed retained snapshot without display rounding", async ({
  page,
  dashboard,
}) => {
  await keepMeasurements(
    dashboard.home,
    [100000, 100000, 100000, 100000, 100000, 115000],
  );
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(history).toContainText("Prior-build average · 1 min 40 s");
  await expect(history).toContainText("5 prior builds used");
  await keepMeasurements(
    dashboard.home,
    [100000, 100000, 100000, 100000, 100000, 115000, 130000],
  );
  await panel.getByRole("button", { name: "Check again", exact: true }).click();
  await expect(history).toContainText("6 prior builds used");
  await expect(history).toContainText("Prior-build average · 1 min 43 s");
  await expect(history).toContainText("+27.5 s (+27%)");
  await expect(buildHistoryReading(history).referenceTitle).toHaveText(
    "Prior-build average 1 min 43 s",
  );
});

test("an invalid measured start keeps its original gap and readable receipt date beside an available prior reference", async ({
  page,
  dashboard,
}) => {
  await keepMeasurements(
    dashboard.home,
    [100000, 100000, 100000, 100000, 100000, 120000],
  );
  // The exact malformed persisted input is the boundary under test, outside
  // MakeMe's otherwise canonical observations. No reference is supplied.
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/landed-ci-history.json",
  );
  const retained = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    { builds: Record<string, { startedAt: string }> }
  >;
  const selectedBuild = retained["open-dough"]?.builds["run/6/1"];
  if (selectedBuild === undefined)
    throw new Error("Selected retained build is missing");
  selectedBuild.startedAt = "not-a-date";
  writeFileSync(file, JSON.stringify(retained));
  const panel = await openJudgedCiStatus(page);
  const history = historyOf(panel);
  await expect(history).toContainText("Prior-build average · 1 min 40 s");
  await expect(history).toContainText(
    "No timing · CI wall time bounds are not recorded or invalid",
  );
  await expect(compactReadout(history).change).toHaveCount(0);
  const builds = await evidenceByKeyboard(page, panel);
  await expect(buildEvidenceRows(builds).last()).toContainText(
    "CI wall time not recorded",
  );
  const selected = priorBuildReferenceReading(history).selected;
  await expect(selected).toContainText("Nov 6");
  await expect(selected).toContainText("bounds are not recorded or invalid");
  await expect(attemptLink(selected, "Run 6 · attempt 1")).toHaveAttribute(
    "href",
    "https://ci.invalid/runs/6",
  );
});
