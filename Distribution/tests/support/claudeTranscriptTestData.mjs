// @ts-check
// Claude transcript JSONL for usage-history import cases. Cases name the
// launch, usage, workers, completion or outcome they assert; this builder
// supplies session fields and uuid/parentUuid chaining over the row shapes
// in claudeTranscriptRows.mjs. Malformed bytes, asserted times and
// subagents/ layout stay in the case. No dashboard runtime import.

import {
  assistantRow,
  attachmentRow,
  launchInputRow,
  userRow,
  workerToolResultContent,
} from "./claudeTranscriptRows.mjs";

/** @typedef {import("./claudeTranscriptRows.mjs").ClaudeLaunchInputOptions} ClaudeLaunchInputOptions */
/** @typedef {import("./claudeTranscriptRows.mjs").ClaudeUserOptions} ClaudeUserOptions */
/** @typedef {import("./claudeTranscriptRows.mjs").ClaudeAssistantOptions} ClaudeAssistantOptions */
/** @typedef {import("./claudeTranscriptRows.mjs").ClaudeTranscriptRow} ClaudeTranscriptRow */

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
    return this.#push(launchInputRow(this.#base(), uuid, options), uuid);
  }

  /** @param {{ uuid?: string, parentUuid?: string | null }} [options] */
  withAttachment(options = {}) {
    const uuid = options.uuid ?? "context";
    const parentUuid =
      "parentUuid" in options ? options.parentUuid : this.#lastUuid;
    return this.#push(attachmentRow(this.#base(), uuid, parentUuid), uuid);
  }

  /** @param {ClaudeUserOptions} options parentUuid defaults to the previous uuid */
  withUser(options) {
    const parentUuid = this.#resolveParent(options);
    return this.#push(userRow(this.#base(), options, parentUuid), options.uuid);
  }

  /** @param {{ uuid: string, name: string }} options slash workflow typed without arguments */
  withSlashCommand({ uuid, name }) {
    const content = `<command-message>${name}</command-message>\n<command-name>/${name}</command-name>`;
    return this.withUser({ uuid, origin: { kind: "human" }, content });
  }

  /**
   * Assistant row with usage. Uuid defaults when omitted; timestamp defaults
   * in-window; parentUuid to the previous uuid. Message id stays omitted
   * unless stated — a missing id is the unsupported-identity case.
   * @param {ClaudeAssistantOptions} [options]
   */
  withAssistant(options = {}) {
    const uuid = options.uuid ?? `assistant-${this.#rows.length + 1}`;
    const parentUuid = this.#resolveParent(options);
    return this.#push(
      assistantRow(this.#base(), uuid, options, parentUuid),
      uuid,
    );
  }

  /**
   * Countable assistant response after earlier rows. Supplies a message id
   * when the case omits one.
   * @param {ClaudeAssistantOptions} [options]
   */
  withCountedAssistant(options = {}) {
    const uuid = options.uuid ?? `assistant-${this.#rows.length + 1}`;
    return this.withAssistant({
      ...options,
      uuid,
      messageId: options.messageId ?? `msg-${uuid}`,
    });
  }

  /**
   * Countable Claude Opus 5.5 response reading 1,000 uncached and 9,000
   * cached input tokens. At list prices (input $4, cache read $0.20, output
   * $20 per 1M tokens) it weighs 1,450 + 5×`outputTokens` input tokens.
   * @param {{ uuid: string, outputTokens: number } & Pick<ClaudeAssistantOptions, "messageId" | "timestamp" | "parentUuid">} facts
   */
  withCountedOpusResponse({ outputTokens, ...placement }) {
    return this.withCountedAssistant({
      ...placement,
      model: "claude-opus-5-5",
      usage: {
        input_tokens: 1_000,
        cache_read_input_tokens: 9_000,
        cache_creation_input_tokens: 0,
        output_tokens: outputTokens,
        speed: "standard",
      },
    });
  }

  /** Developer reply "Resume" (`reply`) answered with 300 output tokens (`after-reply`). */
  withDeveloperReply() {
    return this.withUser({
      uuid: "reply",
      content: "Resume",
    }).withCountedOpusResponse({ uuid: "after-reply", outputTokens: 300 });
  }

  /** @param {{ agentId: string }} facts input (`<agentId>-result`) returning worker `agentId`'s tool result */
  withWorkerResult({ agentId }) {
    return this.withUser({
      uuid: `${agentId}-result`,
      toolUseResult: { agentId },
      content: workerToolResultContent(agentId),
    });
  }

  /**
   * Countable assistant row whose text embeds raw U+2028 and U+2029 inside
   * one JSONL row.
   * @param {ClaudeAssistantOptions} [options]
   */
  withAssistantHoldingLineSeparators(options = {}) {
    return this.withCountedAssistant({
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
