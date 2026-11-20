// @ts-check
// A session review read as the review handler takes it
// (../../../dashboard/server/storyReviewSnapshot.ts): one `claude` session of
// the `open-dough` project, with the launch records kept for that project.
// `.readingFile(...)` turns it into the file read the file handlers take
// (../../../dashboard/server/storyReviewFileResponse.ts).
import { tmpdir } from "node:os";
import path from "node:path";
import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").StoryReviewInput, { readonly kept: unknown }>} SessionReviewRead */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewInput.ts").ReviewedFileInput, { readonly kept: unknown }>} SessionFileRead */
/**
 * The file a session file read names within a comparison, and the landed
 * run's launch reference when it names one.
 * @typedef {Omit<SessionFileRead["read"], "subject">} NamedFile
 */

/**
 * What a landed ad hoc session captured: the repository it landed in and the
 * comparison it captured there, launched at a fixed instant and reporting
 * under the fixed reference unless stated.
 * @typedef {{ repository: string, comparing: { base: string, revision: string }, launchedAt?: string, reference?: string }} CapturedLanding
 */

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
  ofLandedAdHocSession(
    session,
    { repository, comparing, launchedAt, reference },
  ) {
    const landing = new LaunchLandingBuilder()
      .capturedFrom({ repository })
      .comparing(comparing);
    if (reference !== undefined) landing.forLaunch(reference);
    const record = new LaunchRecordBuilder()
      .adHoc({ title: "Landed ad hoc" })
      .inIsolatedWorkspace({
        workspace: path.join(
          tmpdir(),
          `retired-ad-hoc-workspace-${process.pid}-${session}`,
        ),
        branch: "ad-hoc/landed",
      })
      .inClaudeSession({ sessionId: session })
      .withLanding(landing);
    if (launchedAt !== undefined) record.launchedAt(launchedAt);
    return this.ofSession(session).keeping([record.markedDone().please()]);
  }

  /**
   * The project keeps one Done ad hoc session of its Default main checkout at
   * `repository` whose kept commits are this one run.
   * @param {string} session the reviewed `claude` session's ID
   * @param {{ repository: string, run: { base: string, revision: string } }} kept
   */
  ofAdHocSessionWithKeptRun(session, { repository, run }) {
    const record = new LaunchRecordBuilder()
      .adHoc({ title: "Session with a kept run" })
      .inDefaultCheckout({
        workspace: repository,
        landing: "review",
        revision: run.base,
      })
      .inClaudeSession({ sessionId: session })
      .keptSessionCommits({ repository, runs: [run] })
      .markedDone()
      .please();
    return this.ofSession(session).keeping([record]);
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
      read: { subject: { source: "open-dough", host: "claude", session } },
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
