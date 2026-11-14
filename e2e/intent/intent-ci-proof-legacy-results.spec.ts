import {
  expectCiAnswer,
  judged,
} from "../../dashboard/tests/intentCiStatusPage.ts";
// A version 1 CI proof summary, from before units, read through GitHub's
// artifact or a ciAdapter, stays readable in Intent as legacy test results,
// never as test cases or test files (SEED-281 example 38;
// ../../dashboard/src/ciProofUnits.ts). Reader rules:
// ../../src/skills/dough-test-optimization/scripts/ci-proof-legacy-results.test.mjs,
// ../../tests/support/dashboard-ci-proof-units-read.test.mjs.

import { test } from "../../dashboard/tests/dashboardTest.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  uuid,
  verdict,
} from "../../dashboard/tests/intentCiAdapterProofProject.ts";
import {
  artifactId,
  expectProofRows,
  openFailedRun,
  run,
} from "../../dashboard/tests/intentCiProofPage.ts";
import {
  login,
  repository,
} from "../../dashboard/tests/intentCiStoryRecords.ts";

import { runArtifactsAnswer } from "../../dashboard/tests/support/ciProofArtifacts.ts";
import { summaryTextZipAnswer } from "../../dashboard/tests/support/ciProofCollected.ts";

// A summary as the version 1 collector wrote it for REPOSITORY's attempt,
// literally: Playwright's entry spelled `tests`, an outcomes entry `checks`.
const v1Entries =
  '[{"path":"dashboard/tests","unit":"tests","passed":19,"failed":1,"other":0,"durationMs":120000,"parts":[{"part":1,"status":"present","passed":19,"failed":1,"other":0,"durationMs":120000}]},{"path":"tests","unit":"checks","passed":5,"failed":0,"other":0,"parts":[{"part":1,"status":"present","passed":5,"failed":0,"other":0}]}]';

const legacyRows = [
  ["dashboard/tests", "19 passed and 1 failed legacy test results", "2 min"],
  ["tests", "5 passed legacy test results", "No timings"],
] as const;

test("a version 1 summary from a GitHub Actions run stays readable as legacy test results, never as test cases or test files (example 38)", async ({
  page,
}) => {
  const text = `{"schemaVersion":1,"repository":"${run.repository}","runId":${String(run.runId)},"runAttempt":${String(run.attempt)},"revision":"${judged}","entries":${v1Entries}}\n`;
  const { proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryTextZipAnswer(text),
  );
  await expectProofRows(proof, legacyRows);
});

test("a version 1 summary a ciAdapter answers stays readable as legacy test results (example 38)", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: {
      summary: JSON.parse(
        `{"schemaVersion":1,"repository":"${repository}","attemptId":"${uuid}","revision":"${login}","entries":${v1Entries}}`,
      ) as unknown,
    },
  });
  const { panel, proof } = await openAdapterProof(page);
  await expectCiAnswer(panel, verdict);
  await expectProofRows(proof, legacyRows);
});
