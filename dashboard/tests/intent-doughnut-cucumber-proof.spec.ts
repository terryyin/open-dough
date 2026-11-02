// Intent's Proof pane for Doughnut's committed Cypress-Cucumber proof
// (../src/IntentProof.tsx, ../server/intentProofRead.ts): the same proof
// bytes Doughnut published under e2e_test/proof for note_creation.feature
// show each scenario's latest outcome, duration, time, commit, and
// file-version match beside Purpose; a sibling feature with no observations
// in that run reads Not observed. This pins the live Doughnut Intent read
// as a regression; it does not replace that live observation.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { expandIntentGroup } from "./intentPerspectivePage.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  doughnutProofSettings,
  expectedNoteCreationRows,
  noteCreationFeature,
  noteCreationPath,
  noteDeletionFeature,
  noteDeletionPath,
  observedAt,
  proofFiles,
  proofHeader,
} from "./intentDoughnutCucumberProofFixtures.ts";

test("Intent Proof shows Doughnut's committed Cypress-Cucumber observations for note_creation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(observedAt);
  await publishIntentProject(page, doughnut, doughnutProofSettings, {
    [noteCreationPath]: noteCreationFeature,
    [noteDeletionPath]: noteDeletionFeature,
    ...proofFiles,
  });

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, "e2e_test/features");
  await intent
    .getByRole("button", { name: noteCreationPath, exact: true })
    .click();
  await expect(intent.getByLabel(`${noteCreationPath} source`)).toContainText(
    "Feature: Nested Note creation",
  );

  const proof = intent.getByRole("region", { name: "Proof" });
  const table = proof.getByRole("table", {
    name: `${noteCreationPath} proof`,
  });
  await expect(table).toBeVisible();
  await expect(proof).toContainText("9 scenarios: 9 passed");
  await expect(proof).not.toContainText(/green|all passed|suite/i);
  const cells = await table
    .getByRole("row")
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) =>
          cell.textContent.trim(),
        ),
      ),
    );
  expect(cells).toEqual([proofHeader, ...expectedNoteCreationRows]);

  await test.step("an unobserved Doughnut feature reads Not observed", async () => {
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
      "Nothing has been observed yet for this file in e2e_test/proof.",
    );
    await expect(unobserved).toContainText("Not observed");
    await expect(unobserved.getByRole("row")).toHaveCount(2);
    await expect(unobserved.getByRole("row").nth(1)).toContainText(
      "Trash a note",
    );
    await expect(unobserved.getByRole("row").nth(1)).toContainText(
      "Not observed",
    );
  });
});
