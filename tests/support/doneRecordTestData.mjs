// @ts-check

/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs").renderDoneRecord>[0]} DoneRecord */

export class DoneRecordBuilder {
  /** @type {DoneRecord} */
  #record = {
    identity: "SEED-1#completed-story",
    title: "A completed story",
    completedAt: "2026-01-01T00:00:00.000Z",
  };

  /** @param {DoneRecord} facts */
  with(facts) {
    return { please: () => ({ ...facts }) };
  }

  /** @param {Partial<Pick<DoneRecord, "identity" | "title" | "completedAt">>} facts */
  completed(facts) {
    this.#record = { ...this.#record, ...facts };
    return this;
  }

  /** @param {NonNullable<DoneRecord["intentCoverage"]>} result */
  withIntentCoverage(result) {
    this.#record.intentCoverage = result;
    return this;
  }

  /** @returns {DoneRecord} */
  please() {
    return this.#record;
  }
}
