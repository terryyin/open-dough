// Version 1 proof is invalid through both providers.
import {
  expectCiAnswer,
  judged,
} from "../../dashboard/test-support/intentCiStatusPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  adapterProject,
  openAdapterProof,
  passed,
  uuid,
  verdict,
} from "../../dashboard/test-support/intentCiAdapterProofProject.ts";
import {
  artifactId,
  ciProofReading,
  expectNoProofRows,
  openFailedRun,
  run,
} from "../../dashboard/test-support/intentCiProofPage.ts";
import {
  login,
  repository,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";

import { runArtifactsAnswer } from "../../dashboard/test-support/support/ciProofArtifacts.ts";
import { summaryTextZipAnswer } from "../../dashboard/test-support/support/ciProofCollected.ts";

// A summary as the version 1 collector wrote it for REPOSITORY's attempt,
// literally: Playwright's entry spelled `tests`, an outcomes entry `checks`.
const v1Entries =
  '[{"path":"dashboard/tests","unit":"tests","passed":19,"failed":1,"other":0,"durationMs":120000,"parts":[{"part":1,"status":"present","passed":19,"failed":1,"other":0,"durationMs":120000}]},{"path":"tests","unit":"checks","passed":5,"failed":0,"other":0,"parts":[{"part":1,"status":"present","passed":5,"failed":0,"other":0}]}]';

test("a version 1 summary from a GitHub Actions run is invalid and shows no results", async ({
  page,
}) => {
  const { proof } =
    await test.step("When I read a GitHub Actions run that published version 1 proof", () => {
      const text = `{"schemaVersion":1,"repository":"${run.repository}","runId":${String(run.runId)},"runAttempt":${String(run.attempt)},"revision":"${judged}","entries":${v1Entries}}\n`;
      return openFailedRun(
        page,
        () => runArtifactsAnswer(run, artifactId),
        () => summaryTextZipAnswer(text),
      );
    });
  await test.step("Then proof shows a version error and no results", async () => {
    await expect(ciProofReading(proof).unavailable).toContainText(
      "schemaVersion is not 2",
    );
    await expectNoProofRows(proof);
  });
});

test("a version 1 summary a ciAdapter answers is invalid and shows no results", async ({
  page,
  dashboard,
}) => {
  await test.step("Given the adapter publishes version 1 proof for a successful attempt", () => {
    adapterProject(dashboard.home).answer({
      discover: { main: [passed(uuid, uuid, login, "main")] },
      proof: {
        summary: JSON.parse(
          `{"schemaVersion":1,"repository":"${repository}","attemptId":"${uuid}","revision":"${login}","entries":${v1Entries}}`,
        ) as unknown,
      },
    });
  });
  const { panel, proof } =
    await test.step("When I read that adapter attempt", () =>
      openAdapterProof(page));
  await test.step("Then proof shows a version error and no results", async () => {
    await expect(ciProofReading(proof).unavailable).toContainText(
      "schemaVersion is not 2",
    );
    await expectNoProofRows(proof);
  });
  await test.step("And the run verdict remains successful", async () => {
    await expectCiAnswer(panel, verdict);
  });
});
