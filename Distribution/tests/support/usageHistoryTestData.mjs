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

/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageObservation} UsageObservation */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageAssociation} UsageAssociation */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageTokens} UsageTokens */
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
                file: `/home/.codex/sessions/${facts.sessionId}.jsonl`,
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

// A response's unique task association.
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
}

/**
 * @typedef {{
 *   model: string,
 *   effort?: string,
 *   worker?: true,
 *   turnId?: string,
 *   tokens: Partial<UsageTokens>,
 * }} TaskResponseFacts
 */
/**
 * @typedef {{
 *   task: Pick<UsageTask, "id"> & Partial<UsageTask>,
 *   responses: readonly TaskResponseFacts[],
 * }} TaskHistoryFacts
 */

// A usage store's tasks, each with its uniquely associated responses: each
// the root conversation's, in its first turn unless stated, or a worker's.
// A task's session is its id unless stated.
export class UsageHistoryBuilder {
  /** @param {{ tasks: readonly TaskHistoryFacts[] }} facts */
  with({ tasks: histories }) {
    return {
      please: () => {
        const parts = histories.map(({ task: taskFacts, responses }) => {
          const task = new UsageTaskBuilder()
            .with({ sessionId: taskFacts.id, ...taskFacts })
            .please();
          const observations = responses.map((response, index) =>
            new UsageObservationBuilder()
              .with({
                sessionId: response.worker
                  ? `${task.sessionId}-worker`
                  : task.sessionId,
                ...(response.worker ? { parentSessionId: task.sessionId } : {}),
                responseId: `response-${String(index)}`,
                ...(response.turnId ? { turnId: response.turnId } : {}),
                settings: {
                  model: response.model,
                  ...(response.effort ? { effort: response.effort } : {}),
                },
                tokens: response.tokens,
              })
              .please(),
          );
          return { task, observations };
        });
        return {
          tasks: parts.map(({ task }) => task),
          observations: parts.flatMap(({ observations }) => observations),
          associations: parts.flatMap(({ task, observations }) =>
            observations.map((observation) =>
              new UsageAssociationBuilder()
                .with({ observation, task })
                .please(),
            ),
          ),
        };
      },
    };
  }
}
