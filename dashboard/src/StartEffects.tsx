// What a story's launch dialog says Start does (`StartEffects`, kept beside
// Start) and the longer explanation under Command details (`StartDetails`):
// for one-shot work, the session summary, whether it publishes an assignment,
// whether its result waits for review or lands, and where it runs; otherwise
// where the workflow's own start runs and what it publishes. A kept start
// (`resumes`) runs in its own workspace with its own policy.

import { hostName } from "./sessionCapabilities.ts";
import { launchModelName } from "./hostDescription.ts";
import {
  launchWorkflows,
  type KeptStart,
  type LaunchWorkflow,
  type SessionPolicy,
} from "./agentLaunch.ts";
import {
  oneShotEffect,
  oneShotWhere,
  sessionSummary,
} from "./sessionPolicyWords.ts";

type StartWords = {
  readonly workflow: LaunchWorkflow;
  readonly policy: SessionPolicy;
  // Whether the installed skill establishes the workflow's start.
  readonly establishesStart: boolean;
  readonly resumes: KeptStart | undefined;
};

export function StartEffects({
  workflow,
  policy,
  establishesStart,
  resumes,
}: StartWords) {
  const { establishes } = launchWorkflows[workflow];
  if (policy.tracking === "one-shot") {
    return (
      <>
        <strong className="launch-dialog-summary">
          {sessionSummary(policy)}
        </strong>{" "}
        {oneShotEffect(workflow, policy)}
      </>
    );
  }
  return (
    <>
      The session runs{" "}
      {resumes !== undefined
        ? `in workspace ${resumes.workspace}`
        : establishesStart
          ? "in a new workspace under .worktrees/"
          : "in this project's folder"}
      .
      {resumes !== undefined
        ? ` ${establishes.published}`
        : establishesStart && ` ${establishes.effect}`}
    </>
  );
}

export function StartDetails({
  workflow,
  policy,
  establishesStart,
  resumes,
}: StartWords) {
  return (
    <>
      {policy.tracking === "one-shot" ? (
        <p>{oneShotWhere(policy, resumes?.workspace)}</p>
      ) : (
        resumes === undefined &&
        establishesStart && (
          <p>{launchWorkflows[workflow].establishes.sentence}</p>
        )
      )}
      {resumes !== undefined && (
        <p>
          This start requested {hostName(resumes.host)} with{" "}
          {resumes.model === undefined
            ? "Default"
            : launchModelName(resumes.host, resumes.model)}{" "}
          model.
        </p>
      )}
    </>
  );
}
