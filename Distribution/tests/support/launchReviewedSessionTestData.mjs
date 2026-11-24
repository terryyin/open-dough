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
import { minutesAgo } from "./testDataDefaults.mjs";

/**
 * A materialized checkout: its execution checkout workspace, base revision, and Git
 * directory as Git resolves it.
 * @typedef {{ integration: string, base: string, gitDirectory: string }} CheckoutFacts
 */

/**
 * What a landed ad hoc session captured: the repository it landed in and the
 * comparison it captured there, launched at a fixed instant and reporting
 * under the fixed reference unless stated.
 * @typedef {{ repository: string, comparing: { base: string, revision: string }, launchedAt?: string, reference?: string }} CapturedLanding
 */

export class LaunchReviewedSessionBuilder extends LaunchRecordBuilder {
  /**
   * The session declared a branch and received its storyless landing context.
   * @param {{ repository?: string, workspace?: string, branch?: string, committedTip?: string, trunkRevision?: string, origin?: string, reference?: string, deletedAt?: string }} [facts]
   */
  withDeclaredLanding({
    repository = "/repo",
    workspace = "/work",
    branch = "dough/decision",
    committedTip = "a1".repeat(20),
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
   * An execution checkout launch in the `claude` session `session` that identified
   * the worktree `workspace` on `branch` as its own branch and witnessed
   * trunk at the checkout’s base.
   * @param {string} session
   * @param {{ integration: string, base: string, gitDirectory: string }} checkout
   * @param {{ workspace: string, branch: string }} worktree
   */
  ofDeclaringExecutionCheckoutLaunch(session, checkout, { workspace, branch }) {
    const { base, gitDirectory } = checkout;
    return this.startedOnMainOf(checkout)
      .inClaudeSession({ sessionId: session })
      .enteredBranch({
        repository: gitDirectory,
        workspace,
        branch,
        committedTip: base,
        trunk: { remote: "origin", target: "refs/heads/main", revision: base },
      });
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

  /**
   * Stereotype: the blank launch "Fix the typo", launched an hour ago, whose
   * start kept the execution checkout and its repository.
   * @param {CheckoutFacts} checkout
   */
  startedOnMainOf({ integration, gitDirectory }) {
    return this.adHoc({ title: "Fix the typo" })
      .startingInExecutionCheckout({
        workspace: integration,
        repository: gitDirectory,
      })
      .inClaudeSession({ sessionId: "default-launch" })
      .launchedAt(minutesAgo(60));
  }

  /**
   * Stereotype: a session launched an hour ago and established for review in
   * the execution checkout at `revision` (its base unless stated).
   * @param {CheckoutFacts} checkout
   * @param {string} [revision]
   */
  establishedOnMainOf({ integration, base }, revision = base) {
    return this.adHoc({ title: "Established in execution checkout" })
      .inExecutionCheckout({
        workspace: integration,
        landing: "review",
        revision,
      })
      .inClaudeSession({ sessionId: "established-default-main" })
      .launchedAt(minutesAgo(60));
  }

  /**
   * Stereotype: the launch "Keep a draft", launched an hour ago, whose start
   * established the checkout's worktree `workspace` on `branch` at the base.
   * @param {CheckoutFacts} checkout
   * @param {{ workspace: string, branch: string }} worktree
   */
  isolatedIn({ base, gitDirectory }, { workspace, branch }) {
    return this.adHoc({ title: "Keep a draft" })
      .inIsolatedWorkspace({
        workspace,
        branch,
        startingRevision: base,
        repository: gitDirectory,
      })
      .inClaudeSession({ sessionId: `isolated-${branch}` })
      .launchedAt(minutesAgo(60));
  }
}
