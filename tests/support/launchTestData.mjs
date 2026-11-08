// @ts-check
import { launchOutcomeFacts } from "./launchOutcomeTestData.mjs";
import {
  isolatedWorkspaceFacts,
  storyBranchFacts,
} from "./launchWorkspaceTestData.mjs";

/** @typedef {import("./launchOutcomeTestData.mjs").LaunchOutcome} LaunchOutcome */
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
// session: its request, its host session, and, for an execution or a
// refinement that established one, the story branch
// (`./launchWorkspaceTestData.mjs`). Without `.onStoryBranch(...)` the
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
  /** @type {{ workspace: string, branch: string } | undefined} */
  #isolated;
  /** @type {LaunchOutcome} */
  #outcome = {};

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
   * The execution's start, or the refinement's preparation, established the
   * story's worktree on its story branch.
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

  /**
   * The ad hoc launch's start established an isolated workspace of the
   * project on this branch, waiting for review.
   * @param {{ workspace: string, branch: string }} isolated
   */
  inIsolatedWorkspace({ workspace, branch }) {
    this.#isolated = { workspace, branch };
    return this;
  }

  /**
   * The session reported its completion, with this final report message
   * (empty for a quiet completion).
   * @param {{ message: string, outcome?: "completed" | "unfinished" }} report
   */
  completedWith({ message, outcome = "completed" }) {
    this.#outcome = { ...this.#outcome, completion: { message, outcome } };
    return this;
  }

  /**
   * The session's work landed on `main` at this revision.
   * @param {string} revision a 40-character commit id
   */
  landedAt(revision) {
    this.#outcome = { ...this.#outcome, landedRevision: revision };
    return this;
  }

  /**
   * The developer marked the session Done at this time.
   * @param {string} at an ISO date-time
   */
  markedDoneAt(at) {
    this.#outcome = { ...this.#outcome, doneAt: at };
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
    if (storyBranch && requested.workflow === "ad-hoc")
      throw new Error(
        "only a story's start or preparation establishes a story branch",
      );
    const isolated = this.#isolated;
    if (isolated && requested.workflow !== "ad-hoc")
      throw new Error("only an ad hoc start establishes an isolated workspace");
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
          ...(isolated && {
            policy: {
              workspace: /** @type {const} */ ("isolated"),
              landing: /** @type {const} */ ("review"),
            },
          }),
        },
        session,
        ...isolatedWorkspaceFacts(isolated),
        launchedAt: this.#launchedAt,
        ...launchOutcomeFacts(this.#outcome, this.#launchedAt),
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
      ...storyBranchFacts(requested, storyBranch),
      launchedAt: this.#launchedAt,
      ...launchOutcomeFacts(this.#outcome, this.#launchedAt),
    };
  }
}
