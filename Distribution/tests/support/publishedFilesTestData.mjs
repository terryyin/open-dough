// @ts-check
// The files a revision publishes, by repository path, as the authenticated
// read answers them, and its named example: Pygardon's two Gherkin features
// under one `e2e_test/features` location (`.ofPygardonFeatures`). Its paths
// are `pygardonFeatures`, which page objects of a reading of the example use.

/** @typedef {Readonly<Record<string, string>>} PublishedFiles */

const folder = "e2e_test/features";

// Where Pygardon's published features are.
export const pygardonFeatures = Object.freeze({
  folder,
  jobs: `${folder}/jobs.feature`,
  diskSpace: `${folder}/disk_space.feature`,
});

// A jobs feature opening with `scenario`, long enough for a reading pane to
// scroll.
const jobsFeature = (/** @type {string} */ scenario) =>
  `Feature: Jobs\n  Scenario: ${scenario}\n    Then it is done\n${[
    ...Array(60).keys(),
  ]
    .map((n) => `\n  Scenario: Keep job ${n}\n    Then it stays\n`)
    .join("")}`;

const diskSpaceFeature = `Feature: Disk space
  Scenario: Report free space
    Then I see its free space
`;

export class PygardonFeaturesBuilder {
  #opening = "List jobs";
  #withJobs = true;

  // The jobs feature's first scenario, which tells revisions apart.
  /** @param {string} scenario */
  openingJobsWith(scenario) {
    this.#opening = scenario;
    return this;
  }

  // The revision deleted the jobs feature.
  withoutJobs() {
    this.#withJobs = false;
    return this;
  }

  /** @returns {PublishedFiles} */
  please() {
    return {
      ...(this.#withJobs
        ? { [pygardonFeatures.jobs]: jobsFeature(this.#opening) }
        : {}),
      [pygardonFeatures.diskSpace]: diskSpaceFeature,
    };
  }
}

export class PublishedFilesBuilder {
  get ofPygardonFeatures() {
    return new PygardonFeaturesBuilder();
  }
}
