// @ts-check
// A session review read as the review handler takes it
// (../../../dashboard/server/storyReviewSnapshot.ts): one `claude` session of
// the `open-dough` project, with the launch records kept for that project.

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewRecordAdmission.ts").StoryReviewInput, { readonly kept: unknown }>} SessionReviewRead */

export class SessionReviewReadBuilder {
  /** @type {string | undefined} */
  #session;
  /** @type {readonly LaunchRecord[]} */
  #records = [];

  /** @param {string} session the reviewed `claude` session's ID */
  ofSession(session) {
    this.#session = session;
    return this;
  }

  /** @param {readonly LaunchRecord[]} records the project's kept launches */
  keeping(records) {
    this.#records = records;
    return this;
  }

  /** @returns {SessionReviewRead} */
  please() {
    const session = this.#session;
    if (session === undefined) throw new Error("choose .ofSession(...) first");
    return {
      read: { subject: { source: "open-dough", host: "claude", session } },
      kept: { records: this.#records },
    };
  }
}
