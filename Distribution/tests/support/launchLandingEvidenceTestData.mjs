// @ts-check
// A launch's landing as the dashboard's machine store keeps it: the
// repository authority the dashboard captures landings from
// (`LandingAuthorityBuilder`) and the landing evidence it keeps on the launch
// (`LaunchLandingBuilder`, which `LaunchOutcomeBuilder.landedAt` composes).
// Both name the same common facts: the repository, the story the launch is
// for, and the trunk it lands on. The evidence adds the launch's reporting
// reference, the delivery and receipt, and the comparison
// (`./launchLandingTestData.mjs`).

import {
  fixedReceivedAt,
  landingDelivery,
  landingReceipt,
  mainOfOrigin,
} from "./launchLandingTestData.mjs";

/** @typedef {import("../../../dashboard/src/launchLanding.ts").LaunchLanding} LaunchLanding */
/** @typedef {import("../../../dashboard/src/launchLanding.ts").LandingRepository} LandingRepository */
/** @typedef {import("./launchLandingTestData.mjs").Comparison} Comparison */

/**
 * The facts repository authority and landing evidence share.
 * @typedef {Pick<LandingRepository, "repository" | "identity" | "remote" | "target">} LandingCommonFacts
 */

// The repository authority the dashboard keeps for capturing a launch's
// landings: the repository, the story worktree and branch the launch works
// in, and the story, landing on `origin`'s `main` unless stated. The
// repository and worktree are always stated.
export class LandingAuthorityBuilder {
  /** @type {Pick<LandingRepository, "remote" | "target"> & Partial<LandingRepository>} */
  #authority = { remote: mainOfOrigin.remote, target: mainOfOrigin.target };

  /** @param {string} repository the common repository landings are read from */
  ofRepository(repository) {
    this.#authority = { ...this.#authority, repository };
    return this;
  }

  /** @param {Pick<LandingRepository, "workspace" | "branch">} worktree */
  inWorktree({ workspace, branch }) {
    this.#authority = { ...this.#authority, workspace, branch };
    return this;
  }

  /** @param {string} identity the story the launch is for */
  forStory(identity) {
    this.#authority = { ...this.#authority, identity };
    return this;
  }

  /** @returns {LandingRepository} */
  please() {
    const { repository, workspace, branch, remote, target, identity } =
      this.#authority;
    if (repository === undefined) throw new Error("state .ofRepository(...)");
    if (workspace === undefined || branch === undefined)
      throw new Error("state .inWorktree({ workspace, branch })");
    return {
      repository,
      workspace,
      branch,
      ...(identity !== undefined && { identity }),
      remote,
      target,
    };
  }
}

// The landing evidence the store keeps for a launch: of `open-dough`'s
// repository for the launch's fixed reporting reference under a fixed
// delivery and receipt onto `main`, received at a fixed instant, unless
// stated. The comparison is always stated.
export class LaunchLandingBuilder {
  /** @type {Partial<Omit<LaunchLanding, "receivedAt">>} */
  #landing = {};
  #receivedAt = fixedReceivedAt;

  /**
   * Captured from this repository authority, or the common facts it names:
   * its repository, story and trunk target.
   * @param {Pick<LandingCommonFacts, "repository"> & Partial<LandingCommonFacts>} authority
   */
  capturedFrom({ repository, identity, remote, target }) {
    this.#landing = {
      ...this.#landing,
      repository,
      ...(identity !== undefined && { identity }),
      ...(remote !== undefined && { remote }),
      ...(target !== undefined && { target }),
    };
    return this;
  }

  /** @param {string} reference the launch's reporting reference */
  forLaunch(reference) {
    this.#landing = { ...this.#landing, reference };
    return this;
  }

  /** @param {Pick<LaunchLanding, "delivery" | "receipt">} delivered */
  deliveredAs({ delivery, receipt }) {
    this.#landing = { ...this.#landing, delivery, receipt };
    return this;
  }

  /** @param {Comparison} comparison */
  comparing({ base, revision }) {
    this.#landing = { ...this.#landing, base, revision };
    return this;
  }

  /** @param {string} at an ISO date-time */
  receivedAt(at) {
    this.#receivedAt = at;
    return this;
  }

  /** @returns {LaunchLanding} */
  please() {
    const { base, revision, ...landing } = this.#landing;
    if (base === undefined || revision === undefined)
      throw new Error("state .comparing({ base, revision })");
    return {
      repository: "open-dough",
      ...mainOfOrigin,
      delivery: landingDelivery,
      receipt: landingReceipt,
      ...landing,
      base,
      revision,
      receivedAt: this.#receivedAt,
    };
  }
}
