// Published Intent locations for the entry and folder summary journeys
// (`./intent-entry-folder-summaries*.spec.ts`): a Pygardon-like Gherkin location
// with `jobs/` and `reports/` folders, beside a packaged location of one
// file.

import { catalogPublications } from "./catalogProjectRecords.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";

export { publishIntentProject } from "./publishIntentProject.ts";

export const pygardon = catalogPublications.pygardon;

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

export const pygardonSettings = makeMe.intentSettings
  .withLocations(
    makeMe.anIntentLocation.at(featuresPath).ofKind("gherkin").please(),
    makeMe.anIntentLocation.at(packagedPath).ofKind("gherkin").please(),
  )
  .please();

export const pygardonFeatureSources = {
  [stooqPath]: stooqFeature,
  [jobsOtherPath]: jobsOtherFeature,
  [reportsFeaturePath]: reportsFeature,
  [topFeaturePath]: topFeature,
  [packagedFeaturePath]: packagedFeature,
};
