// Published projects, settings, and Gherkin texts for Intent Gherkin browse,
// exclusive-group, and layout journeys (`./intent/intent-gherkin-browse.spec.ts`,
// `./intent/intent-gherkin-groups.spec.ts`, `./intent/intent-gherkin-layout.spec.ts`).

import { catalogPublications } from "./catalogProjectRecords.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

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

export const doughnutSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at("e2e_test/features").ofKind("gherkin").please(),
  )
  .please();

export const pygardonSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at("e2e_test/features").ofKind("gherkin").please(),
    makeMe.anIntentLocation
      .at("e2e_test/packaged/features")
      .ofKind("gherkin")
      .please(),
  )
  .please();

export const exclusiveSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at("e2e_test/features").ofKind("gherkin").please(),
    makeMe.anIntentLocation
      .at("e2e_test/packaged/features")
      .ofKind("gherkin")
      .please(),
    makeMe.anIntentLocation.at("empty_features").ofKind("gherkin").please(),
    makeMe.anIntentLocation
      .at("frontend/src")
      .ofKind("unfamiliar-language")
      .please(),
  )
  .please();
