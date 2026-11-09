// @ts-check
// One project's landed CI history as this machine keeps it
// (`dashboard/server/landedCiHistoryStore.ts`): each trunk landing the
// dashboard recorded, by its receipt, with what it resolved to under the CI
// timing comparison's Landed rule -- its landed revision's own build, a final
// gap with its reason, or what it still waits for -- beside each build kept
// once by its run and attempt. A build is a push run's first attempt at the
// landed revision, linked under ci.invalid by its run, unless the case states
// otherwise.

/** @typedef {import("../../dashboard/server/landedCiHistoryStore.ts").ProjectHistory} ProjectHistory */
/** @typedef {ProjectHistory["landings"][string]} KeptLanding */
/** @typedef {ProjectHistory["builds"][string]} KeptBuild */
/** @typedef {Extract<KeptLanding["observed"], { kind: "gap" }>["reason"]} UnmeasuredReason */
/** @typedef {Extract<KeptLanding["observed"], { kind: "pending" }>["waitsFor"]} PendingWait */

/**
 * A recorded trunk landing: its receipt, landed revision, when the dashboard
 * recorded it, and the story it names, when it names one.
 * @typedef {{ receipt: string, revision: string, receivedAt: string, identity?: string }} LandingFacts
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

  /**
   * @param {LandingFacts} landing
   * @param {KeptLanding["observed"]} observed
   */
  #landing({ receipt, revision, receivedAt, identity }, observed) {
    this.#landings[receipt] = {
      revision,
      receivedAt,
      ...(identity !== undefined && { identity }),
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
      runUrl: `https://ci.invalid/runs/${String(runId)}`,
      runId,
      runAttempt: 1,
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
   * A landing no build measures, finally, for `reason`.
   * @param {LandingFacts & { reason: UnmeasuredReason }} facts
   */
  unmeasuredLanding({ reason, ...landing }) {
    this.#landing(landing, {
      kind: "gap",
      reason,
      explanation: `No measured build: ${reason}.`,
    });
    return this;
  }

  /**
   * A landing whose resolution is not final yet, waiting for `waitsFor`.
   * @param {LandingFacts & { waitsFor: PendingWait }} facts
   */
  pendingLanding({ waitsFor, ...landing }) {
    this.#landing(landing, { kind: "pending", waitsFor });
    return this;
  }

  /** @returns {ProjectHistory} */
  please() {
    return { landings: { ...this.#landings }, builds: { ...this.#builds } };
  }
}
