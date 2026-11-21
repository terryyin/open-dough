// @ts-check
// Builder of a published session close record, the value
// `sessionRecord` in ../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs
// encodes beside the backlog. Node-free and typed only, so the native journeys'
// makeMe import closure does not reach the publication workflow.

/** @typedef {ReturnType<typeof import("../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs").sessionRecord>} SessionRecord */
/** @typedef {SessionRecord["ranges"][number]} SessionRange */

/** A standalone ad hoc close of one recorded pair, under a fresh UUID. */
export class SessionRecordBuilder {
  /** @type {SessionRange} */
  #range = { base: "a".repeat(40), candidate: "b".repeat(40) };

  /** @param {SessionRange} range */
  closing(range) {
    this.#range = range;
    return this;
  }

  /** @returns {SessionRecord} */
  please() {
    return {
      version: 1,
      sessionId: globalThis.crypto.randomUUID(),
      workflow: "ad-hoc",
      closedAt: "2026-11-20T10:00:00.000Z",
      ranges: [this.#range],
    };
  }
}

/**
 * @typedef {object} SessionRecordMakeMe
 * @property {SessionRecordBuilder} aSessionRecord
 */

/** @returns {PropertyDescriptorMap} */
export function sessionRecordMakeMeProperties() {
  return {
    aSessionRecord: {
      enumerable: true,
      get() {
        return new SessionRecordBuilder();
      },
    },
  };
}
