// Fixtures for Intent unusable-location journeys
// (../../e2e/intent/intent-gherkin-unusable.spec.ts): mixed usable and problem locations on
// Doughnut-like and Pygardon-like projects.

import { catalogPublications } from "./catalogProjectRecords.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

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

export const mixedSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at("e2e_test/features").ofKind("gherkin").please(),
    makeMe.anIntentLocation.at("no_such_dir").ofKind("gherkin").please(),
    makeMe.anIntentLocation.at("empty_features").ofKind("gherkin").please(),
    makeMe.anIntentLocation
      .at("frontend/src")
      .ofKind("unfamiliar-language")
      .please(),
    makeMe.anIntentLocation
      .at("scripts")
      .ofKind("javascript", ["**/*.test.mjs"])
      .please(),
  )
  .please();
