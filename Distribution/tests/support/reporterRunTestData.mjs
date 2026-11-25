// @ts-check
// Playwright reporter-hook suite and config inputs for direct ProofRecord /
// QuietReporter / SpecTimes cases. A suite's allTests() returns the same
// TestCase instances the hooks later receive — ProofRecord keys selections by
// instance.

/**
 * @typedef {import("@playwright/test/reporter").FullConfig} FullConfig
 * @typedef {import("@playwright/test/reporter").FullProject} FullProject
 * @typedef {import("@playwright/test/reporter").Suite} Suite
 * @typedef {import("@playwright/test/reporter").TestCase} TestCase
 */

/**
 * @typedef {object} ReporterCaseFacts
 * @property {string} title
 * @property {string} file
 * @property {number} [line]
 * @property {number} [column]
 * @property {string} [id]
 * @property {number} [repeatEachIndex]
 * @property {TestCase["expectedStatus"]} [expectedStatus]
 * @property {ReturnType<TestCase["outcome"]>} [outcome]
 * @property {number} [retries]
 */

/**
 * @typedef {object} ReporterRun
 * @property {FullConfig} config
 * @property {Suite} suite
 * @property {TestCase[]} cases
 */

let nextId = 0;

/** @returns {string} */
function freshId() {
  nextId += 1;
  return `reporter-case-${String(nextId)}`;
}

export class ReporterRunBuilder {
  /** @type {string[]} */
  #outputDirs = ["/tmp/reporter-output"];
  /** @type {string[]} */
  #argv = [];
  /** @type {string | undefined} */
  #configFile = "/tmp/reporter.config.ts";
  /** @type {string} */
  #rootDir = "/tmp";
  /** @type {string} */
  #projectName = "proof-fixtures";
  /** @type {ReporterCaseFacts[]} */
  #cases = [];

  /** @param {string} outputDir */
  withOutputDir(outputDir) {
    this.#outputDirs = [outputDir];
    return this;
  }

  /** @param {string[]} outputDirs */
  withOutputDirs(outputDirs) {
    this.#outputDirs = [...outputDirs];
    return this;
  }

  /** @param {string[]} argv */
  withArgv(argv) {
    this.#argv = [...argv];
    return this;
  }

  /** @param {string} configFile */
  withConfigFile(configFile) {
    this.#configFile = configFile;
    return this;
  }

  /** @param {string} rootDir */
  withRootDir(rootDir) {
    this.#rootDir = rootDir;
    return this;
  }

  /** @param {string} name */
  withProject(name) {
    this.#projectName = name;
    return this;
  }

  /** @param {ReporterCaseFacts} facts */
  holdingCase(facts) {
    this.#cases = [facts];
    return this;
  }

  /** @param {ReporterCaseFacts} facts */
  andHoldingCase(facts) {
    this.#cases = [...this.#cases, facts];
    return this;
  }

  /** @param {ReporterCaseFacts[]} facts */
  holdingCases(facts) {
    this.#cases = [...facts];
    return this;
  }

  /** @returns {ReporterRun} */
  please() {
    const projectName = this.#projectName;
    /** @type {FullProject} */
    const project = /** @type {FullProject} */ ({
      name: projectName,
      outputDir: this.#outputDirs[0] ?? "/tmp/reporter-output",
    });
    /** @type {FullConfig} */
    const config = /** @type {FullConfig} */ ({
      projects: this.#outputDirs.map(
        (outputDir) =>
          /** @type {FullProject} */ ({ name: projectName, outputDir }),
      ),
      argv: [...this.#argv],
      configFile: this.#configFile,
      rootDir: this.#rootDir,
    });

    /** @type {Suite} */
    const root = {
      type: "root",
      title: "",
      suites: [],
      tests: [],
      entries() {
        return this.suites;
      },
      allTests() {
        return [];
      },
      project() {
        return undefined;
      },
      titlePath() {
        return [""];
      },
    };

    /** @type {Suite} */
    const projectSuite = {
      type: "project",
      title: projectName,
      parent: root,
      suites: [],
      tests: [],
      entries() {
        return this.suites;
      },
      allTests() {
        return [];
      },
      project() {
        return project;
      },
      titlePath() {
        return ["", projectName];
      },
    };
    root.suites = [projectSuite];

    /** @type {Map<string, Suite>} */
    const fileSuites = new Map();
    /** @type {TestCase[]} */
    const cases = [];

    for (const facts of this.#cases) {
      let fileSuite = fileSuites.get(facts.file);
      if (fileSuite === undefined) {
        fileSuite = {
          type: "file",
          title: facts.file,
          location: { file: facts.file, line: 1, column: 1 },
          parent: projectSuite,
          suites: [],
          tests: [],
          entries() {
            return this.tests;
          },
          allTests() {
            return this.tests;
          },
          project() {
            return project;
          },
          titlePath() {
            return ["", projectName, facts.file];
          },
        };
        fileSuites.set(facts.file, fileSuite);
        projectSuite.suites.push(fileSuite);
      }
      const suite = fileSuite;
      const id = facts.id ?? freshId();
      const repeatEachIndex = facts.repeatEachIndex ?? 0;
      const expectedStatus = facts.expectedStatus ?? "passed";
      const outcome = facts.outcome ?? "expected";
      const line = facts.line ?? 1;
      const column = facts.column ?? 1;
      /** @type {TestCase} */
      const testCase = {
        type: "test",
        title: facts.title,
        id,
        repeatEachIndex,
        expectedStatus,
        location: { file: facts.file, line, column },
        parent: suite,
        results: [],
        retries: facts.retries ?? 0,
        annotations: [],
        tags: [],
        timeout: 30_000,
        ok() {
          return outcome === "expected" || outcome === "flaky";
        },
        outcome() {
          return outcome;
        },
        titlePath() {
          return ["", projectName, facts.file, facts.title];
        },
      };
      suite.tests.push(testCase);
      cases.push(testCase);
    }

    const allCases = cases;
    projectSuite.allTests = () => allCases;
    root.allTests = () => allCases;

    return { config, suite: root, cases };
  }
}
