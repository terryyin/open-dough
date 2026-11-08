// @ts-check
/**
 * A launch the dashboard's machine store keeps, as the store holds it.
 * @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord
 */

/**
 * What a story launch's request states: the project, the story, and its
 * title as the card shows it.
 * @typedef {{ identity: string, title: string, source?: string }} StoryFacts
 */

// The kept launch of one story's execution or refinement: its request, its
// host session, and, for an execution whose start established one, the story
// branch. Without `.onStoryBranch(...)` the record keeps no established start
// or preparation. The session defaults to a `claude` one named after the
// title, the start's claim to fixed published facts, and the launch time to a
// fixed instant.
export class LaunchRecordBuilder {
  /** @type {(Required<StoryFacts> & { workflow: "execution" | "refinement" }) | undefined} */
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
    this.#story = { identity, title, source, workflow: "execution" };
    return this;
  }

  /**
   * A refinement launch of the story, in the `open-dough` project unless
   * stated.
   * @param {StoryFacts} facts
   */
  refining({ identity, title, source = "open-dough" }) {
    this.#story = { identity, title, source, workflow: "refinement" };
    return this;
  }

  /**
   * The execution's start established the story's worktree on its story
   * branch.
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
    if (!story)
      throw new Error("choose .executing(...) or .refining(...) first");
    if (storyBranch && story.workflow !== "execution")
      throw new Error("only an execution's start establishes a story branch");
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
        workflow: story.workflow,
        host: session.host,
      },
      session,
      ...(storyBranch && {
        start: {
          identity: story.identity,
          publisherId: "a1b2c3",
          workspace: storyBranch.workspace,
          branch: storyBranch.branch,
          mode: /** @type {const} */ ("story-branch"),
          remote: "origin",
          target: "main",
          publishedSha: "b2".repeat(20),
        },
      }),
      launchedAt: this.#launchedAt,
    };
  }
}
