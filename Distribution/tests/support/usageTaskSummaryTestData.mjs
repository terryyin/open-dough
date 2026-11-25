// @ts-check
/** @typedef {import("../../../dashboard/server/usageTaskSummary.ts").UsageTaskSummary} UsageTaskSummary */
/** @typedef {import("../../../dashboard/server/usageTaskSummary.ts").SummaryTask} SummaryTask */
/** @typedef {import("../../../dashboard/server/usageTaskSummary.ts").SummaryUsage} SummaryUsage */
/** @typedef {Partial<Omit<SummaryUsage, "tokens">> & { tokens?: Partial<SummaryUsage["tokens"]> }} SummaryUsageFacts */

const defaultEnd = "2026-11-01T12:00:00.000Z";

/** @param {SummaryUsageFacts} facts @returns {SummaryUsage} */
function usageGroup({ tokens, ...facts }) {
  return {
    model: "gpt-6.1-sol",
    effort: "xhigh",
    tier: null,
    root: true,
    responses: 1,
    tokens: {
      uncachedInput: 1_000,
      cacheRead: 9_000,
      cacheWrite: 0,
      output: 100,
      ...tokens,
    },
    ...facts,
  };
}

export class SummaryTaskBuilder {
  /** @type {Partial<SummaryTask>} */
  #facts = {};
  /** @type {SummaryUsage[]} */
  #usage = [];

  /** @param {Partial<SummaryTask>} facts */
  with(facts) {
    this.#facts = { ...this.#facts, ...facts };
    return this;
  }

  /** @param {string} id */
  identifiedAs(id) {
    return this.with({ id });
  }

  /** @param {string} at */
  endedAt(at) {
    return this.with({
      outcome: { kind: "reported-complete", at },
      lastActivityAt: at,
    });
  }

  /** @param {SummaryUsageFacts} facts */
  withUsage(facts) {
    this.#usage.push(usageGroup(facts));
    return this;
  }

  /** @returns {SummaryTask} */
  please() {
    return structuredClone({
      id: "task",
      kind: "launch",
      host: "codex",
      project: "open-dough",
      workflow: "execution",
      identity: null,
      title: this.#facts.id ?? "task",
      requested: { model: null, effort: null },
      outcome: { kind: "reported-complete", at: defaultEnd },
      lastActivityAt: defaultEnd,
      usage: this.#usage.length > 0 ? this.#usage : [usageGroup({})],
      gaps: [],
      ...this.#facts,
    });
  }
}

export class UsageTaskSummaryBuilder {
  /** @param {Partial<UsageTaskSummary>} facts */
  with(facts) {
    return {
      /** @returns {UsageTaskSummary} */
      please: () =>
        structuredClone({
          format: "usage-task-summary-v5",
          store: "none",
          tasks: [],
          ...facts,
        }),
    };
  }
}
