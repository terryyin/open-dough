// Intent's Proof pane reads committed Playwright proof for a typescript
// location that declares `runner: "playwright"`, `proof` and
// `proofGeneration` (../src/IntentProof.tsx, ../src/vitestCases.ts,
// ../src/proofKinds.ts): rows by `test.describe` path in definition order,
// Test case header and test words, loop-generated and helper-defined cases
// absent from the table while kept in the snapshot, stale observations
// unlisted, folder summary in test words, and explanations naming the
// Playwright reference and `runner` among Intent's runners. Kind-independent
// rules are not re-proved here.

import { expect, test } from "./dashboardTest.ts";
import {
  countLocationsReads,
  expandIntentFolders,
  expandIntentGroup,
  intentFolderName,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import {
  cucumberShapedFiles,
  generationCommand,
  settings,
  settingsWithoutProof,
  settingsWithoutRunner,
  snapshotFiles,
  snapshotPath,
} from "./intentPlaywrightProofFixtures.ts";
import {
  boardPath,
  boundaryPath,
  helperCasePath,
  locationPath,
  quietPath,
  scriptPath,
} from "./intentPlaywrightSourceFixtures.ts";
import {
  cellsOf,
  headers,
  noProof,
  openProject,
  openProof,
  passedNow,
} from "./intentPlaywrightProofPage.ts";
import {
  notRecordedFollowing,
  proofReadForFamiliesSoFar,
  setRunnerThatRecordsProof,
} from "./intentProofAbsenceText.ts";

const setRunner = setRunnerThatRecordsProof(locationPath);
const notRecordedPlaywright = notRecordedFollowing(
  "dough-test-optimization/references/playwright-proof.md",
);

test("Ex 6: a Playwright file's Proof lists tests by describe path under Test case, with the count line in test cases", async ({
  page,
}) => {
  const { proof } = await openProof(
    page,
    boardPath,
    'test.describe("touch reading"',
  );
  await expect(proof).toContainText(
    "Last successful proof: 5 test cases: 4 passed, 1 without successful proof",
  );
  expect(await cellsOf(proof, boardPath)).toEqual([
    headers,
    ["touch reading > keeps a long story readable", ...passedNow("120 ms")],
    ["touch reading > selects detail through rotation", ...passedNow("80 ms")],
    ["rotation order > visits the first column", ...passedNow("45 ms")],
    ["opens the board from the tree", ...passedNow("30 ms")],
    ["needs a later pass", ...noProof],
  ]);
  await expect(proof).not.toContainText(/renamed away|scenario|Vitest/i);
  await expect(proof).toContainText(
    `Generate or refresh proof from the repository root: ${generationCommand}`,
  );
});

test("Ex 7: loop-generated and helper-defined proof stay unlisted while Purpose and listed rows remain", async ({
  page,
}) => {
  await test.step("loop-generated quiet names have no row; the listed case does", async () => {
    const { proof } = await openProof(page, quietPath, "listed quiet check");
    await expect(proof).toContainText(
      "Last successful proof: 1 test case: 1 passed",
    );
    expect(await cellsOf(proof, quietPath)).toEqual([
      headers,
      ["listed quiet check", ...passedNow("20 ms")],
    ]);
    await expect(proof).not.toContainText("quiet pass for alpha");
  });

  await test.step("a helper-defined observation has no row beside the file's own test", async () => {
    const { proof } = await openProof(
      page,
      helperCasePath,
      "boundary keeps helper proof unlisted",
    );
    await expect(proof).toContainText(
      "Last successful proof: 1 test case: 1 passed",
    );
    expect(await cellsOf(proof, helperCasePath)).toEqual([
      headers,
      ["boundary keeps helper proof unlisted", ...passedNow("18 ms")],
    ]);
    await expect(proof).not.toContainText("helper defined elsewhere");
  });
});

test("Ex 8: a Playwright folder summary uses test words over listed cases", async ({
  page,
}) => {
  const intent = await openProject(page, settings, snapshotFiles);
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intentFolderName(intent, "boundary").click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    boundaryPath,
  );
  await expect(summary.locator("> .intent-summary-scenarios")).toHaveText(
    "1 test",
  );
  await expect(summary).toContainText(
    "Last successful proof: 1 test case: 1 passed",
  );
  await expect(summary).toContainText(
    "A sum of separate test case observations, retries included, not a run's elapsed time.",
  );
  await expect(summary).not.toContainText(/scenario|helper defined elsewhere/i);
});

test("Ex 9: proof without a runner names vitest or playwright or node:test", async ({
  page,
}) => {
  const intent = await openProject(page, settingsWithoutRunner, snapshotFiles);
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent.getByRole("button", { name: boardPath, exact: true }).click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(
    `runner is not declared for this location’s proof. ${setRunner}`,
  );
  await expect(proof.getByRole("table")).toHaveCount(0);
});

test("Ex 9: a Cucumber-shaped snapshot under playwright is malformed with Retry", async ({
  page,
}) => {
  const locationsReads = countLocationsReads(page);
  const { proof } = await openProof(
    page,
    boardPath,
    'test.describe("touch reading"',
    cucumberShapedFiles,
  );
  const malformed = `Proof could not be read: ${snapshotPath} is not a valid proof file.`;
  const alert = proof.getByRole("alert");
  await expect(alert).toContainText(malformed);
  await expect(proof.getByRole("table")).toHaveCount(0);
  const before = locationsReads();
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect.poll(locationsReads).toBe(before + 1);
  await expect(alert).toContainText(malformed);
});

test("Ex 9: without proof, a playwright location names the Playwright reference", async ({
  page,
}) => {
  const intent = await openProject(page, settingsWithoutProof, {});
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent.getByRole("button", { name: boardPath, exact: true }).click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(notRecordedPlaywright);
  await expect(proof).not.toContainText("vitest-proof.md");
});

test("Ex 9: a shell location names Playwright tests among the families", async ({
  page,
}) => {
  const intent = await openProject(page, settings, snapshotFiles);
  await expandIntentGroup(intent, "scripts");
  await intent.getByRole("button", { name: scriptPath, exact: true }).click();
  await expect(intent.getByLabel(`${scriptPath} source`)).toContainText(
    "echo ok",
  );
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(proofReadForFamiliesSoFar);
  await expect(proof).not.toContainText("playwright-proof.md");
});
