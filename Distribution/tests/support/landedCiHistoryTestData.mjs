// @ts-check
// One project's landed CI history as this machine keeps it
// (`dashboard/server/landedCiHistoryStore.ts`): each trunk landing the
// dashboard recorded, by its receipt, with what it resolved to under the CI
// timing comparison's Landed rule -- its landed revision's own build, a final
// gap with its reason and the build the rule named for it, or what it still
// waits for and the run it waits on -- beside each build kept once by its run
// and attempt. A build is a push run's first attempt, linked under ci.invalid
// by its run, at the landed revision unless the case states otherwise.

import { attemptTimingBasis } from "./ciComparisonAnswerTestData.mjs";

/** @typedef {import("../../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */
/** @typedef {ProjectHistory["landings"][string]} KeptLanding */
/** @typedef {ProjectHistory["builds"][string]} KeptBuild */
/** @typedef {import("../../../dashboard/src/launchLanding.ts").LaunchLanding} LaunchLanding */
/** @typedef {Extract<KeptLanding["observed"], { kind: "gap" }>["reason"]} UnmeasuredReason */
/** @typedef {Extract<KeptLanding["observed"], { kind: "pending" }>["waitsFor"]} PendingWait */
/** @typedef {import("../../../dashboard/src/landedCiHistory.ts").Provenance} Provenance */

// Canonical wire data, independent of dashboard runtime modules as required by
// tests/test-data-architecture.md. Native evidence hashes this builder's closure.

/**
 * A push run's first attempt, linked under ci.invalid by its run.
 * @param {number} runId
 */
const firstAttemptOf = (runId) => ({
  runUrl: `https://ci.invalid/runs/${String(runId)}`,
  runId,
  runAttempt: 1,
});

/**
 * A recorded trunk landing: its receipt, landed revision, when the dashboard
 * recorded it, and the story it names, when it names one.
 * @typedef {{ receipt: string, revision: string, receivedAt: string, identity?: string | undefined, repository?: string | undefined, target?: string | undefined }} LandingFacts
 */

/**
 * The landing's own build: its run (first attempt) and the attempt's start
 * and completion.
 * @typedef {{ runId: number, startedAt: string, completedAt: string }} BuildFacts
 */

export class LandedCiHistoryBuilder {
  /** @type {Record<string, KeptLanding>} */
  #landings = {};
  /** @type {Record<string, KeptBuild>} */
  #builds = {};
  /** @type {string[] | undefined} */
  #trunkOrder;

  /**
   * @param {LandingFacts} landing
   * @param {KeptLanding["observed"]} observed
   */
  #landing(
    { receipt, revision, receivedAt, identity, repository, target },
    observed,
  ) {
    this.#landings[receipt] = {
      revision,
      receivedAt,
      ...(identity !== undefined && { identity }),
      ...(repository !== undefined && { repository }),
      ...(target !== undefined && { target }),
      observed,
    };
  }

  /**
   * @param {LandingFacts & BuildFacts} facts
   * @param {"pass" | "failed"} state
   */
  #built({ runId, startedAt, completedAt, ...landing }, state) {
    const key = `run/${String(runId)}/1`;
    this.#builds[key] = {
      revision: landing.revision,
      state,
      timingBasis: attemptTimingBasis,
      ...firstAttemptOf(runId),
      startedAt,
      completedAt,
    };
    this.#landing(landing, { kind: "build", build: key, selection: "exact" });
    return this;
  }

  /**
   * A landing measured by its landed revision's own passed build.
   * @param {LandingFacts & BuildFacts} facts
   */
  measuredLanding(facts) {
    return this.#built(facts, "pass");
  }

  /**
   * A landing whose landed revision's own build failed.
   * @param {LandingFacts & BuildFacts} facts
   */
  failedLanding(facts) {
    return this.#built(facts, "failed");
  }

  /**
   * A landing no build measures, finally, for `reason`, naming the build the
   * rule named for it, when the case states one: its revision, how it would
   * have stood for the landing, and its run.
   * @param {LandingFacts & { reason: UnmeasuredReason, build?: { revision: string, provenance: Provenance, runId: number } }} facts
   */
  unmeasuredLanding({ reason, build, ...landing }) {
    this.#landing(landing, {
      kind: "gap",
      reason,
      explanation: `No measured build: ${reason}.`,
      ...(build !== undefined && {
        build: {
          revision: build.revision,
          provenance: build.provenance,
          ...firstAttemptOf(build.runId),
        },
      }),
    });
    return this;
  }

  /**
   * A landing whose resolution is not final yet, waiting for `waitsFor`, on
   * the run `runId` when the case states one.
   * @param {LandingFacts & { waitsFor: PendingWait, runId?: number }} facts
   */
  pendingLanding({ waitsFor, runId, ...landing }) {
    this.#landing(landing, {
      kind: "pending",
      waitsFor,
      ...(runId !== undefined && { run: firstAttemptOf(runId) }),
    });
    return this;
  }

  /** @param {string[]} revisions */
  inTrunkOrder(revisions) {
    this.#trunkOrder = [...revisions];
    return this;
  }

  /**
   * A retained measured attempt and the landing it represents, including
   * validated proof and explicit attempt/repository facts when supplied.
   * @param {LaunchLanding} landing
   * @param {string} key
   * @param {KeptBuild} build
   * @param {"exact" | "equivalent" | "later"} [selection]
   */
  recording(landing, key, build, selection = "exact") {
    this.#landing(landing, { kind: "build", build: key, selection });
    this.#builds[key] = {
      timingBasis: attemptTimingBasis,
      startedAt: landing.receivedAt,
      ...build,
    };
    return this;
  }

  /** @param {string} key @param {NonNullable<KeptBuild["proof"]>} proof */
  proofFor(key, proof) {
    const build = this.#builds[key];
    if (build === undefined) throw new Error(`No retained build ${key}`);
    this.#builds[key] = { ...build, proof };
    return this;
  }

  /**
   * A retained explanation-only gap has no invented final classification.
   * @param {LaunchLanding} landing
   * @param {string} explanation
   * @param {UnmeasuredReason} [reason]
   */
  gap(landing, explanation, reason = "unclassified") {
    this.#landing(landing, { kind: "gap", reason, explanation });
    return this;
  }

  /**
   * @param {LaunchLanding} landing
   * @param {Extract<KeptLanding["observed"], { kind: "pending" }>} pending
   */
  pending(landing, pending) {
    this.#landing(landing, pending);
    return this;
  }

  /** @returns {ProjectHistory} */
  please() {
    return {
      landings: { ...this.#landings },
      builds: { ...this.#builds },
      ...(this.#trunkOrder === undefined
        ? {}
        : { trunkOrder: [...this.#trunkOrder] }),
    };
  }
}
