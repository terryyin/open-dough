// @ts-check
// MakeMe: the one entry point for domain data that tests arrange. Each
// `makeMe.aThing` access starts a fresh builder; its named methods state the
// facts that drive the case and `.please()` returns the product value.
/**
 * The facts a published agent profile records, as `renderAgentProfile` takes
 * them.
 * @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs").renderAgentProfile>[0]} AgentProfile
 */

/**
 * What any assignment states: who holds it, for which work, and what the
 * agent reported. Host and model stay unrecorded unless given.
 * @typedef {Pick<AgentProfile, "name" | "identity" | "host" | "model">} AssignmentFacts
 */

// An agent's published profile. The activity is always named, as
// `parseAgentProfile` reads it back, so built and read-back profiles compare
// equal.
class AgentProfileBuilder {
  /** @type {AgentProfile | undefined} */
  #profile;

  /**
   * Preparation of a queued story, which records no execution mode or branch.
   * The story identity defaults when the case does not depend on it.
   * @param {Omit<AssignmentFacts, "identity"> & Partial<Pick<AgentProfile, "identity">>} facts
   */
  preparing({ name, identity = "SEED-1#queued-story", host, model }) {
    this.#profile = withReport(
      { name, identity, activity: "preparation" },
      { host, model },
    );
    return this;
  }

  /**
   * Taken execution, in Trunk Mode on `origin/main` unless stated.
   * @param {AssignmentFacts & Pick<AgentProfile, "mode" | "branch">} facts
   */
  executing({
    name,
    identity,
    mode = "trunk",
    branch = "origin/main",
    host,
    model,
  }) {
    this.#profile = withReport(
      { name, identity, activity: "execution", mode, branch },
      { host, model },
    );
    return this;
  }

  /** @returns {AgentProfile} */
  please() {
    if (!this.#profile)
      throw new Error("choose .preparing(...) or .executing(...) first");
    return this.#profile;
  }
}

/**
 * @param {AgentProfile} profile
 * @param {Pick<AgentProfile, "host" | "model">} report
 * @returns {AgentProfile}
 */
const withReport = (profile, { host, model }) => ({
  ...profile,
  ...(host === undefined ? {} : { host }),
  ...(model === undefined ? {} : { model }),
});

/** @typedef {Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs").renderEntry>[0]} BacklogEntry */

export const makeMe = {
  get anAgentProfile() {
    return new AgentProfileBuilder();
  },
  get aBacklogEntry() {
    return {
      /** @param {BacklogEntry} facts */
      with(facts) {
        return { please: () => ({ ...facts }) };
      },
    };
  },
};
