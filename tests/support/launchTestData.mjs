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

/**
 * What an ad hoc launch's request states: the project, the instruction it
 * started with, and the title kept for it.
 * @typedef {{ instruction: string, title: string, source?: string }} AdHocFacts
 */

// The kept launch of one story's execution or refinement, or of an ad hoc
// session: its request, its host session, and, for an execution whose start
// established one, the story branch. Without `.onStoryBranch(...)` the
// record keeps no established start or preparation. The session defaults to
// a `claude` one named after the title, the start's claim to fixed published
// facts, and the launch time to a fixed instant.
export class LaunchRecordBuilder {
  /** @type {(Required<StoryFacts> & { workflow: "execution" | "refinement" }) | (Required<AdHocFacts> & { workflow: "ad-hoc" }) | undefined} */
  #requested;
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
    this.#requested = { identity, title, source, workflow: "execution" };
    return this;
  }

  /**
   * A refinement launch of the story, in the `open-dough` project unless
   * stated.
   * @param {StoryFacts} facts
   */
  refining({ identity, title, source = "open-dough" }) {
    this.#requested = { identity, title, source, workflow: "refinement" };
    return this;
  }

  /**
   * An ad hoc launch with this instruction, in the `open-dough` project unless
   * stated.
   * @param {AdHocFacts} facts
   */
  adHoc({ instruction, title, source = "open-dough" }) {
    this.#requested = { instruction, title, source, workflow: "ad-hoc" };
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

  /**
   * A Cursor session and where it continues: the saved workspace and the
   * `cursor-agent` arguments.
   * @param {{ sessionId: string, continuation: { workspace: string, args?: string[] } }} session
   */
  inCursorSession({ sessionId, continuation: { workspace, args = [] } }) {
    this.#session = (name) => ({
      host: "cursor",
      sessionId,
      name,
      continuation: { workspace, args },
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
    const requested = this.#requested;
    const storyBranch = this.#storyBranch;
    if (!requested)
      throw new Error(
        "choose .executing(...), .refining(...) or .adHoc(...) first",
      );
    if (storyBranch && requested.workflow !== "execution")
      throw new Error("only an execution's start establishes a story branch");
    const slug = requested.title.toLowerCase().replaceAll(/\s+/g, "-");
    const session = this.#session
      ? this.#session(requested.title)
      : {
          host: /** @type {const} */ ("claude"),
          sessionId: `${slug}-session`,
          shortId: slug,
          name: requested.title,
        };
    if (requested.workflow === "ad-hoc")
      return {
        request: {
          source: requested.source,
          host: session.host,
          workflow: requested.workflow,
          title: requested.title,
          instruction: requested.instruction,
        },
        session,
        launchedAt: this.#launchedAt,
      };
    return {
      request: {
        source: requested.source,
        identity: requested.identity,
        title: requested.title,
        workflow: requested.workflow,
        host: session.host,
      },
      session,
      ...(storyBranch && {
        start: {
          identity: requested.identity,
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
