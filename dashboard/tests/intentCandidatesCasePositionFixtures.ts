// Doughnut case-position fixtures for Intent Purpose journeys
// (`./intent-test-optimization-candidates-case.spec.ts`): a unique Gherkin
// scenario and a duplicated name that falls back to the file start.

import { testOptimizationCandidatesPath } from "../src/testOptimizationCandidatesPath.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import { candidateRecordEntry as entry } from "./intentCandidatesRecordEntry.ts";
import { doughnutFeatureSettings } from "./intentCandidatesOtherProjectFixtures.ts";

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

export const doughnutCaseCandidatesRecord = `# Test Optimization Candidates

## Latest pass

- **Command / scope:** doughnut case-position fixture
- **Revision:** ${doughnut.revision}
- **Before / after:** unavailable
- **Outcome:** incomplete measurement
- **Limits:** fixture only
- **Evidence:** none

## Pending candidates

${entry("unique-scenario-once", {
  locations: `\`${doughnutCaseFeaturePath}::${doughnutUniqueScenario}\``,
  observedCost: "about 12s unique scenario",
  uniqueProtection: "named scenario appears once",
  alternativesAttempted: "none",
  disposition: "pending — case positioning proof",
  date: "2026-11-01",
  evidence: "fixture",
})}
${entry("duplicate-scenario-name", {
  locations: `\`${doughnutCaseFeaturePath}::shared scenario\``,
  observedCost: "about 8s duplicated name",
  uniqueProtection: "name appears twice so Purpose stays at the start",
  alternativesAttempted: "none",
  disposition: "pending — ambiguous case proof",
  date: "2026-11-01",
  evidence: "fixture",
})}
## Accepted necessary costs

None.

## Profile-only exclusions

None.

## Transferred obligations

None.
`;

export function publishDoughnutCasePosition(
  page: Parameters<typeof publishIntentProject>[0],
) {
  return publishIntentProject(page, doughnut, doughnutFeatureSettings, {
    [testOptimizationCandidatesPath]: doughnutCaseCandidatesRecord,
    [doughnutCaseFeaturePath]: doughnutCaseFeatureSource,
  });
}
