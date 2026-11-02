// Intent's Proof pane for Doughnut's committed Cypress-Cucumber proof
// (../src/IntentProof.tsx, ../server/intentProofRead.ts): the same proof
// bytes Doughnut published under e2e_test/proof for note_creation.feature
// and account_control.feature (Scenario Outline example cells) show each
// scenario/outline row's last successful proof, duration, time, commit, and
// file-version match beside Purpose; a sibling feature with no success in
// those runs stays explicit (product still says Not observed until SEED-220).
// Pins the live Doughnut Intent read as a regression; does not replace it.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  accountControlFeature,
  accountControlPath,
  cypressRetryFeature,
  cypressRetryPath,
  doughnutProofSettings,
  expectedAccountControlRows,
  expectedCypressRetryRows,
  expectedNoteCreationRows,
  noteCreationFeature,
  noteCreationObservedAt,
  noteCreationPath,
  noteDeletionFeature,
  noteDeletionPath,
  outlineObservedAt,
  proofFiles,
  proofHeader,
  retryObservedAt,
} from "./intentDoughnutCucumberProofFixtures.ts";

async function openDoughnutFeature(
  page: Page,
  {
    now,
    files,
    featurePath,
    sourceMarker,
  }: {
    now: Date;
    files: Record<string, string>;
    featurePath: string;
    sourceMarker: string;
  },
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(now);
  await publishIntentProject(page, doughnut, doughnutProofSettings, files);
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await intent.getByRole("button", { name: featurePath, exact: true }).click();
  await expect(intent.getByLabel(`${featurePath} source`)).toContainText(
    sourceMarker,
  );
  const proof = await chooseReadingTab(intent, "Proof");
  return { intent, proof };
}

async function proofTableCells(table: Locator) {
  return table
    .getByRole("row")
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) =>
          cell.textContent.trim(),
        ),
      ),
    );
}

test("Intent Proof shows Doughnut's committed Cypress-Cucumber proof for note_creation", async ({
  page,
}) => {
  const { intent, proof } = await openDoughnutFeature(page, {
    now: noteCreationObservedAt,
    files: {
      [noteCreationPath]: noteCreationFeature,
      [noteDeletionPath]: noteDeletionFeature,
      [accountControlPath]: accountControlFeature,
      ...proofFiles,
    },
    featurePath: noteCreationPath,
    sourceMarker: "Feature: Nested Note creation",
  });

  const table = proof.getByRole("table", {
    name: `${noteCreationPath} proof`,
  });
  await expect(table).toBeVisible();
  await expect(proof).toContainText("9 scenarios: 9 passed");
  await expect(proof).not.toContainText(/green|all passed|suite/i);
  expect(await proofTableCells(table)).toEqual([
    proofHeader,
    ...expectedNoteCreationRows,
  ]);

  await test.step("a Doughnut feature without successful proof reads No successful proof", async () => {
    await intent
      .getByRole("button", { name: noteDeletionPath, exact: true })
      .click();
    await expect(intent.getByLabel(`${noteDeletionPath} source`)).toContainText(
      "Scenario: Trash a note",
    );
    const unobserved = proof.getByRole("table", {
      name: `${noteDeletionPath} proof`,
    });
    await expect(proof).toContainText(
      "No successful proof recorded for this file in e2e_test/proof.",
    );
    await expect(unobserved).toContainText("No successful proof");
    await expect(unobserved.getByRole("row")).toHaveCount(2);
    await expect(unobserved.getByRole("row").nth(1)).toContainText(
      "Trash a note",
    );
    await expect(unobserved.getByRole("row").nth(1)).toContainText(
      "No successful proof",
    );
  });
});

test("Intent Proof shows Doughnut Scenario Outline rows with example cells", async ({
  page,
}) => {
  const { proof } = await openDoughnutFeature(page, {
    now: outlineObservedAt,
    files: {
      [noteCreationPath]: noteCreationFeature,
      [accountControlPath]: accountControlFeature,
      ...proofFiles,
    },
    featurePath: accountControlPath,
    sourceMarker: "Scenario Outline: Only admins can open failure reports",
  });

  const table = proof.getByRole("table", {
    name: `${accountControlPath} proof`,
  });
  await expect(table).toBeVisible();
  await expect(proof).toContainText("3 scenarios: 3 passed");
  await expect(proof).not.toContainText(/green|all passed|suite/i);
  expect(await proofTableCells(table)).toEqual([
    proofHeader,
    ...expectedAccountControlRows,
  ]);
});

test("Intent Proof shows Doughnut retry-assisted pass with attempt count", async ({
  page,
}) => {
  const { proof } = await openDoughnutFeature(page, {
    now: retryObservedAt,
    files: {
      [cypressRetryPath]: cypressRetryFeature,
      ...proofFiles,
    },
    featurePath: cypressRetryPath,
    sourceMarker: "Scenario: Retry succeeds",
  });

  const table = proof.getByRole("table", {
    name: `${cypressRetryPath} proof`,
  });
  await expect(table).toBeVisible();
  await expect(proof).toContainText("1 scenario: 1 passed after retry");
  await expect(proof).not.toContainText(/green|all passed|suite/i);
  expect(await proofTableCells(table)).toEqual([
    proofHeader,
    ...expectedCypressRetryRows,
  ]);
});
