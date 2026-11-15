// @ts-check
// One task's stored usage. Import/persistence actions and expected answers
// belong to consumers; this builder owns only the canonical history facts.
/** @typedef {import('./usageStoreTestData.mjs').TaskHistoryFacts} TaskHistoryFacts */
/** @typedef {import('./usageStoreTestData.mjs').TaskResponseFacts} TaskResponseFacts */
/** @typedef {import('../../../dashboard/server/usageRecords.ts').UsageTask} UsageTask */

export class UsageTaskHistoryBuilder {
  /** @type {Partial<UsageTask>} */
  task = {};
  /** @type {Partial<TaskResponseFacts>[]} */
  responses = [];
  /** @type {string[]} */
  workerGaps = [];
  at = "2026-11-01T12:00:00.000Z";
  empty = false;

  /** @param {string} id */
  identifiedAs(id) {
    this.task.id = id;
    return this;
  }

  /** @param {string} workflow */
  inWorkflow(workflow) {
    this.task.workflow = workflow;
    return this;
  }

  /** @param {string} at */
  endedAt(at) {
    this.at = at;
    return this;
  }

  /** @param {Partial<UsageTask>} facts */
  withTask(facts) {
    Object.assign(this.task, facts);
    return this;
  }

  /** @param {Partial<TaskResponseFacts>} facts */
  withResponse(facts) {
    this.responses.push(facts);
    return this;
  }

  /** @param {Partial<TaskResponseFacts>} facts */
  withWorkerResponse(facts) {
    return this.withResponse({ ...facts, worker: true });
  }

  /** @param {...string} gaps */
  withWorkerGaps(...gaps) {
    this.workerGaps.push(...gaps);
    return this;
  }

  recovered() {
    return this.withTask({ kind: "recovered", outcome: null });
  }

  withoutResponses() {
    this.empty = true;
    this.responses = [];
    return this;
  }

  /** @returns {TaskHistoryFacts} */
  please() {
    const id = this.task.id ?? "task";
    const responses = this.empty
      ? []
      : this.responses.length
        ? this.responses
        : [{}];
    const workflow = this.task.workflow ?? "execution";
    /** @type {Record<string, string>} */
    const recoveredWorkflows = {
      execution: "dough-execute-plan",
      refinement: "dough-story-refinement",
    };
    const task = { ...this.task };
    if (task.kind === "recovered")
      task.workflow = recoveredWorkflows[workflow] ?? workflow;
    return structuredClone({
      task: {
        id,
        title: id,
        kind: "launch",
        origin: "dashboard",
        project: "open-dough",
        workflow: "execution",
        outcome: { kind: "reported-complete", at: this.at },
        lastActivityAt: this.at,
        ...task,
      },
      responses: responses.map((response) => ({
        model: "gpt-6.1-sol",
        effort: "xhigh",
        at: this.at,
        tokens: { uncachedInput: 1_000, cacheRead: 9_000, output: 100 },
        ...response,
      })),
      workerGaps: this.workerGaps,
    });
  }
}
