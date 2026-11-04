// Intent explains Vitest Proof it cannot show (../src/IntentProofProblem.tsx,
// ../server/intentLocationsRead.ts, ../server/intentProofRead.ts): a
// `typescript` location declaring `proof` without a `runner`, or with one
// Intent reads no proof for, says the `runner` setting is the problem while
// its files and inventory stay readable; a pytest-shaped snapshot under a
// Vitest location reads as not a valid proof file with a Retry; a
// `typescript` location without `proof` names the Vitest reference; and a
// `shell` location names the families Proof is read for so far.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  countLocationsReads,
  expandIntentFolders,
  expandIntentGroup,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  pytestShapedFiles,
  settings,
  settingsWithoutProof,
  settingsWithoutRunner,
  settingsWithUnreadRunner,
  snapshotFiles,
  snapshotPath,
} from "./intentVitestProofFixtures.ts";
import {
  datesPath,
  locationPath,
  scriptPath,
  sources,
} from "./intentVitestSourceFixtures.ts";
import { proofReadForFamiliesSoFar } from "./intentProofAbsenceText.ts";

const notRecorded =
  "Proof is not recorded for this project. To configure deliberate proof generation, follow dough-test-optimization/references/vitest-proof.md in this project’s installed Open Dough skills.";
const setRunner = `Set runner on ${locationPath} in .planning/open-dough.json to the runner that records its proof: vitest.`;

async function openDoughnut(
  page: Page,
  settings: string,
  proofFiles: Record<string, string>,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishIntentProject(page, doughnut, settings, {
    ...sources,
    ...proofFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  return parts(page).intent;
}

async function selectDates(intent: ReturnType<typeof parts>["intent"]) {
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent.getByRole("button", { name: datesPath, exact: true }).click();
  const purpose = intent.getByLabel(`${datesPath} source`);
  await expect(purpose).toContainText('it("pads months"');
  return { purpose, proof: await chooseReadingTab(intent, "Proof") };
}

for (const [situation, problemSettings, problem] of [
  [
    "without a runner",
    settingsWithoutRunner,
    "runner is not declared for this location’s proof.",
  ],
  [
    "with a runner Intent reads no proof for",
    settingsWithUnreadRunner,
    "runner jest is not a runner Intent reads proof for.",
  ],
] as const) {
  test(`a typescript location declaring proof ${situation} explains the runner setting, with its files and inventory readable`, async ({
    page,
  }) => {
    const intent = await openDoughnut(page, problemSettings, snapshotFiles);
    const { proof } = await selectDates(intent);
    await expect(proof).toContainText(`${problem} ${setRunner}`);
    await expect(proof.getByRole("table")).toHaveCount(0);
    await expect(proof.getByRole("alert")).toHaveCount(0);
    await expect(proof).not.toContainText(
      /no successful proof|could not be read|not recorded|so far/i,
    );

    await intentLocationName(intent, locationPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary.locator(".intent-summary-files")).toHaveText(
      "4 files",
    );
    await expect(summary).toContainText(`${problem} ${setRunner}`);
    await expect(summary).not.toContainText("Last successful proof");
    await expandIntentFolders(intent, locationPath);
    await expect(
      intent.getByRole("button", { name: datesPath, exact: true }),
    ).toBeVisible();
  });
}

test("a pytest-shaped snapshot under a Vitest location is not a valid proof file, with Retry, while Purpose stays readable", async ({
  page,
}) => {
  const locationsReads = countLocationsReads(page);
  const intent = await openDoughnut(page, settings, pytestShapedFiles);
  const { purpose, proof } = await selectDates(intent);
  const malformed = `Proof could not be read: ${snapshotPath} is not a valid proof file.`;
  const alert = proof.getByRole("alert");
  await expect(alert).toContainText(malformed);
  await expect(proof.getByRole("table")).toHaveCount(0);
  await expect(proof).not.toContainText(/no successful proof|not recorded/i);
  const before = locationsReads();
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect.poll(locationsReads).toBe(before + 1);
  await expect(alert).toContainText(malformed);
  await expect(purpose).toContainText('it("pads months"');
});

test("a typescript location without proof names the Vitest reference; a shell location names the families Proof is read for", async ({
  page,
}) => {
  const intent = await openDoughnut(page, settingsWithoutProof, {});

  await test.step("typescript file Proof and location summary say proof is not recorded", async () => {
    const { proof } = await selectDates(intent);
    await expect(proof).toContainText(notRecorded);
    await expect(proof.getByRole("table")).toHaveCount(0);
    await expect(proof).not.toContainText(
      /no successful proof|could not be read|so far/i,
    );
    await intentLocationName(intent, locationPath).click();
    const summary = intent.getByRole("region", { name: "Summary" });
    await expect(summary).toContainText(notRecorded);
    await expect(summary).not.toContainText("Last successful proof");
  });

  await test.step("a shell file's Proof and location summary name the families Proof is read for", async () => {
    await expandIntentGroup(intent, "scripts");
    await intent.getByRole("button", { name: scriptPath, exact: true }).click();
    await expect(intent.getByLabel(`${scriptPath} source`)).toContainText(
      "echo ok",
    );
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof).toContainText(proofReadForFamiliesSoFar);
    await expect(proof).not.toContainText("vitest-proof.md");
    await intentLocationName(intent, "scripts").click();
    await expect(intent.getByRole("region", { name: "Summary" })).toContainText(
      proofReadForFamiliesSoFar,
    );
  });
});
