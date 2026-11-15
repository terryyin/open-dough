// @ts-check
// Codex rollout JSONL rows for usage-history import cases. Cases name the
// session, turns, responses and counters they assert; this builder derives
// session_meta, ids, parent links and in-window timestamps. Malformed bytes,
// unsupported rows and asserted times stay in the case. No dashboard runtime
// import.

import { testDataTimestamp } from "./testDataDefaults.mjs";

/**
 * @typedef {object} CodexResponseOptions
 * @property {string} [rootTurnId]
 * @property {string} [timestamp]
 * @property {string} [sessionId]
 */

/**
 * @typedef {object} CodexSpawnOptions
 * @property {string} [spawnParent] thread id recorded on the spawn source when
 *   it deliberately differs from `parent_thread_id`
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
 * A Codex session rollout: `session_meta`, optional `turn_context` rows and
 * `token_usage_record` responses. `.please()` returns the JSONL row objects.
 */
export class CodexRolloutBuilder {
  /** @type {string | undefined} */
  #sessionId;
  /** @type {string | undefined} */
  #cwd;
  /** @type {{ commit_hash?: string, repository_url?: string } | undefined} */
  #git;
  /** @type {string | undefined} */
  #parentThreadId;
  /** @type {boolean} */
  #hasSpawnSource = false;
  /** @type {string | undefined} */
  #spawnParent;
  /** @type {CodexRolloutRow[]} */
  #rows = [];

  /**
   * The session this rollout belongs to (`session_meta.payload.id`).
   * @param {string} sessionId
   */
  forSession(sessionId) {
    this.#sessionId = sessionId;
    return this;
  }

  /**
   * Working directory on `session_meta` (`cwd`) for project join.
   * @param {string} cwd
   */
  withCwd(cwd) {
    this.#cwd = cwd;
    return this;
  }

  /**
   * Git facts on `session_meta` (`commit_hash`, `repository_url`) for historical
   * recovery and project join.
   * @param {{ commit_hash?: string, repository_url?: string }} git
   */
  withGit(git) {
    this.#git = git;
    return this;
  }

  /**
   * A descendant session that only records `parent_thread_id` (no spawn source).
   * @param {string} parentThreadId
   */
  withParent(parentThreadId) {
    this.#parentThreadId = parentThreadId;
    this.#hasSpawnSource = false;
    this.#spawnParent = undefined;
    return this;
  }

  /**
   * A worker session with `parent_thread_id` and Codex spawn source evidence.
   * @param {string} parentThreadId
   * @param {CodexSpawnOptions} [options]
   */
  spawnedFrom(parentThreadId, options = {}) {
    this.#parentThreadId = parentThreadId;
    this.#hasSpawnSource = true;
    this.#spawnParent = options.spawnParent ?? parentThreadId;
    return this;
  }

  /**
   * A `turn_context` row. Omit model/effort when the case only needs a turn id.
   * @param {string} turnId
   * @param {string} [model]
   * @param {string} [effort]
   */
  withTurnContext(turnId, model, effort) {
    this.#rows.push(codexTurnContext(turnId, model, effort));
    return this;
  }

  /**
   * One response usage record. Timestamp defaults to the in-window incidental
   * time; `root_turn_id` defaults to the turn id.
   * @param {string} turnId
   * @param {string} responseId
   * @param {object} usage
   * @param {CodexResponseOptions} [options]
   */
  withResponse(turnId, responseId, usage, options = {}) {
    const sessionId = options.sessionId ?? this.#sessionId;
    if (sessionId === undefined) {
      throw new Error("forSession(...) before withResponse(...)");
    }
    this.#rows.push(
      codexTokenUsageRecord(sessionId, turnId, responseId, usage, options),
    );
    return this;
  }

  /**
   * A wire row placed among builder-made rows, with an incidental timestamp
   * unless explicitly supplied. Use `timestamp: undefined` for an undated row.
   * @param {CodexRolloutRow} row
   */
  withRow(row) {
    this.#rows.push({ timestamp: testDataTimestamp, ...row });
    return this;
  }

  /**
   * Built `turn_context` and `token_usage_record` rows without `session_meta`.
   * Use when the case deliberately omits metadata or appends to an existing
   * session file.
   * @returns {CodexRolloutRow[]}
   */
  rows() {
    return [...this.#rows];
  }

  /** @returns {CodexRolloutRow[]} */
  please() {
    if (this.#sessionId === undefined) {
      throw new Error("forSession(...) before please()");
    }
    /** @type {Record<string, unknown>} */
    const payload = { id: this.#sessionId };
    if (this.#cwd !== undefined) {
      payload.cwd = this.#cwd;
    }
    if (this.#git !== undefined) {
      payload.git = this.#git;
    }
    if (this.#parentThreadId !== undefined) {
      payload.parent_thread_id = this.#parentThreadId;
    }
    if (this.#hasSpawnSource) {
      payload.source = {
        subagent: {
          thread_spawn: { parent_thread_id: this.#spawnParent },
        },
      };
    }
    return [{ type: "session_meta", payload }, ...this.#rows];
  }
}
