// Intent's Proof pane reads committed node:test proof for a javascript
// location that declares `runner: "node:test"`, `proof` and
// `proofGeneration` (../src/IntentProof.tsx, ../src/vitestCases.ts,
// ../src/proofKinds.ts): rows by suite path in definition order, Test case
// header and test words, a loop-generated name and subtests absent from the
// table while kept or folded in the snapshot, stale observations unlisted,
// and explanations naming the Node reference and `runner` among Intent's
// runners. Kind-independent rules are not
// re-proved here.

import { expect, test } from "./dashboardTest.ts";
import {
  countLocationsReads,
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import {
  cucumberShapedFiles,
  generationCommand,
  settings,
  settingsWithoutProof,
  settingsWithoutRunner,
  settingsWithoutRunnerOrProof,
  snapshotFiles,
  snapshotPath,
} from "./intentNodeTestProofFixtures.ts";
import {
  hostLoopPath,
  landRerunPath,
  locationPath,
  scriptPath,
  withSubtestsPath,
} from "./intentNodeTestSourceFixtures.ts";
import {
  cellsOf,
  headers,
  noProof,
  openProject,
  openProof,
  passedNow,
} from "./intentNodeTestProofPage.ts";
import {
  everyRunnerProofReferences,
  notRecordedFollowing,
  proofReadForFamiliesSoFar,
  setRunnerThatRecordsProof,
} from "./intentProofAbsenceText.ts";

const setRunner = setRunnerThatRecordsProof(locationPath);
const notRecordedNode = notRecordedFollowing(
  "dough-test-optimization/references/node-test-proof.md",
);
const notRecordedEveryRunner = notRecordedFollowing(everyRunnerProofReferences);

test("Ex 6: a node:test file's Proof lists tests by suite path under Test case, with the count line in test cases", async ({
  page,
}) => {
  const { proof } = await openProof(
    page,
    landRerunPath,
    'describe("land rerun"',
  );
  await expect(proof).toContainText(
    "Last successful proof: 4 test cases: 3 passed, 1 without successful proof",
  );
  expect(await cellsOf(proof, landRerunPath)).toEqual([
    headers,
    [
      "land rerun > keeps resources after a push conflict",
      ...passedNow("120 ms"),
    ],
    ["land rerun > reruns after resolution once", ...passedNow("80 ms")],
    ["reports a failed refresh", ...passedNow("45 ms")],
    ["needs a later pass", ...noProof],
  ]);
  await expect(proof).not.toContainText(/renamed away|scenario|Vitest/i);
  await expect(proof).toContainText(
    `Generate or refresh proof from the repository root: ${generationCommand}`,
  );
});

test("Ex 6: loop-generated names and subtests stay unlisted while Purpose and listed rows remain", async ({
  page,
}) => {
  await test.step("loop-generated host names have no row; the listed case does", async () => {
    const { proof } = await openProof(page, hostLoopPath, "listed host check");
    await expect(proof).toContainText(
      "Last successful proof: 1 test case: 1 passed",
    );
    expect(await cellsOf(proof, hostLoopPath)).toEqual([
      headers,
      ["listed host check", ...passedNow("20 ms")],
    ]);
    await expect(proof).not.toContainText("codex: records a focused pass");
  });

  await test.step("a parent with subtests lists the parent only", async () => {
    const { proof } = await openProof(
      page,
      withSubtestsPath,
      "parent folds subtests",
    );
    await expect(proof).toContainText(
      "Last successful proof: 2 test cases: 2 passed",
    );
    expect(await cellsOf(proof, withSubtestsPath)).toEqual([
      headers,
      ["parent folds subtests", ...passedNow("23 ms")],
      ["sibling keeps its own row", ...passedNow("18 ms")],
    ]);
    await expect(proof).not.toContainText(/child alpha|child beta/i);
  });
});

test("Ex 8: proof without a runner names vitest or playwright or node:test", async ({
  page,
}) => {
  const intent = await openProject(page, settingsWithoutRunner, snapshotFiles);
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent
    .getByRole("button", { name: landRerunPath, exact: true })
    .click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(
    `runner is not declared for this location’s proof. ${setRunner}`,
  );
  await expect(proof.getByRole("table")).toHaveCount(0);
});

test("Ex 8: a Cucumber-shaped snapshot under node:test is malformed with Retry", async ({
  page,
}) => {
  const locationsReads = countLocationsReads(page);
  const { proof } = await openProof(
    page,
    landRerunPath,
    'describe("land rerun"',
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

test("Ex 9: without proof, a node:test location names the Node reference", async ({
  page,
}) => {
  const intent = await openProject(page, settingsWithoutProof, {});
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent
    .getByRole("button", { name: landRerunPath, exact: true })
    .click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(notRecordedNode);
  await expect(proof).not.toContainText("vitest-proof.md");
});

test("Ex 9: without a declared runner, every runner reference is named", async ({
  page,
}) => {
  const intent = await openProject(page, settingsWithoutRunnerOrProof, {});
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent
    .getByRole("button", { name: landRerunPath, exact: true })
    .click();
  const proof = await chooseReadingTab(intent, "Proof");
  await expect(proof).toContainText(notRecordedEveryRunner);
});

test("Ex 9: a shell location names Node test files among the families", async ({
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
  await expect(proof).not.toContainText("node-test-proof.md");
});
