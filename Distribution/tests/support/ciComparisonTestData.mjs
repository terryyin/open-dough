// @ts-check
// Canonical external facts supplied to comparison reads, without resolving them.
/** @typedef {import("../../../dashboard/server/storyPublishedEndpoints.ts").PublishedStoryEndpointFacts} PublishedStoryEndpointFacts */
/** @typedef {import("../../../dashboard/server/takenStoryEndpoints.ts").TakenStoryEndpointFacts} TakenStoryEndpointFacts */

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
