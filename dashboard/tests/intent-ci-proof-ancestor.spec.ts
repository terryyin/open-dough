// The CI proof of a running result in Intent's CI status tab
// (../src/IntentCiProof.tsx): a running story branch shows its completed ancestor's run's proof,
// naming that ancestor's revision and run, not the running commit's; and a
// summary already read for that run attempt is remembered, so showing the
// tab again judges again but never asks GitHub for the proof again
// (../GITHUB-REQUESTS.md). Why no proof can be shown:
// ./intent-ci-proof-reasons.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus, runUrl } from "./intentCiStatusPage.ts";
import { artifactId, proofCalls, proofOf } from "./intentCiProofPage.ts";
import { running } from "./intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  publishStoryCi,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "./intentCiStoryRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "./support/ciProofArtifacts.ts";

test.setTimeout(90_000);

test("a running story branch shows its completed ancestor's run's proof, and showing the tab again for that run attempt downloads nothing again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ancestor = { repository, runId: 12, attempt: 2, revision: signup };
  const ci = publishStoryCi(page);
  ci.runs.main = [
    { headSha: login, conclusion: "success", url: mainRun, id: 11 },
    {
      headSha: signup,
      conclusion: "success",
      url: mainRun,
      id: 12,
      attempt: 2,
    },
  ];
  ci.runs[running.branch] = [
    { headSha: started, status: "in_progress", url: runUrl, id: 13 },
  ];
  const summary = proofSummary(
    ancestor,
    [["tests", 1]],
    [["tests", 1, 1, "checks", counts(5)]],
  );
  ci.published.serveCi((call) => {
    const { kind } = call.request;
    if (kind === "actions-run-artifacts")
      return runArtifactsAnswer(ancestor, artifactId);
    if (kind === "actions-artifact-zip") return summaryZipAnswer(summary);
    return ci.answer(call);
  });
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const before = proofCalls(calls).length;
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);

  await test.step("Proof names the ancestor's revision and run, not the running commit", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Running at 70a0001 (Start the story)",
    );
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 2 of run 12 at d4e5f6a.",
    );
    await expect(proof.getByRole("link", { name: "run 12" })).toHaveAttribute(
      "href",
      mainRun,
    );
    await expect(proof.getByRole("listitem")).toHaveText([
      "tests: 5 passed checks; test execution time not recorded: this summary has no test execution durations; 1 of 1 part present.",
    ]);
    await expect(proof).not.toContainText("70a0001");
    expect(proofCalls(calls).slice(before)).toEqual([
      "artifacts of run 12: ci-proof-summary-attempt-2",
      `zip ${String(artifactId)}`,
    ]);
  });

  await test.step("shown again, the tab judges again and shows the remembered proof without asking GitHub for it", async () => {
    const judgedBefore = calls.filter(
      ({ request }) => request.kind === "actions-runs",
    ).length;
    const proofBefore = proofCalls(calls).length;
    const { development, intentChoice } = parts(page);
    await development.click();
    await intentChoice.click();
    await expect(proof.getByRole("listitem")).toHaveText([
      "tests: 5 passed checks; test execution time not recorded: this summary has no test execution durations; 1 of 1 part present.",
    ]);
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 2 of run 12 at d4e5f6a.",
    );
    expect(
      calls.filter(({ request }) => request.kind === "actions-runs").length,
    ).toBeGreaterThan(judgedBefore);
    expect(proofCalls(calls).length).toBe(proofBefore);
  });
});
