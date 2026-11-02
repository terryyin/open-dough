// Fixtures for Intent unusable-location journeys
// (./intent-gherkin-unusable.spec.ts): mixed usable and problem locations on
// Doughnut-like and Pygardon-like projects.

import type { Project } from "./catalogProjectRecords.ts";

export const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "e8".repeat(20),
  taken: "Doughnut's own taken story",
  queued: "Doughnut's own queued story",
  direction: "Show Doughnut's own published direction through local gh.",
  purpose: "Read Doughnut's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/302-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-302-queued.md",
};

export const pygardon: Project = {
  label: "Pygardon",
  ref: "main",
  repository: "terryyin/pygardon",
  revision: "f9".repeat(20),
  taken: "Pygardon's own taken story",
  queued: "Pygardon's own queued story",
  direction: "Show Pygardon's own published direction through local gh.",
  purpose: "Read Pygardon's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/303-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-303-queued.md",
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
