// @ts-check
// Frontend service answers; task details and expected observations stay in cases.
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexAnswer} TokenIndexAnswer */
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexTask} TokenIndexTask */

const sol = { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" };

export class TokenIndexAnswerBuilder {
  #indexes = [1_950];
  /** @type {Map<number, Partial<TokenIndexTask>>} */
  #details = new Map();
  #unpriced = 0;
  #checkedAt = "2026-11-15T00:00:00.000Z";
  /** @type {TokenIndexAnswer["cohort"]} */
  #cohort = { tool: "codex", workflow: "execution", model: null, effort: null };

  /** @param {{ indexes: readonly number[] }} facts */
  with({ indexes }) {
    this.#indexes = [...indexes];
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
    const measured = tasks.filter((task) => task.coverage.kind === "measured");
    return structuredClone({
      cohort: this.#cohort,
      options: { models: [sol], efforts: ["xhigh"] },
      tariff: { version: "codex-test", label: "Test rate card" },
      checkedAt: this.#checkedAt,
      tasks,
      unpriced: this.#unpriced,
      average: measured.flatMap((task, at) =>
        at < 9
          ? []
          : [
              {
                at: task.endedAt,
                value:
                  measured
                    .slice(at - 9, at + 1)
                    .reduce((sum, each) => sum + each.index, 0) / 10,
              },
            ],
      ),
    });
  }
}
