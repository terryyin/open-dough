// Project Intent's CI time without runner waits history in CI status
// (../../src/IntentCiHistory.tsx): a history answer with one measured build
// shows it beside the trunk's current judgment and Proof as a point in an
// image of CI wall time by build date, under a heading with the measured
// count and date span, and lists it under Builds and evidence with its date,
// wall time, exact revision and run link, reachable by keyboard on a phone
// without widening the page; an answer with no measured landing says so in
// words and draws no chart (SEED-285#see-landed-ci-wall-time-history examples
// 1 and 9). Collecting that build with no page open is
// ../../backend-tests/intent/landed-ci-history-collection.spec.ts, and its
// time without runner waits
// ../../backend-tests/intent/landed-ci-history-time-without-runner-waits.spec.ts;
// a landing whose CI is still pending is
// ../../../e2e/intent/intent-ci-wall-time-history-pending.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import {
  attemptLink,
  evidenceLabels,
  expectEvidenceLabels,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import {
  buildEvidenceRows,
  buildHistoryReading,
  evidenceByKeyboard,
  historyOf,
} from "../../test-support/intentCiHistoryPage.ts";
import { expectCiAnswer } from "../../test-support/intentCiStatusPage.ts";
import { expectNoSidewaysScrollIn } from "../../test-support/pageLayout.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { serveFrontendCiHistory } from "../../test-support/support/frontendCiHistoryAnswers.ts";
import { openFrontendRunProof } from "../../test-support/support/frontendCiRunProofAnswers.ts";
import { judged } from "../../test-support/support/trunkCiAnswers.ts";

// The trunk's judgment rests on run 41, 10:00 to 10:06:05 on Nov 5.
const judgment = {
  subject: "Result landed.txt",
  startedAt: "2026-11-05T10:00:00Z",
  completedAt: "2026-11-05T10:06:05Z",
};
const proofLabels = [
  "Run 41 · attempt 1",
  `Revision ${shortSha(judged)}`,
  "CI wall time 6 min",
];

test("a measured build is a point of CI time without runner waits beside the trunk's judgment and Proof, listed with its date, that time, exact revision and run, by keyboard on a phone", async ({
  page,
}) => {
  await serveFrontendCiHistory(
    page,
    makeMe.aCiHistoryAnswer
      .measuredBuild({
        revision: judged,
        runId: 41,
        startedAt: judgment.startedAt,
        completedAt: judgment.completedAt,
      })
      .please(),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { panel, proof } = await openFrontendRunProof(page, [], judgment);

  // The current judgment and its Proof are the trunk's, unchanged.
  await expectCiAnswer(
    panel,
    `Passed at ${shortSha(judged)} (Result landed.txt)`,
  );
  await expectEvidenceLabels(evidenceLabels(proof), proofLabels);

  const history = historyOf(panel);
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI time without runner waits history 1 measured build · Nov 5",
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
    `Nov 5 · 6 min 5 s · exact revision ${shortSha(judged)} · Run 41 · attempt 1`,
  ]);
  await page.keyboard.press("Tab");
  const run = attemptLink(builds, "Run 41 · attempt 1");
  await expect(run).toBeFocused();
  await expect(run).toHaveAttribute("href", "https://ci.invalid/runs/41");
  await expectNoSidewaysScrollIn(page, history);
});

test("a history with no measured landing says none has been measured yet, draws no chart, and keeps the judgment and Proof", async ({
  page,
}) => {
  await serveFrontendCiHistory(page, makeMe.aCiHistoryAnswer.please());
  const { panel, proof } = await openFrontendRunProof(page, [], judgment);

  await expectCiAnswer(
    panel,
    `Passed at ${shortSha(judged)} (Result landed.txt)`,
  );
  await expectEvidenceLabels(evidenceLabels(proof), proofLabels);
  const history = historyOf(panel);
  await expect(buildHistoryReading(history).heading).toHaveText(
    "CI time without runner waits history",
  );
  await expect(history).toContainText(
    "No dashboard-recorded landings have been measured yet.",
  );
  await expect(buildHistoryReading(history).charts).toHaveCount(0);
  await expect(buildHistoryReading(history).disclosure).toHaveCount(0);
});
