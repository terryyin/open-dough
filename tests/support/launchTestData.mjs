// @ts-check
import { launchOutcomeFacts } from "./launchOutcomeTestData.mjs";
import { requestFacts } from "./launchRequestTestData.mjs";
import {
  claudeSession,
  codexSession,
  cursorSession,
} from "./launchSessionTestData.mjs";
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
 * started with (none for a blank session), and the title kept for it.
 * @typedef {{ instruction?: string, title: string, source?: string, followUp?: import("../../dashboard/src/followUpRequest.ts").FollowUp }} AdHocFacts
 */

// The kept launch of one story's execution or refinement, or of an ad hoc
// session: its request (`./launchRequestTestData.mjs`), its host session
// (`./launchSessionTestData.mjs`), and, for an execution or a refinement that
// established one, the story branch (`./launchWorkspaceTestData.mjs`). Without `.onStoryBranch(...)` the
// record keeps no established start or preparation. The session defaults to
// a `claude` one named after the title, the start's claim to fixed published
// facts, and the launch time to a fixed instant.
export class LaunchRecordBuilder {
  /** @type {import("./launchRequestTestData.mjs").Requested | undefined} */
  #requested;
  /** @type {import("./launchWorkspaceTestData.mjs").StoryBranch | undefined} */
  #storyBranch;
  /** @type {import("./launchSessionTestData.mjs").NamedSession | undefined} */
  #session;
  #launchedAt = "2026-01-01T00:00:00.000Z";
  /** @type {LaunchRecord["firstInput"]} */
  #firstInput;
  /** @type {{ workspace: string, branch: string } | undefined} */
  #isolated;
  /** @type {LaunchOutcome} */
  #outcome = {};
  /** @type {NonNullable<LaunchRecord["request"]["reporting"]> | undefined} */
  #reporting;
  /** @type {LaunchRecord["request"]["model"]} */
  #model;

  /**
   * A launch of the story by this workflow, in the `open-dough` project
   * unless stated.
   * @param {"execution" | "refinement"} workflow
   * @param {StoryFacts} facts
   */
  ofWorkflow(workflow, { identity, title, source = "open-dough" }) {
    this.#requested = { identity, title, source, workflow };
    return this;
  }

  /** @param {StoryFacts} facts an execution launch of the story */
  executing(facts) {
    return this.ofWorkflow("execution", facts);
  }

  /** @param {StoryFacts} facts a refinement launch of the story */
  refining(facts) {
    return this.ofWorkflow("refinement", facts);
  }

  /**
   * An ad hoc launch with this instruction, in the `open-dough` project unless
   * stated.
   * @param {AdHocFacts} facts
   */
  adHoc({ instruction, title, source = "open-dough", followUp }) {
    this.#requested = {
      ...(instruction !== undefined && { instruction }),
      title,
      source,
      ...(followUp && { followUp }),
      workflow: "ad-hoc",
    };
    return this;
  }

  /**
   * The execution's start, or the refinement's preparation, established the
   * story's worktree on its story branch; an execution's claim may also name
   * its agent, its plan and the revision it started from, and a refinement's
   * preparation its agent and the revision that published its announcement.
   * @param {import("./launchWorkspaceTestData.mjs").StoryBranch} storyBranch
   */
  onStoryBranch(storyBranch) {
    this.#storyBranch = storyBranch;
    return this;
  }

  /**
   * The session reports its completion through this reporting context.
   * @param {NonNullable<LaunchRecord["request"]["reporting"]>} reporting
   */
  reportingThrough(reporting) {
    this.#reporting = reporting;
    return this;
  }

  /**
   * The launch asked its host for this model.
   * @param {NonNullable<LaunchRecord["request"]["model"]>} model
   */
  requestingModel(model) {
    this.#model = model;
    return this;
  }

  /** @param {Parameters<typeof claudeSession>[0]} session a `claude` session */
  inClaudeSession(session) {
    this.#session = claudeSession(session);
    return this;
  }

  /** @param {Parameters<typeof codexSession>[0]} session a Codex thread */
  inCodexSession(session) {
    this.#session = codexSession(session);
    return this;
  }

  /** @param {Parameters<typeof cursorSession>[0]} session a Cursor session */
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
   * The developer marked the session Done at this time; `problem` is what a
   * native operation of that mark could not finish, kept beside it.
   * @param {string} at an ISO date-time
   * @param {{ problem?: string }} [native]
   */
  markedDoneAt(at, { problem } = {}) {
    this.#outcome = {
      ...this.#outcome,
      doneAt: at,
      ...(problem !== undefined && { doneProblem: problem }),
    };
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
    const session = (
      this.#session ??
      claudeSession({ sessionId: `${slug}-session`, shortId: slug })
    )(requested.title);
    const launchFacts = {
      launchedAt: this.#launchedAt,
      ...(this.#firstInput && { firstInput: this.#firstInput }),
      ...launchOutcomeFacts(this.#outcome, this.#launchedAt),
    };
    const requestField = requestFacts(requested, {
      host: session.host,
      model: this.#model,
      reporting: this.#reporting,
      isolated: isolated !== undefined,
    });
    if (requested.workflow === "ad-hoc")
      return {
        ...requestField,
        session,
        ...isolatedWorkspaceFacts(isolated),
        ...launchFacts,
      };
    return {
      ...requestField,
      session,
      ...storyBranchFacts(requested, storyBranch),
      ...launchFacts,
    };
  }
}
