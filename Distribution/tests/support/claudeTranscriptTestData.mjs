// @ts-check
// Claude transcript JSONL for usage-history import cases. Cases name the
// launch, usage, workers, completion or outcome they assert; this builder
// supplies reporting context, attachment and role rows with uuid/parentUuid
// chaining and in-window timestamps. Malformed bytes, asserted times and
// subagents/ layout stay in the case. No dashboard runtime import.

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
 * A Claude session transcript: launch-input, attachment, user/assistant role
 * rows and uuid/parentUuid chaining. `.please()` returns the JSONL row objects.
 */
export class ClaudeTranscriptBuilder {
  /** @type {string | undefined} */
  #sessionId;
  /** @type {string | undefined} */
  #cwd;
  /** @type {string | undefined} */
  #agentId;
  /** @type {boolean} */
  #sidechain = false;
  /** @type {ClaudeTranscriptRow[]} */
  #rows = [];
  /** @type {string | undefined} */
  #lastUuid;

  /** @param {string} sessionId sessionId on every row */
  forSession(sessionId) {
    this.#sessionId = sessionId;
    return this;
  }

  /** @param {string} cwd working directory (`cwd`) on every row for project join */
  withCwd(cwd) {
    this.#cwd = cwd;
    return this;
  }

  /** @param {{ agentId: string }} facts worker sidechain (`agentId` + `isSidechain`) */
  asSidechain({ agentId }) {
    this.#agentId = agentId;
    this.#sidechain = true;
    return this;
  }

  /** @param {ClaudeLaunchInputOptions} options launch-input user row */
  withLaunchInput(options) {
    const uuid = options.uuid ?? "launch-input";
    /** @type {Record<string, unknown>} */
    const message = {
      content: claudeReportingContext(options),
    };
    if (options.role) {
      message.role = "user";
    }
    /** @type {ClaudeTranscriptRow} */
    const row = {
      ...this.#base(),
      type: "user",
      uuid,
      parentUuid: null,
      timestamp: options.timestamp ?? testDataTimestamp,
      origin: options.origin ?? { kind: "human" },
      message,
    };
    return this.#push(row, uuid);
  }

  /** @param {{ uuid?: string, parentUuid?: string | null }} [options] */
  withAttachment(options = {}) {
    const uuid = options.uuid ?? "context";
    const parentUuid =
      "parentUuid" in options ? options.parentUuid : this.#lastUuid;
    /** @type {ClaudeTranscriptRow} */
    const row = {
      ...this.#base(),
      type: "attachment",
      uuid,
    };
    if (parentUuid !== undefined) {
      row.parentUuid = parentUuid;
    }
    return this.#push(row, uuid);
  }

  /** @param {ClaudeUserOptions} options parentUuid defaults to the previous uuid */
  withUser(options) {
    const parentUuid = this.#resolveParent(options);
    /** @type {ClaudeTranscriptRow} */
    const row = {
      ...this.#base(),
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
    return this.#push(row, options.uuid);
  }

  /** @param {{ uuid: string, name: string }} options slash workflow typed without arguments */
  withSlashCommand({ uuid, name }) {
    const content = `<command-message>${name}</command-message>\n<command-name>/${name}</command-name>`;
    return this.withUser({ uuid, origin: { kind: "human" }, content });
  }

  /**
   * Assistant row with usage. Uuid and message id default when omitted;
   * timestamp defaults in-window; parentUuid to the previous uuid.
   * @param {ClaudeAssistantOptions} [options]
   */
  withAssistant(options = {}) {
    const uuid = options.uuid ?? `assistant-${this.#rows.length + 1}`;
    const parentUuid = this.#resolveParent(options);
    /** @type {Record<string, unknown>} */
    const message = { ...(options.message ?? {}) };
    if (options.messageId !== undefined) message.id = options.messageId;
    else if (message.id === undefined) message.id = `msg-${uuid}`;
    if (options.model !== undefined) message.model = options.model;
    if (options.usage !== undefined) message.usage = options.usage;
    if (options.content !== undefined) message.content = options.content;
    if ("stopReason" in options) {
      message.stop_reason = options.stopReason;
    }
    /** @type {ClaudeTranscriptRow} */
    const row = {
      ...this.#base(),
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
    return this.#push(row, uuid);
  }

  /**
   * Assistant row whose text embeds raw U+2028 and U+2029 inside one JSONL
   * row. Other assistant fields follow `withAssistant` defaults.
   * @param {ClaudeAssistantOptions} [options]
   */
  withAssistantHoldingLineSeparators(options = {}) {
    return this.withAssistant({
      ...options,
      content: [{ type: "text", text: "first\u2028second\u2029third" }],
    });
  }

  /** @param {ClaudeTranscriptRow} row literal wire row among builder-made rows */
  withRow(row) {
    const uuid = typeof row.uuid === "string" ? row.uuid : undefined;
    this.#rows.push(row);
    if (uuid !== undefined) {
      this.#lastUuid = uuid;
    }
    return this;
  }

  /** @returns {ClaudeTranscriptRow[]} */
  please() {
    if (this.#sessionId === undefined) {
      throw new Error("forSession(...) before please()");
    }
    return [...this.#rows];
  }

  /** @returns {ClaudeTranscriptRow} */
  #base() {
    if (this.#sessionId === undefined) {
      throw new Error("forSession(...) before adding rows");
    }
    /** @type {ClaudeTranscriptRow} */
    const base = { sessionId: this.#sessionId };
    if (this.#cwd !== undefined) base.cwd = this.#cwd;
    if (this.#sidechain && this.#agentId !== undefined) {
      base.agentId = this.#agentId;
      base.isSidechain = true;
    }
    return base;
  }

  /**
   * @param {{ parentUuid?: string | null, chain?: boolean }} options
   * @returns {string | null | undefined}
   */
  #resolveParent(options) {
    if ("parentUuid" in options) {
      return options.parentUuid;
    }
    if (options.chain === false) {
      return undefined;
    }
    return this.#lastUuid;
  }

  /**
   * @param {ClaudeTranscriptRow} row
   * @param {string} uuid
   */
  #push(row, uuid) {
    this.#rows.push(row);
    this.#lastUuid = uuid;
    return this;
  }
}
