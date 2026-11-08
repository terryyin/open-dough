// Fixtures for Intent unusable-location journeys
// (./intent/intent-gherkin-unusable.spec.ts): mixed usable and problem locations on
// Doughnut-like and Pygardon-like projects.

import { catalogPublications } from "./catalogProjectRecords.ts";

export const doughnut = {
  ...catalogPublications.doughnut,
  revision: "e8".repeat(20),
};

export const pygardon = {
  ...catalogPublications.pygardon,
  revision: "f9".repeat(20),
};

export const usableFeature = `Feature: Usable
  Scenario: Still browses
    Given a working location
`;

export const mixedSettings = JSON.stringify({
  intent: {
    locations: [
      { path: "e2e_test/features", kind: "gherkin" },
      { path: "no_such_dir", kind: "gherkin" },
      { path: "empty_features", kind: "gherkin" },
      { path: "frontend/src", kind: "java" },
      { path: "scripts", kind: "javascript", include: ["**/*.test.mjs"] },
    ],
  },
});
