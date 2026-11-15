// @ts-check
// A usage store as an import leaves it, for the Token index's derivation and
// the Usage view: tasks with their uniquely associated responses and the
// coverage gaps recorded for their workers, built from the persisted records
// of ./usageHistoryTestData.mjs.
import {
  rolloutOf,
  UsageAssociationBuilder,
  UsageObservationBuilder,
  UsageTaskBuilder,
} from "./usageHistoryTestData.mjs";

/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageTask} UsageTask */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageGap} UsageGap */
/** @typedef {import("../../../dashboard/server/usageRecords.ts").UsageTokens} UsageTokens */
/**
 * @typedef {{
 *   model: string,
 *   effort?: string,
 *   serviceTier?: string,
 *   worker?: true,
 *   turnId?: string,
 *   at?: string,
 *   tokens: Partial<UsageTokens>,
 * }} TaskResponseFacts
 */
/**
 * @typedef {{
 *   task: Pick<UsageTask, "id"> & Partial<UsageTask>,
 *   responses: readonly TaskResponseFacts[],
 *   workerGaps?: readonly string[],
 * }} TaskHistoryFacts
 */

// A coverage gap an import records for a worker the task's root spawned:
// keyed by the worker's session, at the spawn in the root's rollout.
/**
 * @param {UsageTask} task
 * @param {string} code
 * @returns {UsageGap}
 */
const workerGap = (task, code) => ({
  code,
  host: "codex",
  sessionId: `${task.sessionId}-worker`,
  source: { kind: "native", file: rolloutOf(task.sessionId), line: 1 },
});

// A usage store's tasks, each with its uniquely associated responses: each
// the root conversation's, in its first turn unless stated, or a worker's,
// at the observation builder's time and with no recorded service tier unless
// stated; and, by code, the coverage gaps an import records for a worker the
// task's root spawned. A task's session is its id unless stated.
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
                ...(response.at ? { at: response.at } : {}),
                settings: {
                  model: response.model,
                  ...(response.effort ? { effort: response.effort } : {}),
                  ...(response.serviceTier
                    ? { serviceTier: response.serviceTier }
                    : {}),
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
          gaps: parts.flatMap(({ task }, at) =>
            (histories[at]?.workerGaps ?? []).map((code) =>
              workerGap(task, code),
            ),
          ),
        };
      },
    };
  }
}
