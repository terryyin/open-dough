// Published Intent locations for the entry and folder summary journeys
// (`./intent-entry-folder-summaries*.spec.ts`,
// `./intent-summary-drill-down.spec.ts`): a Pygardon-like Gherkin location
// with `jobs/` and `reports/` folders, beside a packaged location of one
// file.

import { filesOf, type Project } from "./catalogProjectRecords.ts";
import { publishFiles } from "./publishedOrigin.ts";

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

export const featuresPath = "e2e_test/features";
export const jobsFolder = `${featuresPath}/jobs`;
export const reportsFolder = `${featuresPath}/reports`;
export const stooqPath = `${jobsFolder}/stooq_refresh.feature`;
export const jobsOtherPath = `${jobsFolder}/batch.feature`;
const reportsFeaturePath = `${reportsFolder}/status.feature`;
export const topFeaturePath = `${featuresPath}/disk_space.feature`;

const stooqFeature = `Feature: Stooq refresh
  Scenario: Refresh quotes
    Given a watchlist
    When I refresh from Stooq
    Then quotes update
  Scenario: Refresh again
    Given a watchlist
    When I refresh again
    Then quotes stay current
`;

const jobsOtherFeature = `Feature: Batch jobs
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

const topFeature = `Feature: Disk space
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

const reportsFeature = `Feature: Status report
  Scenario: Report status
    Given a run
    Then I see its status
`;

export const packagedPath = "e2e_test/packaged/features";
const packagedFeaturePath = `${packagedPath}/packaged.feature`;
const packagedFeature = `Feature: Packaged
  Scenario: Packaged case
    Given a packaged fixture
`;

export const pygardonSettings = JSON.stringify(
  {
    intent: {
      locations: [
        { path: featuresPath, kind: "gherkin" },
        { path: packagedPath, kind: "gherkin" },
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
};
