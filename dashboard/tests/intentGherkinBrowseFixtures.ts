// Published projects, settings, and Gherkin texts for Intent Gherkin browse,
// exclusive-group, and layout journeys (`./intent/intent-gherkin-browse.spec.ts`,
// `./intent/intent-gherkin-groups.spec.ts`, `./intent/intent-gherkin-layout.spec.ts`).

import { catalogPublications } from "./catalogProjectRecords.ts";

export { publishIntentProject } from "./publishIntentProject.ts";

export const doughnut = catalogPublications.doughnut;

export const pygardon = catalogPublications.pygardon;

export const recallFeature = `Feature: Recall a note
  Scenario: Open a note by title
    Given a notebook with a note titled "alpha"
    When I ask to recall "alpha"
    Then I see the note body
`;

export const packagedFeature = `Feature: Packaged feature
  Scenario: A packaged case
    Given a packaged fixture
    When I run it
    Then it passes
`;

export const doughnutSettings = JSON.stringify(
  {
    intent: {
      locations: [{ path: "e2e_test/features", kind: "gherkin" }],
    },
  },
  null,
  2,
);

export const pygardonSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: "e2e_test/features", kind: "gherkin" },
        { path: "e2e_test/packaged/features", kind: "gherkin" },
      ],
    },
  },
  null,
  2,
);

export const exclusiveSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: "e2e_test/features", kind: "gherkin" },
        { path: "e2e_test/packaged/features", kind: "gherkin" },
        { path: "empty_features", kind: "gherkin" },
        { path: "frontend/src", kind: "java" },
      ],
    },
  },
  null,
  2,
);
