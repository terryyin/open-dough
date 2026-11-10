// Why Intent's CI status tab shows no CI proof (../../src/IntentCiProof.tsx):
// when the shown run's
// summary has expired, cannot be read, is invalid, or is for another
// attempt or revision, or when no completed run is shown, one line under
// Proof says why, and the judgment reads exactly as with no summary; Check
// again reads both again. A ciAdapter attempt's reasons:
// ./intent-ci-proof-adapter-reasons.spec.ts. A run with a summary or a gap, and one
// browser refusal:
// ./intent-ci-proof.spec.ts; query-shape refusals:
// ../../../tests/support/dashboard-ci-proof-parse.test.mjs; a running
// result's ancestor proof and the per-attempt memory:
// ./intent-ci-proof-ancestor.spec.ts.

import { SUMMARY_READ_LIMIT_BYTES } from "../../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs";
import { expect, test } from "../dashboardTest.ts";
import { evidenceLabels, expectAttemptAt } from "../ciEvidenceLabelsPage.ts";
import { judged, runUrl } from "../intentCiStatusPage.ts";
import {
  artifactId,
  expectNoProofRows,
  failedVerdict,
  openFailedRun,
  proofCalls,
  run,
  verdictOf,
} from "../intentCiProofPage.ts";
import type { OriginAnswer } from "../originAnswers.ts";
import { tokenColour } from "../pageColours.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
  zipOf,
} from "../support/ciProofArtifacts.ts";

// 1.3 MiB of summary text: the zip stays small so listing size_in_bytes does
// not refuse first; onlyZipEntry reports the uncompressed entry size.
const oversizedSummaryBytes = 1_363_148;

const unavailable = "This run's CI proof summary";

test("each proof that cannot be shown gives one reason under Proof, the verdict reads as with no summary, and Check again reads both again", async ({
  page,
}) => {
  let shownRun = run;
  let artifacts = (): OriginAnswer => runArtifactsAnswer(run, undefined);
  let zip = (): OriginAnswer => ({
    status: 404,
    contentType: "text/plain",
    body: "",
  });
  const { published, panel, proof } = await openFailedRun(
    page,
    () => artifacts(),
    () => zip(),
    () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "failure",
          databaseId: shownRun.runId,
          url: runUrl,
        })
        .please(),
    ],
  );
  const reason = proof.locator(".intent-ci-proof-unavailable");
  await expect(reason).toHaveText("This run published no CI proof summary.");
  await expect(panel.locator(".intent-ci-state")).toHaveText(failedVerdict);
  const verdict = await verdictOf(panel);
  const listed = () =>
    published.requests.filter(
      ({ request }) =>
        request.kind === "actions-runs" ||
        request.kind === "actions-run-artifacts",
    ).length;

  const shows = async (line: string | RegExp) => {
    const before = listed();
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(reason).toHaveText(line);
    await expect(reason).toHaveCount(1);
    await expectNoProofRows(proof);
    await expectAttemptAt(
      proof,
      `Run ${String(shownRun.runId)} · attempt 1`,
      "a1b2c3d",
    );
    // One judgment and one proof listing each time.
    expect(listed() - before).toBe(2);
    expect(await verdictOf(panel)).toBe(verdict);
  };
  const summaryOf = (summarized: typeof run) =>
    summaryZipAnswer(
      proofSummary(
        summarized,
        [["tests", 1]],
        [["tests", 1, 1, "file", counts(5)]],
      ),
    );

  await test.step("expired", async () => {
    artifacts = () => runArtifactsAnswer(run, artifactId, true);
    await shows(`${unavailable} has expired.`);
  });
  await test.step("invalid", async () => {
    artifacts = () => runArtifactsAnswer(run, artifactId);
    zip = () => summaryZipAnswer({ schemaVersion: 1 });
    await shows(
      new RegExp(
        `^${unavailable} is not a valid summary\\. ci-proof-summary\\.json: .+\\.$`,
      ),
    );
  });
  await test.step("unreadable: GitHub refuses the read", async () => {
    artifacts = () => ({
      status: 403,
      contentType: "application/json",
      body: '{"message":"Resource not accessible by integration"}',
    });
    await shows(
      `${unavailable} could not be read. GitHub request repos/terryyin/open-dough/actions/runs/41/artifacts?name=ci-proof-summary-attempt-1&per_page=100 failed: HTTP 403.`,
    );
  });
  await test.step("for another attempt: never filled from it", async () => {
    artifacts = () => runArtifactsAnswer(run, artifactId);
    zip = () => summaryOf({ ...run, attempt: 2 });
    await shows(
      `${unavailable} is for another run, attempt or revision. The summary names attempt 2.`,
    );
  });
  await test.step("for another revision, once the judged commit's run is run 42", async () => {
    shownRun = { ...run, runId: 42 };
    const other = { ...shownRun, revision: "b".repeat(40) };
    artifacts = () => runArtifactsAnswer(other, artifactId + 1);
    zip = () => summaryOf(other);
    await shows(
      `${unavailable} is for another run, attempt or revision. The summary names revision ${other.revision}.`,
    );
  });
  await test.step("too large: a 1.3 MiB summary names its size as a problem", async () => {
    shownRun = run;
    artifacts = () => runArtifactsAnswer(run, artifactId);
    const text = "x".repeat(oversizedSummaryBytes);
    expect(text.length).toBeGreaterThan(SUMMARY_READ_LIMIT_BYTES);
    zip = () => ({
      status: 200,
      contentType: "application/zip",
      encoding: "base64",
      body: zipOf("ci-proof-summary.json", text).toString("base64"),
    });
    const before = listed();
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(reason).toHaveText(
      "This run's CI proof summary is 1.3 MiB, larger than the 1 MiB proof limit.",
    );
    await expect(reason).toHaveClass(/intent-ci-proof-problem/);
    expect(
      await reason.evaluate((node) => getComputedStyle(node).borderColor),
    ).toBe(await tokenColour(page, "--problem"));
    await expect(reason).toHaveCount(1);
    await expectNoProofRows(proof);
    await expectAttemptAt(
      proof,
      `Run ${String(shownRun.runId)} · attempt 1`,
      "a1b2c3d",
    );
    expect(listed() - before).toBe(2);
    expect(await verdictOf(panel)).toBe(verdict);
  });
});

test("a running result with no completed ancestor shows no completed run, so one line says there is no proof to show", async ({
  page,
}) => {
  const { published, panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer({}),
    () => [
      makeMe.aCiRun
        .with({
          headSha: judged,
          status: "in_progress",
          url: runUrl,
          databaseId: 41,
        })
        .please(),
    ],
  );
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Running at a1b2c3d (Add login)",
  );
  await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveText([
    "No completed GitHub Actions run is shown, so there is no CI proof to show.",
  ]);
  await expect(evidenceLabels(proof)).toHaveCount(0);
  expect(proofCalls(published.requests)).toEqual([]);
});
