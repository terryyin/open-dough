// @ts-check
// A session review read as the review handler takes it
// (../../../dashboard/server/storyReviewSnapshot.ts): one session of the
// `open-dough` project, on the `claude` host unless named, with the launch
// records kept for that project.
// `.readingFile(...)` turns it into the file read the file handlers take
// (../../../dashboard/server/storyReviewFileResponse.ts).
import { LaunchReviewedSessionBuilder } from "./launchReviewedSessionTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").StoryReviewInput, { readonly kept: unknown }>} SessionReviewRead */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").ReviewedFileInput, { readonly kept: unknown }>} SessionFileRead */
/**
 * The file a session file read names within a comparison, and the landed
 * run's launch reference when it names one.
 * @typedef {Omit<SessionFileRead["read"], "subject">} NamedFile
 */
/**
 * @typedef {import("./launchReviewedSessionTestData.mjs").CapturedLanding} CapturedLanding
 */

export class SessionReviewReadBuilder {
  /** @type {string | undefined} */
  #session;
  /** @type {SessionReviewRead["read"]["subject"]["host"]} */
  #host = "claude";
  /** @type {readonly LaunchRecord[]} */
  #records = [];

  /**
   * @param {string} session the reviewed session's ID
   * @param {SessionReviewRead["read"]["subject"]["host"]} [host] its host
   */
  ofSession(session, host = "claude") {
    this.#session = session;
    this.#host = host;
    return this;
  }

  /** @param {readonly LaunchRecord[]} records the project's kept launches */
  keeping(records) {
    this.#records = records;
    return this;
  }

  /** @param {readonly LaunchRecord[]} records further kept launches */
  alsoKeeping(records) {
    this.#records = [...this.#records, ...records];
    return this;
  }

  /**
   * The project keeps one Done ad hoc session that landed with this capture;
   * its isolated workspace has since been retired.
   * @param {string} session the reviewed `claude` session's ID
   * @param {CapturedLanding} landing
   */
  ofLandedAdHocSession(session, landing) {
    return this.ofSession(session).keeping([
      new LaunchReviewedSessionBuilder()
        .ofLandedAdHocSession(session, landing)
        .please(),
    ]);
  }

  /**
   * The project keeps one Done ad hoc session of its Default main checkout at
   * `repository` whose kept commits are this one run.
   * @param {string} session the reviewed `claude` session's ID
   * @param {{ repository: string, run: { base: string, revision: string } }} kept
   */
  ofAdHocSessionWithKeptRun(session, kept) {
    return this.ofSession(session).keeping([
      new LaunchReviewedSessionBuilder()
        .ofAdHocSessionWithKeptRun(session, kept)
        .please(),
    ]);
  }

  /**
   * The read asks for this file of the session instead of its review.
   * @param {NamedFile} file
   */
  readingFile(file) {
    return new SessionFileReadBuilder(this.please(), file);
  }

  /** @returns {SessionReviewRead} */
  please() {
    const session = this.#session;
    if (session === undefined) throw new Error("choose .ofSession(...) first");
    return {
      read: { subject: { source: "open-dough", host: this.#host, session } },
      kept: { records: this.#records },
    };
  }
}

class SessionFileReadBuilder {
  #review;
  #file;

  /**
   * @param {SessionReviewRead} review
   * @param {NamedFile} file
   */
  constructor(review, file) {
    this.#review = review;
    this.#file = file;
  }

  /** @returns {SessionFileRead} */
  please() {
    return {
      read: { subject: this.#review.read.subject, ...this.#file },
      kept: this.#review.kept,
    };
  }
}
