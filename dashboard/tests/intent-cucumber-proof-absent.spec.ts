// Intent's Proof pane tells apart a project that records no proof, a
// declared proof directory with nothing observed yet for the selected file,
// and proof that could not be read (../src/IntentProof.tsx,
// ../server/intentProofRead.ts): a Doughnut-like project without a declared
// proof directory names the installed reference to follow; a Pygardon-like
// project's absent proof directory, or proof of its other feature only, says
// no successful proof is recorded; a truncated proof file and a proof file
// whose read failed each read as a read failure with a Retry that reads the
// proof again, distinct from No successful proof. Purpose stays readable in every case.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  countLocationsReads,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { filesOf } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";
import {
  doughnut,
  nodeTest,
  publishIntentProject,
  pygardon,
} from "./intentCodeBrowseFixtures.ts";
import {
  featurePath,
  otherFeature,
  otherFeatureOnlyFiles,
  otherPath,
  proofDirectory,
  publishedFeature,
  runFiles,
  settings,
  truncatedFiles,
  truncatedPath,
} from "./intentCucumberProofFixtures.ts";

const doughnutFeature = "e2e_test/features/recall.feature";
const doughnutScript = "scripts/recall.test.mjs";
const doughnutSettings = JSON.stringify({
  intent: {
    locations: [
      { path: "e2e_test/features", kind: "gherkin" },
      { path: "scripts", kind: "javascript", include: ["**/*.test.mjs"] },
    ],
  },
});

const features = { [featurePath]: publishedFeature, [otherPath]: otherFeature };

// Opens Pygardon's Intent and selects its jobs feature; Purpose reads it.
async function selectJobsFeature(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  const purpose = intent.getByLabel(`${featurePath} source`);
  await expect(purpose).toContainText("Feature: Jobs");
  return {
    intent,
    purpose,
    proof: await chooseReadingTab(intent, "Proof"),
  };
}

test("Ex 8: a project without declared proof says Proof is not recorded and names the reference", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, doughnutSettings, {
    [doughnutFeature]: "Feature: Recall\n  Scenario: Recall a note\n",
    [doughnutScript]: nodeTest,
  });
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await intent
    .getByRole("button", { name: doughnutFeature, exact: true })
    .click();
  await expect(intent.getByLabel(`${doughnutFeature} source`)).toContainText(
    "Scenario: Recall a note",
  );
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(
    "Proof is not recorded for this project. To configure deliberate proof generation, follow dough-test-optimization/references/cucumber-proof.md in this project’s installed Open Dough skills.",
  );
  await expect(proof.getByRole("alert")).toHaveCount(0);
  await expect(proof).not.toContainText(
    /no successful proof|could not be read/i,
  );

  await test.step("a non-Gherkin source does not offer Cucumber adoption", async () => {
    await expandIntentGroup(intent, "scripts");
    await intent
      .getByRole("button", { name: doughnutScript, exact: true })
      .click();
    await expect(intent.getByLabel(`${doughnutScript} source`)).toContainText(
      "assert.equal",
    );
    await expect(proof).toContainText(
      "Intent reads Proof only for Gherkin feature files so far.",
    );
    await expect(proof).not.toContainText("cucumber-proof.md");
  });
});

for (const [situation, proofFiles] of [
  ["an absent proof directory", {}],
  ["proof of the other feature only", otherFeatureOnlyFiles],
] as const) {
  test(`a declared proof directory with nothing for this file says no successful proof is recorded: ${situation}`, async ({
    page,
  }) => {
    await publishIntentProject(page, pygardon, settings, {
      ...features,
      ...proofFiles,
    });
    const { proof } = await selectJobsFeature(page);
    await expect(proof).toContainText(
      `No successful proof recorded for this file in ${proofDirectory}.`,
    );
    await expect(
      proof.getByRole("table", { name: `${featurePath} proof` }),
    ).toContainText("Archive a job");
    await expect(proof.getByRole("alert")).toHaveCount(0);
    await expect(proof).not.toContainText(/not recorded|could not be read/i);
  });
}

test("Ex 8: a truncated proof file reads as a read failure with retry while Purpose stays readable", async ({
  page,
}) => {
  const locationsReads = countLocationsReads(page);
  await publishIntentProject(page, pygardon, settings, {
    ...features,
    ...truncatedFiles,
  });
  const { intent, purpose, proof } = await selectJobsFeature(page);
  const alert = proof.getByRole("alert");
  await expect(alert).toContainText(
    `Proof could not be read: ${truncatedPath} is not a valid proof file.`,
  );
  await expect(proof).not.toContainText(/no successful proof|not recorded/i);
  await expect(proof.getByRole("table")).toHaveCount(0);
  const before = locationsReads();
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect.poll(locationsReads).toBe(before + 1);
  await expect(alert).toContainText(
    `${truncatedPath} is not a valid proof file.`,
  );
  await chooseReadingTab(intent, "Purpose");
  await expect(purpose).toContainText("Feature: Jobs");
});

test("a failed proof file read says so; Retry reads the proof again and shows it beside the same Purpose", async ({
  page,
}) => {
  await publishFiles(page, {
    repository: pygardon.repository,
    ref: pygardon.ref,
    revision: pygardon.revision,
    files: {
      ...filesOf(pygardon),
      ".planning/open-dough.json": `${settings}\n`,
      ...features,
      ...runFiles,
    },
    unanswered: [truncatedPath],
  });
  const { intent, purpose, proof } = await selectJobsFeature(page);
  const alert = proof.getByRole("alert");
  await expect(alert).toContainText(
    `Proof could not be read: ${truncatedPath} could not be read at this revision.`,
  );
  await expect(proof).not.toContainText(/no successful proof|not recorded/i);

  // The read failure clears: GitHub answers the same revision's file now.
  const requests = await publishIntentProject(page, pygardon, settings, {
    ...features,
    ...runFiles,
  });
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect(proof).toContainText(
    "5 scenarios: 2 passed, 1 passed after retry, 2 without successful proof",
  );
  await expect(proof.getByRole("alert")).toHaveCount(0);
  await chooseReadingTab(intent, "Purpose");
  await expect(purpose).toContainText("Feature: Jobs");
  expect(
    requests.filter(
      ({ request }) =>
        request.kind === "content" && request.path === truncatedPath,
    ),
  ).toHaveLength(1);
});
