// @ts-check
// Named session records that landing and review cases share. All are
// steps on the launch record builder
// (`./launchTestData.mjs`) that `makeMe.aLaunchRecord` returns; this layer
// keeps `launchTestData.mjs` within the 250-line check.
import { tmpdir } from "node:os";
import path from "node:path";
import {
  LandingAuthorityBuilder,
  LaunchLandingBuilder,
} from "./launchLandingEvidenceTestData.mjs";
import { reportingReference } from "./launchLandingTestData.mjs";
import { LaunchRecordBuilder } from "./launchTestData.mjs";

/**
 * What a landed ad hoc session captured: the repository it landed in and the
 * comparison it captured there, launched at a fixed instant and reporting
 * under the fixed reference unless stated.
 * @typedef {{ repository: string, comparing: { base: string, revision: string }, launchedAt?: string, reference?: string }} CapturedLanding
 */

export class LaunchReviewedSessionBuilder extends LaunchRecordBuilder {
  /**
   * The session declared a branch and received its storyless landing context.
   * @param {{ repository?: string, workspace?: string, branch?: string, committedTip?: string, tree?: string, trunkRevision?: string, origin?: string, reference?: string, deletedAt?: string }} [facts]
   */
  withDeclaredLanding({
    repository = "/repo",
    workspace = "/work",
    branch = "dough/decision",
    committedTip = "a1".repeat(20),
    tree = committedTip,
    trunkRevision,
    origin = "http://127.0.0.1:4173",
    reference = reportingReference,
    deletedAt,
  } = {}) {
    const authority = new LandingAuthorityBuilder()
      .ofRepository(repository)
      .inWorktree({ workspace, branch })
      .please();
    return this.enteredBranch({
      repository,
      workspace,
      branch,
      committedTip,
      tree,
      trunk: {
        remote: authority.remote,
        target: authority.target,
        ...(trunkRevision !== undefined && { revision: trunkRevision }),
      },
    }).withLandingReporting({
      origin,
      authority,
      preparations: [],
      branchContext: {
        reference,
        file: "/tmp/declared-landing-context.json",
      },
      ...(deletedAt !== undefined && { deletedAt }),
    });
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

  /**
   * A blank ad hoc launch in the `claude` session `session` whose start found
   * the Default main checkout on main at its `base`, naming the checkout's
   * `gitDirectory` as its repository unless `facts` state another.
   * @param {string} session
   * @param {{ integration: string, base: string, gitDirectory: string }} checkout
   * @param {{ title?: string | undefined, gitDirectory?: string | undefined }} [facts]
   */
  ofDefaultMainLaunch(
    session,
    { integration, base, gitDirectory: checkoutGitDirectory },
    { title = "Fix the typo", gitDirectory = checkoutGitDirectory } = {},
  ) {
    return this.adHoc({ title })
      .startingInDefaultCheckout({
        workspace: integration,
        startingRevision: base,
        repository: gitDirectory,
        branch: "refs/heads/main",
      })
      .inClaudeSession({ sessionId: session });
  }

  /**
   * A Default main launch in the `claude` session `session` that identified
   * the worktree `workspace` on `branch`, then holding the checkout's base
   * `tree`, as its own branch, witnessing trunk and its default branch at
   * that base.
   * @param {string} session
   * @param {{ integration: string, base: string, gitDirectory: string }} checkout
   * @param {{ workspace: string, branch: string, tree: string }} worktree
   */
  ofDeclaringDefaultMainLaunch(session, checkout, { workspace, branch, tree }) {
    const { base, gitDirectory } = checkout;
    return this.ofDefaultMainLaunch(session, checkout).enteredBranch({
      repository: gitDirectory,
      workspace,
      branch,
      committedTip: base,
      tree,
      defaultTip: base,
      trunk: { remote: "origin", target: "refs/heads/main", revision: base },
    });
  }

  /**
   * A blank ad hoc launch in the `claude` session `session` whose start
   * established the worktree `workspace` of the checkout on `branch` at
   * `startingRevision` (the checkout's `base` by default), for review.
   * @param {string} session
   * @param {{ base: string, gitDirectory: string }} checkout
   * @param {{ workspace: string, branch: string, startingRevision?: string | undefined, title?: string | undefined }} worktree
   */
  ofIsolatedLaunch(
    session,
    { base, gitDirectory },
    { workspace, branch, startingRevision = base, title = "Keep a draft" },
  ) {
    return this.adHoc({ title })
      .inIsolatedWorkspace({
        workspace,
        branch,
        startingRevision,
        repository: gitDirectory,
      })
      .inClaudeSession({ sessionId: session });
  }

  /**
   * An ad hoc session in the `claude` session `session` established in the
   * Default main checkout at `revision` (its `base` by default), for review.
   * @param {string} session
   * @param {{ integration: string, base: string }} checkout
   * @param {{ title?: string | undefined, revision?: string | undefined }} [facts]
   */
  ofEstablishedDefaultMainSession(
    session,
    { integration, base },
    { title = "Established in Default main", revision = base } = {},
  ) {
    return this.adHoc({ title })
      .inDefaultCheckout({
        workspace: integration,
        landing: "review",
        revision,
      })
      .inClaudeSession({ sessionId: session });
  }

  /**
   * The project keeps one Done one-shot execution of the story in this
   * `claude` session, reporting under `reference`; a one-shot start counts as
   * the story's landed run.
   * @param {string} session the story launch's `claude` session ID
   * @param {{ identity: string, reference: string }} story
   */
  ofOneShotStoryLaunch(session, { identity, reference }) {
    return this.executing({ identity, title: "One-shot story" })
      .onStoryBranch({
        workspace: path.join(tmpdir(), `one-shot-${process.pid}-${session}`),
        branch: "one-shot/story",
        tracking: "one-shot",
        role: "isolated",
        landing: "auto-land",
      })
      .inClaudeSession({ sessionId: session })
      .reportingThrough({
        origin: "http://127.0.0.1:4173",
        command: "claude",
        reference,
      })
      .markedDone();
  }
}
