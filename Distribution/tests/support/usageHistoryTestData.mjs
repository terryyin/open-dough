// @ts-check
// Persisted usage-task evidence for report and collector boundaries. Valid
// Codex rollouts and Claude transcripts for import cases come from
// `makeMe.aCodexRollout` and `makeMe.aClaudeTranscript` (in-window timestamps
// by default). Malformed bytes and layout under proof stay in the case. No
// runtime dashboard import enters MakeMe.
import { testDataTimestamp } from "./testDataDefaults.mjs";

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
          launchedAt: testDataTimestamp,
          origin: "unknown",
          requested: {},
          sources: [],
          gaps: [],
          ...facts,
        }),
    };
  }
}

/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageObservation} UsageObservation */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageAssociation} UsageAssociation */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageTokens} UsageTokens */

// The Codex rollout a session's rows are read from.
/** @param {string} sessionId */
export const rolloutOf = (sessionId) =>
  `/home/.codex/sessions/${sessionId}.jsonl`;
/**
 * @typedef {Pick<UsageObservation, "sessionId" | "responseId"> &
 *   Partial<Pick<UsageObservation, "settings" | "at" | "parentSessionId" | "turnId">> &
 *   { tokens: Partial<UsageTokens> }} CodexResponseFacts
 */

// One measured Codex response as a collector stores it: its native counters,
// with input including cache reads and writes, and the normalized tokens and
// observed settings they reconcile to. Unstated cache counters are zero.
export class UsageObservationBuilder {
  /** @param {CodexResponseFacts} facts */
  with({ tokens: stated, settings = {}, ...facts }) {
    return {
      /** @returns {UsageObservation} */
      please: () => {
        /** @type {UsageTokens} */
        const tokens = {
          uncachedInput: null,
          cacheRead: 0,
          cacheWrite: 0,
          output: null,
          reasoningOutput: null,
          cacheWrite5m: null,
          cacheWrite1h: null,
          ...stated,
        };
        /** @type {Record<string, number>} */
        const reported = {};
        if (
          tokens.uncachedInput !== null &&
          tokens.cacheRead !== null &&
          tokens.cacheWrite !== null
        )
          reported["input_tokens"] =
            tokens.uncachedInput + tokens.cacheRead + tokens.cacheWrite;
        if (tokens.cacheRead !== null)
          reported["cached_input_tokens"] = tokens.cacheRead;
        if (tokens.cacheWrite !== null)
          reported["cache_write_input_tokens"] = tokens.cacheWrite;
        if (tokens.output !== null) reported["output_tokens"] = tokens.output;
        if (tokens.reasoningOutput !== null)
          reported["reasoning_output_tokens"] = tokens.reasoningOutput;
        const core = [
          tokens.uncachedInput,
          tokens.cacheRead,
          tokens.cacheWrite,
          tokens.output,
        ];
        const at = facts.at ?? "2026-11-01T00:00:00.000Z";
        const lineage = {
          ...(facts.turnId ? { turnId: facts.turnId } : {}),
          ...(facts.parentSessionId
            ? { parentSessionId: facts.parentSessionId }
            : {}),
          at,
        };
        return structuredClone({
          id: JSON.stringify(["codex", facts.sessionId, facts.responseId]),
          host: "codex",
          sessionId: facts.sessionId,
          responseId: facts.responseId,
          ...lineage,
          lastAt: at,
          scope: "response",
          settings,
          measurements: [
            {
              source: {
                kind: "native",
                file: rolloutOf(facts.sessionId),
                line: 1,
              },
              settings,
              ...lineage,
              definition: "codex-inclusive-input",
              reported,
              tokens,
            },
          ],
          tokens,
          coverage: core.every((value) => value === null)
            ? "unavailable"
            : core.some((value) => value === null)
              ? "partial"
              : "measured",
          gaps: core.some((value) => value === null)
            ? ["missing-token-components"]
            : [],
        });
      },
    };
  }
}

// A response's unique task association, or one left ambiguous among several
// candidate tasks.
export class UsageAssociationBuilder {
  /** @param {{ observation: UsageObservation, task: { id: string } }} facts */
  with({ observation, task }) {
    return {
      /** @returns {UsageAssociation} */
      please: () => ({
        observationId: observation.id,
        taskId: task.id,
        candidates: [task.id],
        sources: [],
        gaps: [],
      }),
    };
  }

  /**
   * @param {{ observation: UsageObservation, tasks: readonly { id: string }[] }} facts
   */
  ambiguousAmong({ observation, tasks }) {
    return {
      /** @returns {UsageAssociation} */
      please: () => ({
        observationId: observation.id,
        taskId: null,
        candidates: tasks.map((task) => task.id),
        sources: [],
        gaps: ["ambiguous-task-association"],
      }),
    };
  }
}
