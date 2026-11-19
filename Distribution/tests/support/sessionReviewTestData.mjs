// @ts-check
// A session review read as the review handler takes it
// (../../../dashboard/server/storyReviewSnapshot.ts): one `claude` session of
// the `open-dough` project, with the launch records kept for that project.
import { tmpdir } from "node:os";
import path from "node:path";
import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {Extract<import("../../../dashboard/server/storyReviewRecordAdmission.ts").StoryReviewInput, { readonly kept: unknown }>} SessionReviewRead */

/**
 * What a landed ad hoc session captured: the repository it landed in and the
 * comparison it captured there, launched at a fixed instant unless stated.
 * @typedef {{ repository: string, comparing: { base: string, revision: string }, launchedAt?: string }} CapturedLanding
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

  /**
   * The project keeps one Done ad hoc session that landed with this capture;
   * its isolated workspace has since been retired.
   * @param {string} session the reviewed `claude` session's ID
   * @param {CapturedLanding} landing
   */
  ofLandedAdHocSession(session, { repository, comparing, launchedAt }) {
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
      .withLanding(
        new LaunchLandingBuilder()
          .capturedFrom({ repository })
          .comparing(comparing),
      );
    if (launchedAt !== undefined) record.launchedAt(launchedAt);
    return this.ofSession(session).keeping([record.markedDone().please()]);
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
