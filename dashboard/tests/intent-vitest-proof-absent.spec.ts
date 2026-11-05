// Intent explains Vitest Proof it cannot show (../src/IntentProofProblem.tsx,
// ../server/intentLocationsRead.ts, ../server/intentProofRead.ts): a
// `typescript` location declaring `proof` without a `runner`, or with one
// Intent reads no proof for, says the `runner` setting is the problem while
// its files stay readable; a pytest-shaped snapshot under a
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
import {
  everyRunnerProofReferences,
  notRecordedFollowing,
  proofReadForFamiliesSoFar,
  setRunnerThatRecordsProof,
} from "./intentProofAbsenceText.ts";

const notRecorded = notRecordedFollowing(everyRunnerProofReferences);
const setRunner = setRunnerThatRecordsProof(locationPath);

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
  test(`a typescript location declaring proof ${situation} explains the runner setting, with its files readable`, async ({
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

  await test.step("typescript file Proof says proof is not recorded", async () => {
    const { proof } = await selectDates(intent);
    await expect(proof).toContainText(notRecorded);
    await expect(proof.getByRole("table")).toHaveCount(0);
    await expect(proof).not.toContainText(
      /no successful proof|could not be read|so far/i,
    );
  });

  await test.step("a shell file's Proof names the families Proof is read for", async () => {
    await expandIntentGroup(intent, "scripts");
    await intent.getByRole("button", { name: scriptPath, exact: true }).click();
    await expect(intent.getByLabel(`${scriptPath} source`)).toContainText(
      "echo ok",
    );
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof).toContainText(proofReadForFamiliesSoFar);
    await expect(proof).not.toContainText("vitest-proof.md");
  });
});
