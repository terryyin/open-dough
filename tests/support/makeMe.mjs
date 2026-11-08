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
   * Taken execution. Trunk Mode has an incidental branch context. A Story
   * Branch assignment names the branch it publishes.
   * @param {AssignmentFacts & ({mode?: "trunk", branch?: string} | {mode: "story-branch", branch: string})} facts
   */
  executing({
    name,
    identity,
    mode = "trunk",
    branch = mode === "trunk" ? "origin/main" : undefined,
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

/** @typedef {import("../../dashboard/src/publishedSource.ts").PublishedSource} PublishedSource */
/** @typedef {import("../../dashboard/tests/publishedFiles.ts").PublishedRevision} PublishedRevision */
/** @typedef {Omit<Parameters<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-state-home.mjs").recordPreparation>[1], "identity" | "href" | "expectedBasis">} StoryPreparation */
/** @typedef {ReturnType<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs").normalizeStoryDependency>} SupplierAgreement */
/** @typedef {import("./published-plan.mjs").PlanSlice} PlanSlice */
/** @typedef {import("./published-plan.mjs").PlanCompletion} PlanCompletion */
/** @typedef {import("./published-plan.mjs").PlanProgress} PlanProgress */

/**
 * @param {Omit<PlanSlice, "type" | "status"> & Partial<Pick<PlanSlice, "type" | "status">>} facts
 * @returns {PlanSlice}
 */
function planSlice({ type = "Behavior", status = "planned", ...facts }) {
  return { ...facts, type, status };
}

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
  get aPublishedSource() {
    return {
      /** @param {Omit<PublishedSource, "ref" | "backlogPath"> & Partial<Pick<PublishedSource, "ref" | "backlogPath">>} facts */
      with({
        ref = "main",
        backlogPath = ".planning/PRODUCT-BACKLOG.md",
        ...facts
      }) {
        return { please: () => ({ ...facts, ref, backlogPath }) };
      },
    };
  },
  get aPublishedRevision() {
    return {
      /** @param {PublishedRevision} facts */
      with(facts) {
        return { please: () => ({ ...facts }) };
      },
    };
  },
  get aStoryPreparation() {
    return {
      /**
       * @template {StoryPreparation} Facts
       * @param {Facts} facts
       */
      with(facts) {
        return { please: () => ({ ...facts }) };
      },
    };
  },
  get aSupplierAgreement() {
    return {
      /** @param {Omit<SupplierAgreement, "implementation" | "rationale" | "condition"> & Partial<Pick<SupplierAgreement, "implementation" | "rationale" | "condition">>} facts */
      with({
        supplier,
        implementation = "Shared endpoint interpretation",
        rationale = "The supplier must deliver the endpoint contract before this story can validate its consumer behavior; normal reconciliation cannot supply the missing contract.",
        condition = "The selected endpoint contract is completed and integrated.",
        ...facts
      }) {
        return {
          please: () => ({
            supplier: { identity: supplier.identity, href: supplier.href },
            implementation,
            rationale,
            condition,
            ...facts,
          }),
        };
      },
    };
  },
  get aPlanSlice() {
    return {
      /** @param {Parameters<typeof planSlice>[0]} facts */
      with(facts) {
        return { please: () => planSlice(facts) };
      },
    };
  },
  get aSlicePlan() {
    return {
      /** @param {PlanProgress} facts */
      with({ slices, completion }) {
        return {
          please: () => ({
            slices: slices.map((slice) => ({ ...slice })),
            ...(completion === undefined
              ? {}
              : { completion: { ...completion } }),
          }),
        };
      },
      /**
       * For progress cases where the slice names and proof recipes are incidental.
       * @param {readonly PlanSlice["status"][]} statuses
       * @param {PlanCompletion} [completion]
       */
      withStatuses(statuses, completion) {
        return this.with({
          slices: statuses.map((status, at) =>
            planSlice({
              index: at + 1,
              name: `Slice ${at + 1}`,
              status,
              proof: `A journey observes slice ${at + 1}.`,
            }),
          ),
          ...(completion === undefined ? {} : { completion }),
        });
      },
    };
  },
};
