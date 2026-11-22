// @ts-check
// Claude transcript JSONL row shapes the transcript builder places in a
// session: launch input, attachment, user and assistant rows, and the worker
// tool-result content a user row returns. Launch input, user and assistant
// rows carry the in-window incidental timestamp a case does not assert. The
// builder supplies the session base fields and uuid/parentUuid chaining.

import { testDataTimestamp } from "./testDataDefaults.mjs";
import { claudeReportingContext } from "./claudeReportingContext.mjs";

/**
 * @typedef {object} ClaudeLaunchInputOptions
 * @property {string} reference
 * @property {string} [project]
 * @property {string} [command]
 * @property {string} [uuid]
 * @property {string} [prefix]
 * @property {string} [suffix]
 * @property {string} [timestamp]
 * @property {{ kind: string } | undefined} [origin]
 * @property {boolean} [role] when true, set message.role to "user"
 */

/**
 * @typedef {object} ClaudeUserOptions
 * @property {string} uuid
 * @property {string | object} [content]
 * @property {string | null} [parentUuid]
 * @property {boolean} [chain] when false, omit parentUuid (default chains)
 * @property {string} [timestamp]
 * @property {{ kind: string }} [origin]
 * @property {object} [toolUseResult]
 * @property {object} [message]
 */

/**
 * @typedef {object} ClaudeAssistantOptions
 * @property {string} [uuid]
 * @property {string} [messageId]
 * @property {object} [usage]
 * @property {string} [model]
 * @property {string} [effort]
 * @property {string} [requestId]
 * @property {string} [timestamp]
 * @property {string | null} [parentUuid]
 * @property {boolean} [chain] when false, omit parentUuid (default chains)
 * @property {unknown} [stopReason]
 * @property {unknown} [content]
 * @property {object} [message]
 */

/** @typedef {Record<string, unknown>} ClaudeTranscriptRow */

/**
 * @param {ClaudeTranscriptRow} base session fields
 * @param {string} uuid
 * @param {ClaudeLaunchInputOptions} options
 * @returns {ClaudeTranscriptRow}
 */
export function launchInputRow(base, uuid, options) {
  /** @type {Record<string, unknown>} */
  const message = {
    content: claudeReportingContext(options),
  };
  if (options.role) {
    message.role = "user";
  }
  return {
    ...base,
    type: "user",
    uuid,
    parentUuid: null,
    timestamp: options.timestamp ?? testDataTimestamp,
    origin: options.origin ?? { kind: "human" },
    message,
  };
}

/**
 * @param {ClaudeTranscriptRow} base session fields
 * @param {string} uuid
 * @param {string | null | undefined} parentUuid omitted when undefined
 * @returns {ClaudeTranscriptRow}
 */
export function attachmentRow(base, uuid, parentUuid) {
  /** @type {ClaudeTranscriptRow} */
  const row = {
    ...base,
    type: "attachment",
    uuid,
  };
  if (parentUuid !== undefined) {
    row.parentUuid = parentUuid;
  }
  return row;
}

/**
 * @param {ClaudeTranscriptRow} base session fields
 * @param {ClaudeUserOptions} options
 * @param {string | null | undefined} parentUuid omitted when undefined
 * @returns {ClaudeTranscriptRow}
 */
export function userRow(base, options, parentUuid) {
  return {
    ...base,
    type: "user",
    uuid: options.uuid,
    ...(parentUuid !== undefined ? { parentUuid } : {}),
    timestamp: options.timestamp ?? testDataTimestamp,
    ...(options.origin !== undefined ? { origin: options.origin } : {}),
    ...(options.toolUseResult !== undefined
      ? { toolUseResult: options.toolUseResult }
      : {}),
    message:
      options.message ??
      (options.content !== undefined ? { content: options.content } : {}),
  };
}

/**
 * @param {ClaudeTranscriptRow} base session fields
 * @param {string} uuid
 * @param {ClaudeAssistantOptions} options
 * @param {string | null | undefined} parentUuid omitted when undefined
 * @returns {ClaudeTranscriptRow}
 */
export function assistantRow(base, uuid, options, parentUuid) {
  /** @type {Record<string, unknown>} */
  const message = { ...(options.message ?? {}) };
  if (options.messageId !== undefined) message.id = options.messageId;
  if (options.model !== undefined) message.model = options.model;
  if (options.usage !== undefined) message.usage = options.usage;
  if (options.content !== undefined) message.content = options.content;
  if ("stopReason" in options) {
    message.stop_reason = options.stopReason;
  }
  return {
    ...base,
    type: "assistant",
    uuid,
    ...(parentUuid !== undefined ? { parentUuid } : {}),
    timestamp: options.timestamp ?? testDataTimestamp,
    ...(options.requestId !== undefined
      ? { requestId: options.requestId }
      : {}),
    ...(options.effort !== undefined ? { effort: options.effort } : {}),
    message,
  };
}

/**
 * User-row content returning worker `agentId`'s Agent tool call result.
 * @param {string} agentId
 * @returns {object[]}
 */
export function workerToolResultContent(agentId) {
  return [{ type: "tool_result", tool_use_id: `${agentId}-tool`, content: "" }];
}
