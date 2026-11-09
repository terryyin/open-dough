// @ts-check
// Canonical external facts supplied to comparison reads, without resolving them.
/** @typedef {import("../../dashboard/server/storyPublishedEndpoints.ts").PublishedStoryEndpointFacts} PublishedStoryEndpointFacts */
/** @typedef {import("../../dashboard/server/takenStoryEndpoints.ts").TakenStoryEndpointFacts} TakenStoryEndpointFacts */

export class PublishedStoryEndpointBuilder {
  /** @param {Omit<PublishedStoryEndpointFacts, "identity" | "agent" | "completedAt" | "claims"> & Partial<Pick<PublishedStoryEndpointFacts, "identity" | "agent" | "completedAt" | "claims">>} facts */
  with(facts) {
    return {
      please: () => ({
        identity: "SEED-1#story",
        agent: "engineer",
        completedAt: "2026-11-09T00:00:00.000Z",
        claims: [],
        ...facts,
      }),
    };
  }
}

export class TakenStoryEndpointBuilder {
  /** @param {Omit<TakenStoryEndpointFacts, "identity" | "agent"> & Partial<Pick<TakenStoryEndpointFacts, "identity" | "agent">>} facts */
  with(facts) {
    return {
      please: () => ({ identity: "SEED-1#story", agent: "engineer", ...facts }),
    };
  }
}

export class RevisionCiRunBuilder {
  /** @param {import("../../dashboard/server/baseCiNearest.ts").ListedRun} facts */
  with(facts) {
    return {
      please: () => ({
        status: "completed",
        conclusion: "success",
        createdAt: "2026-11-09T00:00:00.000Z",
        startedAt: "2026-11-09T00:00:00Z",
        completedAt: "2026-11-09T00:04:00Z",
        ...facts,
      }),
    };
  }
}

export class CiProofBuilder {
  /** @param {import("../../dashboard/src/ciProof.ts").CiProofRun} run @param {readonly import("../../dashboard/src/ciProof.ts").CiProofEntry[]} [entries] @param {string} [repository] */
  summaryFor(run, entries = [], repository = "example/project") {
    return {
      please: () => ({
        kind: /** @type {const} */ ("summary"),
        summary: {
          schemaVersion: /** @type {const} */ (2),
          repository,
          ...run,
          entries: [...entries],
        },
      }),
    };
  }

  /** @param {import("../../dashboard/src/ciProof.ts").CiProofUnavailableReason} reason @param {string} [detail] */
  unavailable(reason, detail) {
    return {
      please: () => ({
        kind: /** @type {const} */ ("unavailable"),
        reason,
        ...(detail === undefined ? {} : { detail }),
      }),
    };
  }
}
