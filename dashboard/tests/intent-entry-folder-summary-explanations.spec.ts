// Summary pages for non-Gherkin, undeclared-proof, and unreadable declared
// proof reuse the same absent-Proof wording as file Proof
// (../src/IntentSummary.tsx, ../src/IntentProofAbsence.tsx). Gherkin without
// proof still gives scenario statistics, including Partial totals. Companion
// to ./intent-entry-folder-summaries.spec.ts caret/name selection coverage.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  intentGroupToggle,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { holdAuthenticatedReadsOf } from "./holdAuthenticatedReads.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  doughnut,
  doughnutFeature,
  doughnutFeaturePath,
  doughnutOtherFeature,
  doughnutOtherFeaturePath,
  doughnutSettings,
  featuresPath,
  openDough,
  openDoughSettings,
  openDoughSpec,
  proofRunPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
} from "./intentEntryFolderSummariesFixtures.ts";

const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

test("Gherkin without proof and typescript summaries reuse absent-Proof wording", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, doughnutSettings, {
    [doughnutFeaturePath]: doughnutFeature,
    [doughnutOtherFeaturePath]: doughnutOtherFeature,
  });
  await publishIntentProject(page, openDough, openDoughSettings, {
    "dashboard/tests/intent-entry-folder-summaries.spec.ts": openDoughSpec,
    "dashboard/tests/helper.ts": "export const helper = 1;\n",
  });

  await test.step("Gherkin without proof: summary gives file and scenario counts and Proof is not recorded", async () => {
    await openUntilRead(page, "/?project=doughnut&perspective=intent");
    const { intent } = parts(page);
    await intentLocationName(intent, "e2e_test/features").click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("e2e_test/features");
    await expect(summary).toContainText("2 files");
    await expect(
      summary.getByText("3 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).toContainText(
      "Proof is not recorded for this project.",
    );
    await expect(summary).toContainText(
      "dough-test-optimization/references/cucumber-proof.md",
    );
    await expect(summary).not.toContainText("Summed duration");
    await expect(
      intentGroupToggle(intent, "e2e_test/features"),
    ).toHaveAttribute("aria-expanded", "false");
  });

  await test.step("Gherkin without proof also labels Partial scenario totals while a file is held", async () => {
    const held = await holdAuthenticatedReadsOf(
      page,
      doughnutOtherFeaturePath,
      releases,
    );
    await page.reload();
    await openUntilRead(page, "/?project=doughnut&perspective=intent");
    const { intent } = parts(page);
    await intentLocationName(intent, "e2e_test/features").click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect.poll(held.held).toBeGreaterThan(0);
    await expect(summary).toContainText("Partial:");
    await expect(summary).toContainText("across 1 of 2 files");
    await expect(summary).toContainText("1 file reading");
    await expect(summary).toContainText(
      "Proof is not recorded for this project.",
    );
    held.release();
    await expect(
      summary.getByText("3 scenarios", { exact: true }),
    ).toBeVisible();
    await expect(summary).not.toContainText("Partial:");
  });

  await test.step("typescript location: summary gives file count and the kinds Proof is read for", async () => {
    await page.goto("/?project=open-dough&perspective=intent");
    await openUntilRead(page, "/?project=open-dough&perspective=intent");
    const { intent } = parts(page);
    await intentLocationName(intent, "dashboard/tests").click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText("dashboard/tests");
    await expect(summary).toContainText("1 file");
    await expect(summary).toContainText(
      "Proof is read for Gherkin feature files and pytest files so far.",
    );
    await expect(summary).not.toContainText("Summed duration");
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
      ...pygardonFeatureSources,
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
  await expect(summary.getByText("9 scenarios", { exact: true })).toBeVisible();
  const alert = summary.getByRole("alert");
  await expect(alert).toContainText(
    `Proof could not be read: ${proofRunPath} could not be read at this revision.`,
  );
  await expect(alert.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(summary).not.toContainText("Summed duration");
});
