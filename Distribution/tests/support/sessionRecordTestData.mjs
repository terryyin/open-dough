// @ts-check
// Builder of a published session close record under the shared contract in
// ../../src/skills/dough-execute-plan/scripts/session-record.mjs. Node-free and
// typed only, so the native journeys' makeMe import closure does not reach the
// publication workflow.

import {
  sessionRecordVersion,
  sharedCheckoutUncertainty,
} from "../../src/skills/dough-execute-plan/scripts/session-record.mjs";

/**
 * @typedef {{
 *   version: typeof sessionRecordVersion,
 *   sessionId: string,
 *   workflow: string,
 *   closedAt: string,
 *   story?: string,
 *   title?: string,
 *   ranges: { base: string, candidate: string, uncertainty?: string }[],
 * }} SessionRecord
 */
/** @typedef {SessionRecord["ranges"][number]} SessionRange */

/**
 * A standalone ad hoc close of its recorded pairs in order, under a fresh
 * UUID; one pair unless more are added.
 */
export class SessionRecordBuilder {
  /** @type {SessionRange[]} */
  #ranges = [{ base: "a".repeat(40), candidate: "b".repeat(40) }];
  /** @type {string | undefined} */
  #closedAt;
  /** @type {string | undefined} */
  #sessionId;
  /** @type {string | undefined} */
  #story;
  /** @type {string | undefined} */
  #title;

  /** @param {string} sessionId the close's own UUID */
  forSession(sessionId) {
    this.#sessionId = sessionId;
    return this;
  }

  /** @param {string} story the story to which this close belongs */
  underStory(story) {
    this.#story = story;
    return this;
  }

  /** @param {string} title the title of an originating ad hoc Done story */
  titled(title) {
    this.#title = title;
    return this;
  }

  /** @param {string} closedAt the ISO time the session closed; now unless set */
  closedAt(closedAt) {
    this.#closedAt = closedAt;
    return this;
  }

  /** @param {SessionRange} range */
  closing(range) {
    this.#ranges = [range];
    return this;
  }

  /** @param {SessionRange} range the next recorded pair, after the others */
  andClosing(range) {
    this.#ranges = [...this.#ranges, range];
    return this;
  }

  // The last recorded pair may include another session's work from the same
  // checkout.
  sharingCheckout() {
    const last = this.#ranges.length - 1;
    this.#ranges = this.#ranges.map((range, at) =>
      at === last
        ? { ...range, uncertainty: sharedCheckoutUncertainty }
        : range,
    );
    return this;
  }

  /** @returns {SessionRecord} */
  please() {
    return {
      version: sessionRecordVersion,
      sessionId: this.#sessionId ?? globalThis.crypto.randomUUID(),
      workflow: "ad-hoc",
      closedAt: this.#closedAt ?? new Date().toISOString(),
      ...(this.#story === undefined ? {} : { story: this.#story }),
      ...(this.#title === undefined ? {} : { title: this.#title }),
      ranges: this.#ranges,
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
