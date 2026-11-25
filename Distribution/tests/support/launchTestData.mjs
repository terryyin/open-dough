// @ts-check
import {
  claudeSession,
  codexSession,
  cursorSession,
} from "./hostSessionTestData.mjs";
import { testDataTimestamp } from "./testDataDefaults.mjs";
import { LaunchReportingBuilder } from "./launchReportingTestData.mjs";
import { requestFacts } from "./launchRequestTestData.mjs";
import {
  establishedSessionFacts,
  requestedPolicy,
  storyBranchFacts,
} from "./launchWorkspaceTestData.mjs";

/**
 * A launch the dashboard's machine store keeps, as the store holds it.
 * @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord
 */

/** @typedef {import("./launchRequestTestData.mjs").StoryFacts} StoryFacts */
/** @typedef {import("./launchRequestTestData.mjs").AdHocFacts} AdHocFacts */

// A kept launch's request, native session and workspace. The default Claude
// session takes its name from the title. Reporting and outcomes are inherited.
export class LaunchRecordBuilder extends LaunchReportingBuilder {
  /** @type {import("./launchRequestTestData.mjs").Requested | undefined} */
  #requested;
  /** @type {import("./launchWorkspaceTestData.mjs").StoryBranch | import("./launchWorkspaceTestData.mjs").OneShotBranch | undefined} */
  #storyBranch;
  /** @type {((name: string) => LaunchRecord["session"]) | undefined} */
  #session;
  #launchedAt = testDataTimestamp;
  /** @type {LaunchRecord["firstInput"]} */
  #firstInput;
  /** @type {LaunchRecord["defaultStart"]} */
  #defaultStart;
  /** @type {import("./launchWorkspaceTestData.mjs").AdHocWorkspace | undefined} */
  #adHocWorkspace;
  /** @type {LaunchRecord["request"]["model"]} */
  #model;
  /** @type {LaunchRecord["request"]["effort"]} */
  #effort;
  /** @type {LaunchRecord["request"]["options"]} */
  #options;

  /** @param {"execution" | "refinement"} workflow @param {StoryFacts} facts */
  ofWorkflow(workflow, facts) {
    const { identity, title, instruction, source = "open-dough" } = facts;
    this.#requested = {
      identity,
      title,
      source,
      workflow,
      ...(instruction === undefined ? {} : { instruction }),
    };
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
  adHoc({ instruction, title, source = "open-dough", ...facts }) {
    const { maintenance, ...fields } = facts;
    this.#requested = {
      ...(instruction !== undefined && { instruction }),
      title,
      source,
      ...fields,
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

  /**
   * The launch asked its host for this model.
   * @param {NonNullable<LaunchRecord["request"]["model"]>} model
   */
  requestingModel(model) {
    this.#model = model;
    return this;
  }

  /** @param {NonNullable<LaunchRecord["request"]["effort"]>} effort */
  requestingEffort(effort) {
    this.#effort = effort;
    return this;
  }

  /**
   * The launch selected these flags of its skill's options, in the
   * definition's order as the boundary records them.
   * @param {NonNullable<LaunchRecord["request"]["options"]>} options
   */
  requestingOptions(options) {
    this.#options = [...options];
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

  /** @param {NonNullable<LaunchRecord["defaultStart"]>} start */
  startingInExecutionCheckout(start) {
    this.#defaultStart = { ...start };
    return this;
  }

  /**
   * The ad hoc launch's start established an isolated workspace of the
   * project on this branch, waiting for review; a start that read the
   * worktree names its starting revision and the repository it keeps.
   * @param {{ workspace: string, branch: string, startingRevision?: string, repository?: string }} isolated
   */
  inIsolatedWorkspace(isolated) {
    this.#adHocWorkspace = { role: "isolated", ...isolated };
    return this;
  }

  /**
   * The ad hoc launch's start established its session in the project's
   * execution checkout `workspace` on `main` at `revision`, also the trunk it
   * fetched, landing as the developer chose.
   * @param {{ workspace: string, landing: "auto-land" | "review", revision: string }} checkout
   */
  inExecutionCheckout({ workspace, landing, revision }) {
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
      ...(this.#defaultStart && { defaultStart: this.#defaultStart }),
      ...this.outcomeFacts(this.#launchedAt),
    };
    const { reporting, landing } = this.reportingFacts();
    const requestField = requestFacts(requested, {
      host: session.host,
      model: this.#model,
      effort: this.#effort,
      options: this.#options,
      reporting,
      policy: requestedPolicy(adHocWorkspace ?? storyBranch),
    });
    return {
      ...requestField,
      session,
      ...(requested.workflow === "ad-hoc"
        ? establishedSessionFacts(adHocWorkspace)
        : storyBranchFacts(requested, storyBranch)),
      ...launchFacts,
      ...(landing && { landing }),
    };
  }
}
