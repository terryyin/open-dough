// Published projects, settings, and Gherkin texts for Intent Gherkin browse,
// exclusive-group, and layout journeys (`./intent-gherkin-browse.spec.ts`,
// `./intent-gherkin-groups.spec.ts`, `./intent-gherkin-layout.spec.ts`).

import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";

export const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "d7".repeat(20),
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
  revision: "c1".repeat(20),
  taken: "Pygardon's own taken story",
  queued: "Pygardon's own queued story",
  direction: "Show Pygardon's own published direction through local gh.",
  purpose: "Read Pygardon's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/303-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-303-queued.md",
};

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

export function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: Project,
  settings: string,
  features: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...filesOf(published),
      ".planning/open-dough.json": `${settings}\n`,
      ...features,
    },
  });
}
