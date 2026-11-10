// @ts-check
import {
  claudeSession,
  codexSession,
  cursorSession,
} from "./hostSessionTestData.mjs";
import { LaunchOutcomeBuilder } from "./launchOutcomeTestData.mjs";
import { requestFacts } from "./launchRequestTestData.mjs";
import {
  establishedSessionFacts,
  requestedPolicy,
  storyBranchFacts,
} from "./launchWorkspaceTestData.mjs";

/**
 * A launch the dashboard's machine store keeps, as the store holds it.
 * @typedef {import("../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord
 */

/** @typedef {import("./launchRequestTestData.mjs").StoryFacts} StoryFacts */
/** @typedef {import("./launchRequestTestData.mjs").AdHocFacts} AdHocFacts */

// The kept launch of one story's execution or refinement, or of an ad hoc
// session: its request (`./launchRequestTestData.mjs`), its host session
// (`./hostSessionTestData.mjs`), and the workspace its start established
// (`./launchWorkspaceTestData.mjs`): a story branch, an ad hoc session's
// isolated workspace, or its place in the default checkout. Without one the
// record keeps no established start, preparation or session. The session
// defaults to a `claude` one named after the title, the start's claim to
// fixed published facts, and the launch time to a fixed instant. What the
// launch recorded after it started comes from `LaunchOutcomeBuilder`.
export class LaunchRecordBuilder extends LaunchOutcomeBuilder {
  /** @type {import("./launchRequestTestData.mjs").Requested | undefined} */
  #requested;
  /** @type {import("./launchWorkspaceTestData.mjs").StoryBranch | import("./launchWorkspaceTestData.mjs").OneShotBranch | undefined} */
  #storyBranch;
  /** @type {((name: string) => LaunchRecord["session"]) | undefined} */
  #session;
  #launchedAt = "2026-01-01T00:00:00.000Z";
  /** @type {LaunchRecord["firstInput"]} */
  #firstInput;
  /** @type {import("./launchWorkspaceTestData.mjs").AdHocWorkspace | undefined} */
  #adHocWorkspace;
  /** @type {NonNullable<LaunchRecord["request"]["reporting"]> | undefined} */
  #reporting;
  /** @type {LaunchRecord["request"]["model"]} */
  #model;
  /** @type {LaunchRecord["landing"]} */
  #landing;

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
  adHoc({ instruction, title, source = "open-dough", followUp, maintenance }) {
    this.#requested = {
      ...(instruction !== undefined && { instruction }),
      title,
      source,
      ...(followUp && { followUp }),
      ...(maintenance && { maintenance: { ...maintenance } }),
      workflow: "ad-hoc",
    };
    return this;
  }

  /**
   * The execution's start, or the refinement's preparation, established the
   * story's worktree on its story branch; an execution's claim may also name
   * its agent, its plan and the revision it started from, and a refinement's
   * preparation its agent and the revision that published its announcement.
   * @param {import("./launchWorkspaceTestData.mjs").StoryBranch | import("./launchWorkspaceTestData.mjs").OneShotBranch} storyBranch
   */
  onStoryBranch(storyBranch) {
    this.#storyBranch = storyBranch;
    return this;
  }

  /** @param {NonNullable<LaunchRecord["landing"]>} landing captured comparison */
  withLanding(landing) {
    this.#landing = landing;
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
   * `./hostSessionTestData.mjs` states them; a predecessor thread kept none.
   * @param {import("./hostSessionTestData.mjs").CodexFacts | import("./hostSessionTestData.mjs").PredecessorCodexFacts} session
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
    this.#adHocWorkspace = { role: "isolated", workspace, branch };
    return this;
  }

  /**
   * The ad hoc launch's start established its session in the project's
   * default checkout `workspace` on `main` at `revision`, also the trunk it
   * fetched, landing as the developer chose.
   * @param {{ workspace: string, landing: "auto-land" | "review", revision: string }} defaultCheckout
   */
  inDefaultCheckout({ workspace, landing, revision }) {
    this.#adHocWorkspace = {
      role: "default-checkout",
      workspace,
      landing,
      revision,
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
    const adHocWorkspace = this.#adHocWorkspace;
    if (adHocWorkspace && requested.workflow !== "ad-hoc")
      throw new Error(
        "only an ad hoc start establishes its session's workspace",
      );
    const slug = requested.title.toLowerCase().replaceAll(/\s+/g, "-");
    const session = (
      this.#session ??
      claudeSession({ sessionId: `${slug}-session`, shortId: slug })
    )(requested.title);
    const launchFacts = {
      launchedAt: this.#launchedAt,
      ...(this.#firstInput && { firstInput: this.#firstInput }),
      ...this.outcomeFacts(this.#launchedAt),
    };
    const requestField = requestFacts(requested, {
      host: session.host,
      model: this.#model,
      reporting: this.#reporting,
      policy: requestedPolicy(adHocWorkspace ?? storyBranch),
    });
    return {
      ...requestField,
      session,
      ...(requested.workflow === "ad-hoc"
        ? establishedSessionFacts(adHocWorkspace)
        : storyBranchFacts(requested, storyBranch)),
      ...launchFacts,
      ...(this.#landing && { landing: this.#landing }),
    };
  }
}
