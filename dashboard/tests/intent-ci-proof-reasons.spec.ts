// Why Intent's CI status tab shows no CI proof (../src/IntentCiProof.tsx):
// when the shown run's
// summary has expired, cannot be read, is invalid, or is for another
// attempt or revision, when the project's CI is read through a ciAdapter,
// or when no completed run is shown, one line under Proof says why, and the
// judgment reads exactly as with no summary; Check again reads both again.
// A run with a summary or a gap, and one browser refusal:
// ./intent-ci-proof.spec.ts; query-shape refusals:
// ../../tests/support/dashboard-ci-proof-parse.test.mjs; a running
// result's ancestor proof and the per-attempt memory:
// ./intent-ci-proof-ancestor.spec.ts.

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus, judged, runUrl } from "./intentCiStatusPage.ts";
import {
  artifactId,
  failedVerdict,
  openFailedRun,
  proofCalls,
  proofOf,
  run,
  verdictOf,
} from "./intentCiProofPage.ts";
import { login, mainRun, publishStoryCi } from "./intentCiStoryRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import type { OriginAnswer } from "./originAnswers.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "./support/ciProofArtifacts.ts";

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
      {
        headSha: judged,
        conclusion: "failure",
        id: shownRun.runId,
        url: runUrl,
      },
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
    await expect(proof.getByRole("listitem")).toHaveCount(0);
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      `Attempt 1 of run ${String(shownRun.runId)} at a1b2c3d.`,
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
        [["tests", 1, 1, "checks", counts(5)]],
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
});

test("a ciAdapter project gives one reason under Proof without asking GitHub for proof", async ({
  page,
  dashboard,
}) => {
  const project = path.join(dashboard.home, "git", "open-dough");
  const adapter = "scripts/ci-proof-fixture-adapter.mjs";
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, adapter),
    `for await (const chunk of process.stdin) void chunk;
process.stdout.write(JSON.stringify({ attempts: [{ runId: "a1", attemptId: "1", sha: ${JSON.stringify(login)}, outcome: "success", url: ${JSON.stringify(mainRun)}, time: "2026-10-01T00:00:00Z", branch: "main" }] }));
`,
  );
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, adapter] })}\n`,
  );
  const ci = publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const panel = await chooseCiStatus(parts(page).intent);

  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Passed at 4774f60 (Add login)",
  );
  await expect(
    proofOf(panel).locator(".intent-ci-proof-unavailable"),
  ).toHaveText([
    "This project's CI is read through a ciAdapter, which publishes no CI proof summary.",
  ]);
  expect(
    ci.published.requests.filter(({ request }) =>
      request.kind.startsWith("actions-"),
    ),
  ).toEqual([]);
});

test("a running result with no completed ancestor shows no completed run, so one line says there is no proof to show", async ({
  page,
}) => {
  const { published, panel, proof } = await openFailedRun(
    page,
    () => runArtifactsAnswer(run, artifactId),
    () => summaryZipAnswer({}),
    () => [{ headSha: judged, status: "in_progress", url: runUrl, id: 41 }],
  );
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Running at a1b2c3d (Add login)",
  );
  await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveText([
    "No completed GitHub Actions run is shown, so there is no CI proof to show.",
  ]);
  await expect(proof.locator(".intent-ci-proof-run")).toHaveCount(0);
  expect(proofCalls(published.requests)).toEqual([]);
});
