// @ts-check
// Persisted task evidence for report and collector boundaries. Native wire rows
// remain literal in import cases; no runtime dashboard import enters MakeMe.
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageTask} UsageTask */
export class UsageTaskBuilder {
  /** @param {Pick<UsageTask, "id" | "sessionId"> & Partial<UsageTask>} facts */
  with(facts) {
    return {
      /** @returns {UsageTask} */
      please: () =>
        structuredClone({
          kind: "recovered",
          project: null,
          host: "codex",
          workflow: null,
          identity: null,
          title: null,
          launchedAt: null,
          origin: "unknown",
          requested: {},
          sources: [],
          gaps: [],
          ...facts,
        }),
    };
  }
}
