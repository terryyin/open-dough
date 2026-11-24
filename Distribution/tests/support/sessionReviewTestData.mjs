// @ts-check
// A session review read as the review handler takes it
// (../../../dashboard/server/storyReviewSnapshot.ts): one admitted launch
// record and an optional comparison key.
// `.readingFile(...)` turns it into the file read the file handlers take
// (../../../dashboard/server/storyReviewFileResponse.ts).
import { LaunchReviewedSessionBuilder } from "./launchReviewedSessionTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").StoryReviewInput, { readonly record: LaunchRecord }>} SessionReviewRead */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").ReviewedFileInput, { readonly record: LaunchRecord }>} SessionFileRead */
/**
 * The file a session file read names within a comparison, and the landed
 * run's launch reference when it names one.
 * @typedef {SessionFileRead["read"]} NamedFile
 */
/**
 * @typedef {import("./launchReviewedSessionTestData.mjs").CapturedLanding} CapturedLanding
 */

export class SessionReviewReadBuilder {
  /** @type {LaunchRecord | undefined} */
  #record;
  /** @type {string | undefined} */
  #run;

  /** @param {LaunchRecord} record the admitted session launch */
  ofRecord(record) {
    this.#record = record;
    return this;
  }

  /** @param {string} run the kept comparison key to select */
  selectingRun(run) {
    this.#run = run;
    return this;
  }

  /**
   * The project keeps one Done ad hoc session that landed with this capture;
   * its isolated workspace has since been retired.
   * @param {string} session the reviewed `claude` session's ID
   * @param {CapturedLanding} landing
   */
  ofLandedAdHocSession(session, landing) {
    return this.ofRecord(
      new LaunchReviewedSessionBuilder()
        .ofLandedAdHocSession(session, landing)
        .please(),
    );
  }

  /**
   * The project keeps one Done ad hoc session of its execution checkout at
   * `repository` whose kept commits are this one run.
   * @param {string} session the reviewed `claude` session's ID
   * @param {{ repository: string, run: { base: string, revision: string } }} kept
   */
  ofAdHocSessionWithKeptRun(session, kept) {
    return this.ofRecord(
      new LaunchReviewedSessionBuilder()
        .ofAdHocSessionWithKeptRun(session, kept)
        .please(),
    );
  }

  /**
   * The read asks for this file of the session instead of its review.
   * @param {NamedFile} file
   */
  readingFile(file) {
    return new SessionFileReadBuilder(this.#admittedRecord(), file);
  }

  /** @returns {SessionReviewRead} */
  please() {
    return {
      read: this.#run === undefined ? {} : { run: this.#run },
      record: this.#admittedRecord(),
    };
  }

  #admittedRecord() {
    const record = this.#record;
    if (record === undefined) throw new Error("choose .ofRecord(...) first");
    return record;
  }
}

class SessionFileReadBuilder {
  #record;
  #file;

  /**
   * @param {LaunchRecord} record
   * @param {NamedFile} file
   */
  constructor(record, file) {
    this.#record = record;
    this.#file = file;
  }

  /** @returns {SessionFileRead} */
  please() {
    return {
      read: { ...this.#file },
      record: this.#record,
    };
  }
}
