// A launch's session policy at the local launch boundary: whether the
// selected host's installed skills take the shared policy at the workflow's
// start (`sessionPolicyCapable`), and the request admitted with it
// (`withSessionPolicy`). The policy's meaning and flags are the shared
// definition's (`session-policy.mjs`); the installed start owns what it does.
// A policy that cannot be honored is refused before anything starts, so no
// session silently runs with another location or landing. An unattached
// request carries its own two choices (`withUnattachedPolicy`).

import {
  oneShotOnlyChoices,
  sessionPolicyFlags,
} from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  establishesSession,
  isDefaultUnattachedPolicy,
  launchKindName,
  unattachedPolicyOf,
  type AgentLaunchRequest,
  type LaunchWorkflow,
  type SessionPolicy,
} from "../src/agentLaunch.ts";
import {
  sessionChoiceWords,
  sessionSummary,
  unattachedSummary,
} from "../src/sessionPolicyWords.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { shipsSessionPolicy } from "./startPolicy.ts";
import { startOf } from "./startWorkflows.ts";
import { establishesUnattached } from "./unattachedStart.ts";

// Whether the selected host's installation in the project starts the
// workflow itself and ships the shared policy that start reads.
export async function sessionPolicyCapable(
  project: ProjectFolder,
  workflow: LaunchWorkflow,
  host: AgentLaunchRequest["host"],
): Promise<boolean> {
  const start = startOf(workflow);
  return (
    start !== undefined &&
    (await start.establishes(project, host)) &&
    (await shipsSessionPolicy(project, host))
  );
}

// The default policy is the one no flag selects.
const isDefault = (policy: SessionPolicy) =>
  sessionPolicyFlags(policy).length === 0;

// An unattached request with its policy as the boundary keeps it (none for
// the default policy), or the refusal: a session to establish that the
// selected host's installation cannot.
async function withUnattachedPolicy(
  request: Extract<AgentLaunchRequest, { workflow: "ad-hoc" }>,
  project: ProjectFolder,
): Promise<AgentLaunchRequest> {
  const { policy: asked, ...rest } = request;
  const policy = unattachedPolicyOf({ policy: asked });
  if (
    establishesSession(request) &&
    !(await establishesUnattached(project, request.host))
  ) {
    throw new RefusedRequest(
      400,
      `${unattachedSummary(policy)} cannot be selected: the installed skills in ${project.shown} do not establish a session without a story.`,
    );
  }
  return isDefaultUnattachedPolicy(policy) ? rest : { ...rest, policy };
}

// The request with its policy as the boundary keeps it (none for the default
// policy), or the refusal: a default main or automatic landing without
// one-shot tracking, or an installation that does not take the policy at its
// start. An unattached request is admitted with its own policy.
export async function withSessionPolicy(
  request: AgentLaunchRequest,
  project: ProjectFolder,
): Promise<AgentLaunchRequest> {
  if (request.workflow === "ad-hoc")
    return withUnattachedPolicy(request, project);
  const { policy, ...rest } = request;
  if (policy === undefined || isDefault(policy)) return rest;
  const unsupported = oneShotOnlyChoices(policy);
  if (unsupported.length > 0) {
    throw new RefusedRequest(
      400,
      `${sessionChoiceWords.workspace.values["default-checkout"]} and ${sessionChoiceWords.landing.values["auto-land"]} apply to one-shot sessions; standard tracking publishes through its workflow.`,
    );
  }
  if (!(await sessionPolicyCapable(project, request.workflow, request.host))) {
    throw new RefusedRequest(
      400,
      `${sessionSummary(policy)} cannot be selected: the installed skills in ${project.shown} do not start ${launchKindName(request.workflow).toLowerCase()} with a session policy.`,
    );
  }
  return { ...rest, policy };
}
