// Published Intent locations for the entry and folder summary journey
// (`./intent-entry-folder-summaries.spec.ts`): a Pygardon-like Gherkin
// location with a `jobs/` folder and committed proof, a Doughnut-like
// Gherkin location without proof, and an Open Dough-like typescript
// location.

import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { gitBlobSha } from "./listingAnswers.ts";

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

export const doughnut: Project = {
  label: "Doughnut",
  ref: "main",
  repository: "nerds-odd-e/doughnut",
  revision: "c2".repeat(20),
  taken: "Doughnut's own taken story",
  queued: "Doughnut's own queued story",
  direction: "Show Doughnut's own published direction through local gh.",
  purpose: "Read Doughnut's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/302-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-302-queued.md",
};

export const openDough: Project = {
  label: "Open Dough",
  ref: "main",
  repository: "terryyin/open-dough",
  revision: "c3".repeat(20),
  taken: "Open Dough's own taken story",
  queued: "Open Dough's own queued story",
  direction: "Show Open Dough's own published direction through local gh.",
  purpose: "Read Open Dough's queued purpose at its own revision.",
  takenPath: ".planning/slice-plans/301-taken/PLAN.md",
  queuedPath: ".planning/seeds/SEED-301-queued.md",
};

export const featuresPath = "e2e_test/features";
export const jobsFolder = `${featuresPath}/jobs`;
export const reportsFolder = `${featuresPath}/reports`;
export const stooqPath = `${jobsFolder}/stooq_refresh.feature`;
export const jobsOtherPath = `${jobsFolder}/batch.feature`;
export const reportsFeaturePath = `${reportsFolder}/status.feature`;
export const topFeaturePath = `${featuresPath}/disk_space.feature`;
export const proofDirectory = "e2e_test/proof";
export const proofRunPath = `${proofDirectory}/20261101T100000Z-worktree-a-1a2b.json`;

export const stooqFeature = `Feature: Stooq refresh
  Scenario: Refresh quotes
    Given a watchlist
    When I refresh from Stooq
    Then quotes update
  Scenario: Refresh again
    Given a watchlist
    When I refresh again
    Then quotes stay current
`;

export const jobsOtherFeature = `Feature: Batch jobs
  Scenario: Run the batch
    Given pending jobs
    When the batch runs
    Then they finish
  Scenario: Skip a job
    Given a skipped job
    Then it stays skipped
  Scenario: Archive a job
    Given a finished job
    Then it is archived
`;

export const topFeature = `Feature: Disk space
  Scenario: Report free space
    Given a disk
    Then I see its free space
  Scenario Outline: Warn when under <limit>
    Given free space is under <limit>
    Then I warn
    Examples:
      | limit |
      | 10%   |
      | 5%    |
`;

export const reportsFeature = `Feature: Status report
  Scenario: Report status
    Given a run
    Then I see its status
`;

const proofFile = (observations: readonly Record<string, unknown>[]) =>
  `${JSON.stringify({ version: 1, observations }, null, 2)}\n`;

const passedObservation = (
  feature: string,
  scenario: string,
  featureText: string,
) => ({
  feature,
  scenario,
  outcome: "passed",
  attempts: 1,
  durationMs: 100,
  finishedAt: "2026-11-01T10:00:00.000Z",
  commit: "a1b2c3d4".repeat(5),
  featureBlob: gitBlobSha(featureText),
});

const validProofBody = proofFile([
  passedObservation(stooqPath, "Refresh quotes", stooqFeature),
  passedObservation(stooqPath, "Refresh again", stooqFeature),
]);

export const pygardonProofFiles = {
  [proofRunPath]: validProofBody,
};

export const packagedPath = "e2e_test/packaged/features";
export const packagedFeaturePath = `${packagedPath}/packaged.feature`;
export const packagedFeature = `Feature: Packaged
  Scenario: Packaged case
    Given a packaged fixture
`;

export const pygardonSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: featuresPath, kind: "gherkin", proof: proofDirectory },
        { path: packagedPath, kind: "gherkin" },
      ],
    },
  },
  null,
  2,
);

export const doughnutFeaturePath =
  "e2e_test/features/recall/recall_note.feature";
export const doughnutOtherFeaturePath =
  "e2e_test/features/recall/other_note.feature";
export const doughnutFeature = `Feature: Recall a note
  Scenario: Recall
    Given a note
  Scenario: Recall again
    Given the same note
`;
export const doughnutOtherFeature = `Feature: Other note
  Scenario: Other recall
    Given another note
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

export const openDoughSettings = JSON.stringify(
  {
    intent: {
      locations: [
        {
          path: "dashboard/tests",
          kind: "typescript",
          include: ["**/*.spec.ts"],
        },
      ],
    },
  },
  null,
  2,
);

export const openDoughSpec = `import { test } from "@playwright/test";
test("summaries", async () => {});
`;

export function publishIntentProject(
  page: Parameters<typeof publishFiles>[0],
  published: Project,
  settings: string,
  sources: Readonly<Record<string, string>>,
) {
  return publishFiles(page, {
    repository: published.repository,
    ref: published.ref,
    revision: published.revision,
    files: {
      ...filesOf(published),
      ".planning/open-dough.json": `${settings}\n`,
      ...sources,
    },
  });
}

export const pygardonFeatureSources = {
  [stooqPath]: stooqFeature,
  [jobsOtherPath]: jobsOtherFeature,
  [reportsFeaturePath]: reportsFeature,
  [topFeaturePath]: topFeature,
  [packagedFeaturePath]: packagedFeature,
  ...pygardonProofFiles,
};
