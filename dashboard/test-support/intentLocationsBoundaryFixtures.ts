// Published settings and source files for Intent locations boundary checks.

import { describedBacklog } from "./describedRevisions.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export const knownSourceId = "open-dough";
// A project that records no stories.
export const backlog = describedBacklog(makeMe.aRepository.please());
export const settingsPath = ".planning/open-dough.json";
export const featurePath = "e2e_test/features/recall/note.feature";
export const outsidePath = "README.md";
export const featureText = "Feature: Note\n";
export const settings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at("e2e_test/features").ofKind("gherkin").please(),
  )
  .please();

export const revisionOf = (byte: string) => byte.repeat(20);
