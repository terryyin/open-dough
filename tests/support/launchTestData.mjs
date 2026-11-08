// @ts-check
import {
  claudeSession,
  codexSession,
  cursorSession,
} from "./hostSessionTestData.mjs";
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
 * @typedef {{ instruction: string, title: string, source?: string, followUp?: import("../../dashboard/src/followUpRequest.ts").FollowUp }} AdHocFacts
 */

// The kept launch of one story's execution or refinement, or of an ad hoc
// session: its request, its host session, and, for an execution or a
// refinement that established one, the story branch
// (`./launchWorkspaceTestData.mjs`). Without `.onStoryBranch(...)` the
// record keeps no established start or preparation. The session defaults to
// a `claude` one named after the title, the start's claim to fixed published
// facts, and the launch time to a fixed instant.
export class LaunchRecordBuilder {
  /** @type {(Required<StoryFacts> & { workflow: "execution" | "refinement" }) | (AdHocFacts & { source: string, workflow: "ad-hoc" }) | undefined} */
  #requested;
  /** @type {{ workspace: string, branch: string } | undefined} */
  #storyBranch;
  /** @type {((name: string) => LaunchRecord["session"]) | undefined} */
  #session;
  #launchedAt = "2026-01-01T00:00:00.000Z";
  /** @type {LaunchRecord["firstInput"]} */
  #firstInput;
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
  adHoc({ instruction, title, source = "open-dough", followUp }) {
    this.#requested = {
      instruction,
      title,
      source,
      ...(followUp && { followUp }),
      workflow: "ad-hoc",
    };
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
   * A `claude` session, by its ID and short ID, which is otherwise the ID's
   * first eight characters.
   * @param {import("./hostSessionTestData.mjs").ClaudeFacts} session
   */
  inClaudeSession(session) {
    this.#session = claudeSession(session);
    return this;
  }

  /**
   * A Codex thread and where it continues: the saved workspace and the
   * app-server endpoint, with the resume arguments and a notice as
   * `./hostSessionTestData.mjs` states them.
   * @param {import("./hostSessionTestData.mjs").CodexFacts} session
   */
  inCodexSession(session) {
    this.#session = codexSession(session);
    return this;
  }

  /**
   * A Cursor chat and where it continues: the saved workspace, with the
   * resume arguments and configuration scope as `./hostSessionTestData.mjs`
   * states them.
   * @param {import("./hostSessionTestData.mjs").CursorFacts} session
   */
  inCursorSession(session) {
    this.#session = cursorSession(session);
    return this;
  }

  /** @param {string} at an ISO date-time */
  launchedAt(at) {
    this.#launchedAt = at;
    return this;
  }

  /** @param {NonNullable<LaunchRecord["firstInput"]>} firstInput */
  withFirstInput(firstInput) {
    this.#firstInput = firstInput;
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
      : claudeSession({ sessionId: `${slug}-session`, shortId: slug })(
          requested.title,
        );
    const launchFacts = {
      launchedAt: this.#launchedAt,
      ...(this.#firstInput && { firstInput: this.#firstInput }),
      ...launchOutcomeFacts(this.#outcome, this.#launchedAt),
    };
    if (requested.workflow === "ad-hoc")
      return {
        request: {
          source: requested.source,
          host: session.host,
          workflow: requested.workflow,
          title: requested.title,
          instruction: requested.instruction,
          ...(requested.followUp && { followUp: requested.followUp }),
          ...(isolated && {
            policy: {
              workspace: /** @type {const} */ ("isolated"),
              landing: /** @type {const} */ ("review"),
            },
          }),
        },
        session,
        ...isolatedWorkspaceFacts(isolated),
        ...launchFacts,
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
      ...launchFacts,
    };
  }
}
