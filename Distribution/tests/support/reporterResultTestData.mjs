// @ts-check
// Attempt TestResult and TestStep shapes that reporter hooks receive.

/**
 * @typedef {import("@playwright/test/reporter").TestResult} TestResult
 * @typedef {import("@playwright/test/reporter").TestStep} TestStep
 * @typedef {import("@playwright/test/reporter").TestError} TestError
 */

/**
 * @typedef {object} ReporterResultFacts
 * @property {TestResult["status"]} [status]
 * @property {number} [retry]
 * @property {number} [duration]
 * @property {Date} [startTime]
 * @property {Array<string | Buffer>} [stdout]
 * @property {Array<string | Buffer>} [stderr]
 * @property {TestError[]} [errors]
 * @property {TestResult["attachments"]} [attachments]
 */

/**
 * @typedef {object} ReporterStepFacts
 * @property {string} title
 * @property {string} [category]
 * @property {number} [duration]
 * @property {string} [file]
 * @property {number} [line]
 */

export class ReporterResultBuilder {
  /** @type {ReporterResultFacts} */
  #facts = { status: "passed" };

  /** @param {ReporterResultFacts} facts */
  with(facts) {
    this.#facts = { ...this.#facts, ...facts };
    return this;
  }

  /** @param {TestResult["status"]} status */
  withStatus(status) {
    this.#facts = { ...this.#facts, status };
    return this;
  }

  /** @param {number} retry */
  retried(retry) {
    this.#facts = { ...this.#facts, retry };
    return this;
  }

  /** @param {number} duration */
  lasting(duration) {
    this.#facts = { ...this.#facts, duration };
    return this;
  }

  /** @param {string | Buffer} chunk */
  writing(chunk) {
    this.#facts = {
      ...this.#facts,
      stdout: [...(this.#facts.stdout ?? []), chunk],
    };
    return this;
  }

  /** @param {TestError} error */
  withError(error) {
    this.#facts = {
      ...this.#facts,
      errors: [...(this.#facts.errors ?? []), error],
    };
    return this;
  }

  /** @returns {TestResult} */
  please() {
    const status = this.#facts.status ?? "passed";
    const errors = this.#facts.errors ?? [];
    const firstError = errors[0];
    return {
      annotations: [],
      attachments: this.#facts.attachments ?? [],
      duration: this.#facts.duration ?? 1,
      ...(firstError === undefined ? {} : { error: firstError }),
      errors,
      parallelIndex: 0,
      retry: this.#facts.retry ?? 0,
      startTime: this.#facts.startTime ?? new Date("2026-11-25T00:00:00.000Z"),
      status,
      stderr: this.#facts.stderr ?? [],
      stdout: this.#facts.stdout ?? [],
      steps: [],
      workerIndex: 0,
    };
  }
}

export class ReporterStepBuilder {
  /** @type {ReporterStepFacts} */
  #facts = { title: "step", category: "test.step" };

  /** @param {ReporterStepFacts} facts */
  with(facts) {
    this.#facts = { ...this.#facts, ...facts };
    return this;
  }

  /** @param {string} title */
  titled(title) {
    this.#facts = { ...this.#facts, title };
    return this;
  }

  /** @param {string} category */
  inCategory(category) {
    this.#facts = { ...this.#facts, category };
    return this;
  }

  /** @param {number} duration */
  lasting(duration) {
    this.#facts = { ...this.#facts, duration };
    return this;
  }

  /** @returns {TestStep} */
  please() {
    const title = this.#facts.title;
    return {
      title,
      category: this.#facts.category ?? "test.step",
      startTime: new Date("2026-11-25T00:00:00.000Z"),
      duration: this.#facts.duration ?? 1,
      steps: [],
      annotations: [],
      attachments: [],
      ...(this.#facts.file === undefined
        ? {}
        : {
            location: {
              file: this.#facts.file,
              line: this.#facts.line ?? 1,
              column: 1,
            },
          }),
      titlePath() {
        return [title];
      },
    };
  }
}

/**
 * @typedef {object} ReporterResultMakeMe
 * @property {ReporterResultBuilder} aReporterResult
 * @property {ReporterStepBuilder} aReporterStep
 */

/** @returns {PropertyDescriptorMap} */
export function reporterResultMakeMeProperties() {
  return {
    aReporterResult: {
      enumerable: true,
      get() {
        return new ReporterResultBuilder();
      },
    },
    aReporterStep: {
      enumerable: true,
      get() {
        return new ReporterStepBuilder();
      },
    },
  };
}
