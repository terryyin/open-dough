// Doughnut case-position fixtures for Intent Purpose journeys
// (`../frontend-tests/intent/intent-purpose-case.spec.ts`,
// `../../e2e/intent/intent-recorded-purpose-read.spec.ts`): a recorded Gherkin
// scenario named once, far enough below the start to scroll to.

import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

const doughnutFeatureSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation
      .at("e2e_test/features")
      .ofKind("gherkin", ["**/*.feature"])
      .please(),
  )
  .please();

export const doughnutCaseFeaturePath =
  "e2e_test/features/cli/case_position.feature";

export const doughnutUniqueScenario = "unique cold path";

/** Feature with a unique scenario below the start and a duplicated name. */
export const doughnutCaseFeatureSource = [
  "Feature: case position",
  "  Scenario: early warm",
  "    Given warm",
  "",
  ...[...Array(30).keys()].map((index) => `  # pad ${index}`),
  `  Scenario: ${doughnutUniqueScenario}`,
  "    Given unique",
  "",
  "  Scenario: shared scenario",
  "    Given first",
  "",
  "  Scenario: shared scenario",
  "    Given second",
  "",
].join("\n");

/** 1-based line of the unique scenario heading in the fixture. */
export const doughnutUniqueScenarioLine = 35;

export const doughnutCaseCandidatesRecord =
  makeMe.aTestOptimizationCandidatesRecord
    .pending(
      "unique-scenario-once",
      `\`${doughnutCaseFeaturePath}::${doughnutUniqueScenario}\``,
      {
        observedCost: "about 12s unique scenario",
        uniqueProtection: "named scenario appears once",
        alternativesAttempted: "none",
        dispositionRationale: "pending — case positioning proof",
        date: "2026-11-01",
        evidence: "fixture",
      },
    )
    .please();

export function publishDoughnutCasePosition(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, doughnut, doughnutFeatureSettings, {
    [testOptimizationCandidatesPath]: doughnutCaseCandidatesRecord,
    [doughnutCaseFeaturePath]: doughnutCaseFeatureSource,
  });
}
