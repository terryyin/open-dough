// @ts-check
// Persisted usage-task evidence for report and collector boundaries. Valid
// Codex rollouts and Claude transcripts for import cases come from
// `makeMe.aCodexRollout` and `makeMe.aClaudeTranscript` (in-window timestamps
// by default). Malformed bytes and layout under proof stay in the case. No
// runtime dashboard import enters MakeMe.
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
