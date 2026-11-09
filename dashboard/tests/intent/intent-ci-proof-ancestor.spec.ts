// The CI proof of a running result in Intent's CI status tab
// (../../src/IntentCiProof.tsx): a running story branch shows its completed ancestor's run's proof,
// naming that ancestor's revision and run, not the running commit's; and a
// summary already read for that run attempt is remembered, so showing the
// tab again judges again but never asks GitHub for the proof again
// (../../GITHUB-REQUESTS.md). A Summary names that same story-branch and
// ancestor evidence (../../src/IntentScopeProof.tsx). Why no proof can be shown:
// ./intent-ci-proof-reasons.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  activateIntentHome,
  chooseCiStatus,
  runUrl,
} from "../intentCiStatusPage.ts";
import { intentLocationName } from "../intentPerspectivePage.ts";
import { chooseStoryTab } from "../support/intentStoryPage.ts";
import { scopeFigures, summaryRegion } from "../intentScopeProofPage.ts";
import {
  evidenceLabels,
  expectAttemptAt,
  expectAttemptLinked,
  expectLeadingEvidenceLabels,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import {
  artifactId,
  expectProofRows,
  proofCalls,
  proofOf,
  type ProofRow,
} from "../intentCiProofPage.ts";

import { running } from "../intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  publishStoryCi,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  counts,
  proofSummary,
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../support/ciProofArtifacts.ts";
import { intentSettingsText } from "../support/intentSettingsFile.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const checksRow: ProofRow = ["tests", "5 passed test files", "No timings"];

test("a running story branch shows its completed ancestor's run's proof, and showing the tab again for that run attempt downloads nothing again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ancestor = { repository, runId: 12, attempt: 2, revision: signup };
  const ci = publishStoryCi(page, {
    ".planning/open-dough.json": intentSettingsText(
      makeMe.intentSettings
        .withLocations(
          makeMe.anIntentLocation
            .at("tests")
            .ofKind("shell", ["*.sh"])
            .please(),
        )
        .please(),
    ),
    "tests/a.sh": "#!/usr/bin/env bash\n",
  });
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
    [["tests", 1, 1, "file", counts(5)]],
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
  // The trunk's homepage shows its own run 11 and reads that run's proof;
  // its read settles before the story's proof calls are counted.
  const trunkProof = proofOf(await chooseCiStatus(parts(page).intent));
  await expectAttemptAt(trunkProof, "Run 11 · attempt 1", "4774f60");
  await expect(
    trunkProof.locator(".intent-ci-proof-unavailable"),
  ).toBeVisible();
  const before = proofCalls(calls).length;
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);

  await test.step("Proof names the ancestor's revision and run, not the running commit", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Running at 70a0001 (Start the story)",
    );
    await expectLeadingEvidenceLabels(evidenceLabels(proof), [
      "Run 12 · attempt 2",
      "Revision d4e5f6a",
      "Completed ancestor",
    ]);
    await expectLabelInFull(
      proof,
      "Completed ancestor",
      "The completed ancestor of the running result",
    );
    await expectAttemptLinked(proof, "Run 12 · attempt 2", mainRun);
    // A screen reader in browse mode hears each label from its content.
    await expect(evidenceLabels(proof)).toMatchAriaSnapshot(`
      - list "CI evidence":
        - listitem:
          - link "Run 12 · attempt 2"
        - listitem:
          - text: Revision
          - code: d4e5f6a
        - listitem: Completed ancestor , The completed ancestor of the running result
        - listitem: CI wall time not recorded , This attempt's CI read has no start and completion times.
    `);
    await expectProofRows(proof, [checksRow]);
    await expect(proof).not.toContainText("70a0001");
    expect(proofCalls(calls).slice(before)).toEqual([
      "artifacts of run 12: ci-proof-summary-attempt-2",
      `zip ${String(artifactId)}`,
    ]);
  });

  await test.step("a Summary names that story branch's ancestor evidence and its counts", async () => {
    const intent = parts(page).intent;
    await chooseStoryTab(intent, "Changed tests");
    await intentLocationName(intent, "tests").click();
    const summary = summaryRegion(intent);
    await expectLeadingEvidenceLabels(evidenceLabels(summary), [
      "Run 12 · attempt 2",
      "Revision d4e5f6a",
      `Branch ${running.branch}`,
      "Completed ancestor",
    ]);
    await expectLabelInFull(
      summary,
      `Branch ${running.branch}`,
      `The story branch of ${running.title}`,
    );
    await expect(
      scopeFigures(summary, "tests").getByRole("definition"),
    ).toHaveText([...checksRow.slice(1), "1 of 1 part present"]);
    expect(proofCalls(calls).slice(before)).toHaveLength(2);
    await activateIntentHome(intent);
  });

  await test.step("shown again, the tab judges again and shows the remembered proof without asking GitHub for it", async () => {
    const judgedBefore = calls.filter(
      ({ request }) => request.kind === "actions-runs",
    ).length;
    const proofBefore = proofCalls(calls).length;
    const { development, intentChoice } = parts(page);
    await development.click();
    await intentChoice.click();
    // Kept answer shows the proof at once; wait for the fresh judgment so
    // the re-read's actions-runs are counted before asserting.
    await expectProofRows(proof, [checksRow]);
    await expectAttemptAt(proof, "Run 12 · attempt 2", "d4e5f6a");
    await expect(panel.locator(".intent-ci-checking")).toHaveCount(0);
    await expect(panel.getByRole("status")).toContainText("Checked at");
    expect(
      calls.filter(({ request }) => request.kind === "actions-runs").length,
    ).toBeGreaterThan(judgedBefore);
    expect(proofCalls(calls).length).toBe(proofBefore);
  });
});
