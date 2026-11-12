import { intentReadingScroll } from "../intentPerspectivePage.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceLineNumbers,
  sourceTargetLine,
  sourceFile,
} from "../intentCodeBrowsePage.ts";
// Intent opens a recorded test from the Optimization Candidates tab at its
// identified case in the Intent tab's Purpose (SEED-192 commitments 23.1–23.3, 24, E4 configured variant).

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
} from "../intentModePage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  openDoughCaseLineNumber,
  openDoughSpecPaths,
  publishOpenDoughCaseLine,
} from "../intentCandidatesFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "../intentCandidatesCasePositionFixtures.ts";
import {
  publishPygardonConfiguredTests,
  pygardonClipCase,
  pygardonClipCaseLine,
  pygardonClipPath,
} from "../intentCandidatesOtherProjectFixtures.ts";
import { doughnut, openDough, pygardon } from "../intentCodeBrowseFixtures.ts";

test("Intent opens a configured Pygardon ::name case at its line in Purpose", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishPygardonConfiguredTests(page);

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, pygardon.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "real-h264-codec-roundtrip",
  });
  await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
    `::${pygardonClipCase}`,
  );
  await sourceFile(entry, pygardonClipPath).click();

  const source = fileSource(intent, pygardonClipPath);
  await expect(source).toContainText(`def ${pygardonClipCase}`);
  await expectSourceTargetLine(source, pygardonClipCaseLine);
});

test("Intent opens a Gherkin scenario named exactly once at its line", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishDoughnutCasePosition(page);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);
  await expectCandidatesRevision(intent, doughnut.revision);

  const entry = candidatesRecord(intent).getByRole("article", {
    name: "unique-scenario-once",
  });
  await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
    `::${doughnutUniqueScenario}`,
  );
  await sourceFile(entry, doughnutCaseFeaturePath).click();

  const source = fileSource(intent, doughnutCaseFeaturePath);
  await expect(source).toContainText(`Scenario: ${doughnutUniqueScenario}`);
  await expectSourceTargetLine(source, doughnutUniqueScenarioLine);
});

test("Intent opens path:line at that line and a duplicate case name at the file start", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await test.step("path:line positions and identifies the target line", async () => {
    await publishOpenDoughCaseLine(page);
    await openUntilRead(page, "/?project=open-dough");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, openDough.revision);

    const entry = candidatesRecord(intent).getByRole("article", {
      name: "path-line-case",
    });
    await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
      `:${openDoughCaseLineNumber}`,
    );
    await sourceFile(entry, openDoughSpecPaths.caseLine).click();

    const source = fileSource(intent, openDoughSpecPaths.caseLine);
    await expect(source).toContainText("line-anchored case");
    await expectSourceTargetLine(source, openDoughCaseLineNumber);
  });

  await test.step("duplicate case name opens at the file start with case text beside the link", async () => {
    await publishDoughnutCasePosition(page);
    await openUntilRead(page, "/?project=doughnut");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    await chooseOptimizationCandidates(intent);

    const entry = candidatesRecord(intent).getByRole("article", {
      name: "duplicate-scenario-name",
    });
    await expect(entry.locator(".intent-candidate-location-case")).toHaveText(
      "::shared scenario",
    );
    await sourceFile(entry, doughnutCaseFeaturePath).click();

    const source = fileSource(intent, doughnutCaseFeaturePath);
    await expect(source).toContainText("Scenario: shared scenario");
    await expect(sourceTargetLine(source)).toHaveCount(0);
    await expect(sourceLineNumbers(source).first()).toHaveText("1");
    await expect.poll(() => intentReadingScroll(intent)).toBe(0);

    await chooseOptimizationCandidates(intent);
    const returned = candidatesRecord(intent).getByRole("article", {
      name: "duplicate-scenario-name",
    });
    await expect(sourceFile(returned, doughnutCaseFeaturePath)).toBeVisible();
    await expect(
      returned.locator(".intent-candidate-location-case"),
    ).toHaveText("::shared scenario");
  });
});
