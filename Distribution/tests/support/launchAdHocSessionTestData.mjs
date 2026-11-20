// @ts-check
// Named Done ad hoc session records that review cases share: a landed
// isolated session, and a Default-main session with one kept run. Both are
// steps on the launch record builder (`./launchTestData.mjs`) that
// `makeMe.aLaunchRecord` returns; this layer keeps `launchTestData.mjs`
// within the 250-line check.
import { tmpdir } from "node:os";
import path from "node:path";
import { LaunchLandingBuilder } from "./launchLandingEvidenceTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";

/**
 * What a landed ad hoc session captured: the repository it landed in and the
 * comparison it captured there, launched at a fixed instant and reporting
 * under the fixed reference unless stated.
 * @typedef {{ repository: string, comparing: { base: string, revision: string }, launchedAt?: string, reference?: string }} CapturedLanding
 */

export class LaunchAdHocSessionBuilder extends LaunchRecordBuilder {
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
    const landingBuilder = new LaunchLandingBuilder()
      .capturedFrom({ repository })
      .comparing(comparing);
    if (reference !== undefined) landingBuilder.forLaunch(reference);
    this.adHoc({ title: "Landed ad hoc" })
      .inIsolatedWorkspace({
        workspace: path.join(
          tmpdir(),
          `retired-ad-hoc-workspace-${process.pid}-${session}`,
        ),
        branch: "ad-hoc/landed",
      })
      .inClaudeSession({ sessionId: session })
      .withLanding(landingBuilder);
    if (launchedAt !== undefined) this.launchedAt(launchedAt);
    return this.markedDone();
  }

  /**
   * The project keeps one Done ad hoc session of its Default main checkout at
   * `repository` whose kept commits are this one run.
   * @param {string} session the reviewed `claude` session's ID
   * @param {{ repository: string, run: { base: string, revision: string } }} kept
   */
  ofAdHocSessionWithKeptRun(session, { repository, run }) {
    return this.adHoc({ title: "Session with a kept run" })
      .inDefaultCheckout({
        workspace: repository,
        landing: "review",
        revision: run.base,
      })
      .inClaudeSession({ sessionId: session })
      .keptSessionCommits({ repository, runs: [run] })
      .markedDone();
  }
}
