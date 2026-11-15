// @ts-check
// Codex rollout JSONL row shapes the rollout builder places in a session:
// turn context, response usage, worker spawns and applied thread settings,
// each with the in-window incidental timestamp a case does not assert.

import { testDataTimestamp } from "./testDataDefaults.mjs";

/**
 * @typedef {object} CodexResponseOptions
 * @property {string} [rootTurnId]
 * @property {string} [timestamp]
 * @property {string} [sessionId]
 */

/**
 * @typedef {object} CodexTurnContextRow
 * @property {"turn_context"} type
 * @property {{ turn_id: string, model?: string, effort?: string }} payload
 */

/**
 * @typedef {object} CodexTokenUsageRecord
 * @property {"token_usage_record"} type
 * @property {string} timestamp
 * @property {{
 *   thread_id: string,
 *   turn_id: string,
 *   root_turn_id: string,
 *   response_id: string,
 *   usage: object,
 * }} payload
 */

/**
 * One Codex JSONL row (`session_meta`, `turn_context`, `token_usage_record`,
 * or a literal under proof).
 * @typedef {{
 *   type: string,
 *   timestamp?: string | undefined,
 *   origin?: { kind: string },
 *   payload?: Record<string, unknown>,
 * }} CodexRolloutRow
 */

/**
 * A `turn_context` row. Omit model/effort when the case only needs a turn id.
 * @param {string} turnId
 * @param {string} [model]
 * @param {string} [effort]
 * @returns {CodexTurnContextRow}
 */
export function codexTurnContext(turnId, model, effort) {
  /** @type {{ turn_id: string, model?: string, effort?: string }} */
  const payload = { turn_id: turnId };
  if (model !== undefined) payload.model = model;
  if (effort !== undefined) payload.effort = effort;
  return { type: "turn_context", payload };
}

/**
 * One `token_usage_record` row. Timestamp defaults to the in-window incidental
 * time; `root_turn_id` defaults to the turn id.
 * @param {string} sessionId
 * @param {string} turnId
 * @param {string} responseId
 * @param {object} usage
 * @param {CodexResponseOptions} [options]
 * @returns {CodexTokenUsageRecord}
 */
export function codexTokenUsageRecord(
  sessionId,
  turnId,
  responseId,
  usage,
  options = {},
) {
  return {
    type: "token_usage_record",
    timestamp: options.timestamp ?? testDataTimestamp,
    payload: {
      thread_id: sessionId,
      turn_id: turnId,
      root_turn_id: options.rootTurnId ?? turnId,
      response_id: responseId,
      usage,
    },
  };
}

/**
 * The parent's `spawn_agent` call and its output naming the spawned worker.
 * @param {string} workerId
 * @returns {CodexRolloutRow[]}
 */
export function codexSpawnedAgent(workerId) {
  return [
    { name: "spawn_agent", type: "function_call" },
    {
      output: JSON.stringify({ agent_id: workerId }),
      type: "function_call_output",
    },
  ].map((payload) => ({
    type: "response_item",
    timestamp: testDataTimestamp,
    payload: { ...payload, call_id: workerId },
  }));
}

/**
 * Thread settings Codex records as applied to `threadId`, at `serviceTier`
 * when stated.
 * @param {string} threadId
 * @param {string} [serviceTier]
 * @returns {CodexRolloutRow}
 */
export function codexSettingsApplied(threadId, serviceTier) {
  return {
    type: "event_msg",
    timestamp: testDataTimestamp,
    payload: {
      type: "thread_settings_applied",
      thread_id: threadId,
      thread_settings:
        serviceTier === undefined ? {} : { service_tier: serviceTier },
    },
  };
}
