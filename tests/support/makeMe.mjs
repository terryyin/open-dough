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

/**
 * A launch the dashboard's machine store keeps, as the store holds it.
 * @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord
 */

/**
 * What a story launch's request states: the project, the story, and its
 * title as the card shows it.
 * @typedef {{ identity: string, title: string, source?: string }} StoryFacts
 */

// The kept launch of one story's execution: its request, its host session,
// and the story branch its start established. The session defaults to a
// `claude` one named after the title, the start's claim to fixed published
// facts, and the launch time to a fixed instant.
class LaunchRecordBuilder {
  /** @type {Required<StoryFacts> | undefined} */
  #story;
  /** @type {{ workspace: string, branch: string } | undefined} */
  #storyBranch;
  /** @type {((name: string) => LaunchRecord["session"]) | undefined} */
  #session;
  #launchedAt = "2026-01-01T00:00:00.000Z";

  /**
   * An execution launch of the story, in the `open-dough` project unless
   * stated.
   * @param {StoryFacts} facts
   */
  executing({ identity, title, source = "open-dough" }) {
    this.#story = { identity, title, source };
    return this;
  }

  /**
   * The start established the story's worktree on its story branch.
   * @param {{ workspace: string, branch: string }} storyBranch
   */
  onStoryBranch({ workspace, branch }) {
    this.#storyBranch = { workspace, branch };
    return this;
  }

  /**
   * A `claude` session, by its ID and short ID.
   * @param {{ sessionId: string, shortId: string }} session
   */
  inClaudeSession({ sessionId, shortId }) {
    this.#session = (name) => ({ host: "claude", sessionId, shortId, name });
    return this;
  }

  /**
   * A Codex thread and where it continues: the saved workspace and the
   * app-server endpoint.
   * @param {{ sessionId: string, continuation: { workspace: string, endpoint: string, args?: string[] } }} session
   */
  inCodexSession({
    sessionId,
    continuation: { workspace, endpoint, args = [] },
  }) {
    this.#session = (name) => ({
      host: "codex",
      sessionId,
      name,
      continuation: { workspace, endpoint, args },
    });
    return this;
  }

  /** @param {string} at an ISO date-time */
  launchedAt(at) {
    this.#launchedAt = at;
    return this;
  }

  /** @returns {LaunchRecord} */
  please() {
    const story = this.#story;
    const storyBranch = this.#storyBranch;
    if (!story) throw new Error("choose .executing(...) first");
    if (!storyBranch) throw new Error("choose .onStoryBranch(...) first");
    const slug = story.title.toLowerCase().replaceAll(/\s+/g, "-");
    const session = this.#session
      ? this.#session(story.title)
      : {
          host: /** @type {const} */ ("claude"),
          sessionId: `${slug}-session`,
          shortId: slug,
          name: story.title,
        };
    return {
      request: {
        source: story.source,
        identity: story.identity,
        title: story.title,
        workflow: "execution",
        host: session.host,
      },
      session,
      start: {
        identity: story.identity,
        publisherId: "a1b2c3",
        workspace: storyBranch.workspace,
        branch: storyBranch.branch,
        mode: "story-branch",
        remote: "origin",
        target: "main",
        publishedSha: "b2".repeat(20),
      },
      launchedAt: this.#launchedAt,
    };
  }
}

export const makeMe = {
  get anAgentProfile() {
    return new AgentProfileBuilder();
  },
  get aLaunchRecord() {
    return new LaunchRecordBuilder();
  },
};
