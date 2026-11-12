// Opening a recorded file from Optimization Candidates shows Purpose
// positioned on its case, and opening it again after reading away from the
// case starts a fresh reading positioned on it once more
// (../../src/IntentBrowser.tsx, ../../src/IntentFileReading.tsx). The case targets
// themselves are `./intent-test-optimization-candidates-case.spec.ts`.

import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  intentModeTab,
} from "../intentModePage.ts";
import { intentReadingPane, purposeRegion } from "../intentPerspectivePage.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceFile,
  sourceTargetLine,
} from "../intentCodeBrowsePage.ts";
import { contentReadsOf } from "../intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "../intentCandidatesCasePositionFixtures.ts";

test("opening a recorded file shows Purpose on its case, reading it once, and opening it again after reading away returns to the case", async ({
  page,
}) => {
  // Short enough that the case sits below the start of Purpose.
  await page.setViewportSize({ width: 1280, height: 640 });
  let noteGrammarRequest: () => void = () => undefined;
  const grammarRequested = new Promise<void>((resolve) => {
    noteGrammarRequest = resolve;
  });
  let releaseGrammar: () => void = () => undefined;
  const grammarReleased = new Promise<void>((resolve) => {
    releaseGrammar = resolve;
  });
  await page.route(/\/assets\/gherkin-[^/]+\.js$/, async (route) => {
    noteGrammarRequest();
    await grammarReleased;
    await route.continue();
  });
  const requests = await publishDoughnutCasePosition(page);
  try {
    await openUntilRead(page, "/?project=doughnut");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    const fileName = sourceFile(intent, doughnutCaseFeaturePath);
    const caseEntry = candidatesRecord(intent).getByRole("article", {
      name: "unique-scenario-once",
    });
    const source = fileSource(intent, doughnutCaseFeaturePath);

    await chooseOptimizationCandidates(intent);
    await sourceFile(caseEntry, doughnutCaseFeaturePath).click();
    await grammarRequested;
    await expect(intentModeTab(intent, "CI status")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(source).toContainText(`Scenario: ${doughnutUniqueScenario}`);
    await expectSourceTargetLine(source, doughnutUniqueScenarioLine);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    expect(contentReadsOf(requests, doughnutCaseFeaturePath)).toBe(1);

    await test.step("highlighting keeps the reader at the start, opening the recorded file again shows Purpose on its case", async () => {
      await intentReadingPane(intent).evaluate((el) => {
        el.scrollTo({ top: 0 });
      });
      await expect(sourceTargetLine(source)).not.toBeInViewport();
      releaseGrammar();
      await expect(intent.locator(".source-token").first()).toBeAttached();
      await expect(sourceTargetLine(source)).not.toBeInViewport();
      await chooseOptimizationCandidates(intent);
      await sourceFile(caseEntry, doughnutCaseFeaturePath).click();
      await expect(purposeRegion(intent)).toBeVisible();
      await expect(source).toContainText(`Scenario: ${doughnutUniqueScenario}`);
      await expectSourceTargetLine(source, doughnutUniqueScenarioLine);
      await expect(fileName).toHaveAttribute("aria-pressed", "true");
    });
  } finally {
    releaseGrammar();
  }
});
