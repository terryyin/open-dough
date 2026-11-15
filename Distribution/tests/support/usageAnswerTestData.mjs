// @ts-check
// Frontend service answers; task details and expected observations stay in cases.
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexAnswer} TokenIndexAnswer */
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexTask} TokenIndexTask */

const sol = { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" };

export class TokenIndexAnswerBuilder {
  #indexes = [1_950];
  /** @type {TokenIndexAnswer["average"]} */
  #trend = [];
  /** @type {Map<number, Partial<TokenIndexTask>>} */
  #details = new Map();
  #unpriced = 0;
  #checkedAt = "2026-11-15T00:00:00.000Z";
  /** @type {TokenIndexAnswer["cohort"]} */
  #cohort = { tool: "codex", workflow: "execution", model: null, effort: null };
  /** @type {TokenIndexAnswer["options"]} */
  #options = { models: [sol], efforts: ["xhigh"] };
  #tariff = { version: "codex-test", label: "Test rate card" };

  /** @param {{ indexes: readonly number[] }} facts */
  with({ indexes }) {
    this.#indexes = [...indexes];
    return this;
  }

  /** @param {TokenIndexAnswer["average"]} points */
  withTrend(points) {
    this.#trend = structuredClone(points);
    return this;
  }

  /** @param {number} at @param {Partial<TokenIndexTask>} facts */
  withTask(at, facts) {
    this.#details.set(at, structuredClone(facts));
    return this;
  }

  /** @param {number} count */
  withUnpricedTasks(count) {
    this.#unpriced = count;
    return this;
  }

  /** @param {TokenIndexAnswer["cohort"]["workflow"]} workflow */
  inWorkflow(workflow) {
    this.#cohort = { ...this.#cohort, workflow };
    return this;
  }

  /** @param {Partial<TokenIndexAnswer["cohort"]>} cohort */
  forCohort(cohort) {
    this.#cohort = { ...this.#cohort, ...cohort };
    return this;
  }

  /** @param {TokenIndexAnswer["options"]} options */
  offering(options) {
    this.#options = structuredClone(options);
    return this;
  }

  /** @param {string} label */
  underTariff(label) {
    this.#tariff = { version: "test", label };
    return this;
  }

  /** @param {string} at */
  checkedAt(at) {
    this.#checkedAt = at;
    return this;
  }

  /** @returns {TokenIndexAnswer} */
  please() {
    /** @type {TokenIndexTask[]} */
    const tasks = this.#indexes.map((index, at) => ({
      id: `task-${String(at + 1)}`,
      project: { id: "open-dough", label: "Open Dough" },
      identity: null,
      title: `Task ${String(at + 1)}`,
      workflow: this.#cohort.workflow,
      outcome: { kind: "reported-complete" },
      endedAt: new Date(Date.UTC(2026, 10, at + 1, 12)).toISOString(),
      requested: { model: null, effort: null },
      observed: { model: sol, effort: "xhigh" },
      index,
      coverage: { kind: "measured" },
      ...this.#details.get(at),
    }));
    return structuredClone({
      cohort: this.#cohort,
      options: this.#options,
      tariff: this.#tariff,
      checkedAt: this.#checkedAt,
      tasks,
      unpriced: this.#unpriced,
      average: this.#trend,
    });
  }
}
