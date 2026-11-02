// Summary pages for non-Gherkin, undeclared-proof, and unreadable declared
// proof reuse the same absent-Proof wording as file Proof
// (../src/IntentSummary.tsx, ../src/IntentProofProblem.tsx). Companion to
// ./intent-entry-folder-summaries.spec.ts caret/name selection coverage.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  doughnut,
  doughnutFeaturePath,
  doughnutSettings,
  featuresPath,
  jobsOtherFeature,
  jobsOtherPath,
  openDough,
  openDoughSettings,
  openDoughSpec,
  packagedFeature,
  packagedFeaturePath,
  proofRunPath,
  publishIntentProject,
  pygardon,
  pygardonProofFiles,
  pygardonSettings,
  reportsFeature,
  reportsFeaturePath,
  stooqFeature,
  stooqPath,
  topFeature,
  topFeaturePath,
} from "./intentEntryFolderSummariesFixtures.ts";

test("Gherkin without proof and typescript summaries reuse absent-Proof wording", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, doughnutSettings, {
    [doughnutFeaturePath]:
      "Feature: Recall a note\n  Scenario: Recall\n    Given a note\n",
  });
  await publishIntentProject(page, openDough, openDoughSettings, {
    "dashboard/tests/intent-entry-folder-summaries.spec.ts": openDoughSpec,
    "dashboard/tests/helper.ts": "export const helper = 1;\n",
  });

  await test.step("Gherkin without proof: summary gives file count and Proof is not recorded", async () => {
    await openUntilRead(page, "/?project=doughnut&perspective=intent");
    const { intent } = parts(page);
    await intentLocationName(intent, "e2e_test/features").click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("e2e_test/features");
    await expect(summary).toContainText("1 file");
    await expect(summary).toContainText(
      "Proof is not recorded for this project.",
    );
    await expect(summary).toContainText(
      "dough-test-optimization/references/cucumber-proof.md",
    );
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "false");
  });

  await test.step("typescript location: summary gives file count and Gherkin-only Proof wording", async () => {
    await page.goto("/?project=open-dough&perspective=intent");
    await openUntilRead(page, "/?project=open-dough&perspective=intent");
    const { intent } = parts(page);
    await intentLocationName(intent, "dashboard/tests").click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("dashboard/tests");
    await expect(summary).toContainText("1 file");
    await expect(summary).toContainText(
      "Intent reads Proof only for Gherkin feature files so far.",
    );
  });
});

test("commitments 56/58: summary of a location with unreadable declared proof keeps statistics and ProofProblem retry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  // Unanswered before any successful pin of this proof path (same pattern as
  // intent-cucumber-proof-absent's failed proof read).
  await publishFiles(page, {
    repository: pygardon.repository,
    ref: pygardon.ref,
    revision: pygardon.revision,
    files: {
      ...filesOf(pygardon),
      ".planning/open-dough.json": `${pygardonSettings}\n`,
      [stooqPath]: stooqFeature,
      [jobsOtherPath]: jobsOtherFeature,
      [reportsFeaturePath]: reportsFeature,
      [topFeaturePath]: topFeature,
      [packagedFeaturePath]: packagedFeature,
      ...pygardonProofFiles,
    },
    unanswered: [proofRunPath],
  });
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await intentLocationName(intent, featuresPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary).toContainText(featuresPath);
  await expect(summary).toContainText("4 files");
  const alert = summary.getByRole("alert");
  await expect(alert).toContainText(
    `Proof could not be read: ${proofRunPath} could not be read at this revision.`,
  );
  await expect(alert.getByRole("button", { name: "Retry" })).toBeVisible();
});
