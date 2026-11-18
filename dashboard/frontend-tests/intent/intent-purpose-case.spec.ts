import {
  filesToggle,
  expectFilesShown,
} from "../../test-support/intentModePage.ts";
import { sourceLineText } from "../../test-support/intentCodeBrowsePage.ts";
import { putFrontendIntentSources } from "../../test-support/support/frontendIntentSources.ts";
// Opening a recorded file from Optimization Candidates shows Purpose
// positioned on its case, and opening it again after reading away from the
// case starts a fresh reading positioned on it once more
// (../../src/IntentBrowser.tsx, ../../src/IntentFileReading.tsx). The case targets
// themselves are `./intent-test-optimization-candidates-case.spec.ts`.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  candidateEntry,
  chooseOptimizationCandidates,
  intentModeTab,
} from "../../test-support/intentModePage.ts";
import { purposeRegion } from "../../test-support/intentPerspectivePage.ts";
import {
  expectReadingOffset,
  intentReadingScroll,
  scrollIntentReadingToStart,
} from "../../test-support/intentReadingPlacePage.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceFile,
  sourceTargetLine,
} from "../../test-support/intentCodeBrowsePage.ts";
import { doughnut } from "../../test-support/intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { holdGrammar } from "../../test-support/support/syntaxGrammar.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  doughnutCaseFeatureSource,
  doughnutCaseCandidatesRecord,
} from "../../test-support/intentCandidatesCasePositionFixtures.ts";

test("opening a recorded file shows Purpose on its case, reading it once, and opening it again after reading away returns to the case", async ({
  page,
  frontendServices,
}) => {
  // Short enough that the case sits below the start of Purpose.
  await page.setViewportSize({ width: 1280, height: 640 });
  const grammar = await holdGrammar(page, "gherkin");
  putFrontendIntentSources(
    frontendServices,
    doughnut,
    [
      makeMe.anIntentLocation
        .at("e2e_test/features")
        .ofKind("gherkin")
        .selecting(doughnutCaseFeaturePath)
        .please(),
    ],
    { [doughnutCaseFeaturePath]: doughnutCaseFeatureSource },
  );
  Object.assign(frontendServices, {
    candidates: {
      revision: doughnut.revision,
      candidates: doughnutCaseCandidatesRecord,
    },
  });
  const requests: URLSearchParams[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/__authenticated-read")
      requests.push(url.searchParams);
  });
  try {
    await openUntilRead(page, "/?project=doughnut");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    const fileName = sourceFile(intent, doughnutCaseFeaturePath);
    const caseEntry = candidateEntry(intent, "unique-scenario-once");
    const source = fileSource(intent, doughnutCaseFeaturePath);

    await chooseOptimizationCandidates(intent);
    await sourceFile(caseEntry, doughnutCaseFeaturePath).click();
    await grammar.requested;
    await expect(intentModeTab(intent, "CI status")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(source).toContainText(`Scenario: ${doughnutUniqueScenario}`);
    await expectSourceTargetLine(source, doughnutUniqueScenarioLine);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    expect(
      requests.filter(
        (params) =>
          params.get("path") === doughnutCaseFeaturePath &&
          !params.has("committed"),
      ).length,
    ).toBe(1);

    const offset = await intentReadingScroll(intent);
    expect(offset).toBeGreaterThan(0);
    await parts(page).development.click();
    await intentChoice.click();
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    await expectReadingOffset(intent, offset);
    await filesToggle(intent).press("Enter");
    await expectFilesShown(intent, false);
    await expect(sourceLineText(source)).toHaveText(
      doughnutCaseFeatureSource.split("\n"),
    );
    await expectSourceTargetLine(source, 35);
    await expectReadingOffset(intent, offset);
    await filesToggle(intent).press("Space");
    await expectFilesShown(intent, true);
    await expect(fileName).toHaveAttribute("aria-pressed", "true");
    await expectReadingOffset(intent, offset);

    await test.step("highlighting keeps the reader at the start, opening the recorded file again shows Purpose on its case", async () => {
      await scrollIntentReadingToStart(intent);
      await expect(sourceTargetLine(source)).not.toBeInViewport();
      grammar.release();
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
    grammar.release();
  }
});
