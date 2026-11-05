// Intent explains pytest Proof it cannot show (../src/IntentProofProblem.tsx,
// ../server/intentProofRead.ts): a `python` location without declared proof
// names the pytest reference; a `shell` location says which files Proof is
// read for; a snapshot that is not pytest proof, such as one in Cucumber's
// fields, reads as not a valid proof file with a Retry, and a pytest
// snapshot under a Gherkin location's proof directory likewise. Purpose and
// the summary's inventory stay readable in each case. Vitest reference
// wording: ./intent-vitest-proof-absent.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  countLocationsReads,
  expandIntentGroup,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  cucumberShapedFiles,
  settings,
  settingsWithoutProof,
  snapshotFiles,
  snapshotPath,
} from "./intentPytestProofFixtures.ts";
import {
  corsPath,
  shellPath,
  sources,
  testsPath,
} from "./intentPytestSourceFixtures.ts";
import { proofReadForFamiliesSoFar } from "./intentProofAbsenceText.ts";

const notRecorded =
  "Proof is not recorded for this project. To configure deliberate proof generation, follow dough-test-optimization/references/pytest-proof.md in this project’s installed Open Dough skills.";

async function openPygardon(page: Parameters<typeof parts>[0]) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  return parts(page).intent;
}

async function selectCors(intent: ReturnType<typeof parts>["intent"]) {
  await expandIntentGroup(intent, testsPath);
  await intent.getByRole("button", { name: corsPath, exact: true }).click();
  const purpose = intent.getByLabel(`${corsPath} source`);
  await expect(purpose).toContainText("def test_rounding(direction):");
  return { purpose, proof: await chooseReadingTab(intent, "Proof") };
}

test("a python location without proof names the pytest reference; a shell location names the kinds Proof is read for", async ({
  page,
}) => {
  await publishIntentProject(page, pygardon, settingsWithoutProof, sources);
  const intent = await openPygardon(page);

  await test.step("python file Proof and location summary say proof is not recorded", async () => {
    const { proof } = await selectCors(intent);
    await expect(proof).toContainText(notRecorded);
    await expect(proof.getByRole("table")).toHaveCount(0);
    await expect(proof).not.toContainText(
      /no successful proof|could not be read|cucumber-proof/i,
    );
    await intentLocationName(intent, testsPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(
      summary.getByText("11 test functions", { exact: true }),
    ).toBeVisible();
    await expect(summary).toContainText(notRecorded);
    await expect(summary).not.toContainText("Last successful proof");
  });

  await test.step("shell file Proof and location summary name the kinds Proof is read for", async () => {
    await expandIntentGroup(intent, "scripts");
    await intent.getByRole("button", { name: shellPath, exact: true }).click();
    await expect(intent.getByLabel(`${shellPath} source`)).toContainText(
      "echo ok",
    );
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof).toContainText(proofReadForFamiliesSoFar);
    await expect(proof).not.toContainText("pytest-proof.md");
    await intentLocationName(intent, "scripts").click();
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      proofReadForFamiliesSoFar,
    );
  });
});

test("a pytest snapshot in Cucumber's fields is not a valid proof file, with Retry, while Purpose stays readable", async ({
  page,
}) => {
  const locationsReads = countLocationsReads(page);
  await publishIntentProject(page, pygardon, settings, {
    ...sources,
    ...cucumberShapedFiles,
  });
  const intent = await openPygardon(page);
  const { purpose, proof } = await selectCors(intent);
  const malformed = `Proof could not be read: ${snapshotPath} is not a valid proof file.`;
  const alert = proof.getByRole("alert");
  await expect(alert).toContainText(malformed);
  await expect(proof.getByRole("table")).toHaveCount(0);
  await expect(proof).not.toContainText(/no successful proof|not recorded/i);
  const before = locationsReads();
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect.poll(locationsReads).toBe(before + 1);
  await expect(alert).toContainText(malformed);
  await chooseReadingTab(intent, "Purpose");
  await expect(purpose).toContainText("def test_rounding(direction):");

  await test.step("the location summary keeps its inventory and the same explanation", async () => {
    await intentLocationName(intent, testsPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(
      summary.getByText("11 test functions", { exact: true }),
    ).toBeVisible();
    await expect(summary.getByRole("alert")).toContainText(malformed);
  });
});

test("a pytest snapshot under a Gherkin location's proof directory is not a valid proof file", async ({
  page,
}) => {
  const featurePath = "e2e_test/features/jobs.feature";
  const gherkinSnapshot = "e2e_test/proof/latest.json";
  await publishIntentProject(
    page,
    pygardon,
    JSON.stringify({
      intent: {
        locations: [
          {
            path: "e2e_test/features",
            kind: "gherkin",
            proof: "e2e_test/proof",
          },
        ],
      },
    }),
    {
      [featurePath]: "Feature: Jobs\n  Scenario: List jobs\n    Given a job\n",
      [gherkinSnapshot]: snapshotFiles[snapshotPath],
    },
  );
  const intent = await openPygardon(page);
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof.getByRole("alert")).toContainText(
    `Proof could not be read: ${gherkinSnapshot} is not a valid proof file.`,
  );
});
