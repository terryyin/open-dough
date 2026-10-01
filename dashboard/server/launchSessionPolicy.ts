// A launch's session policy at the local launch boundary: whether the
// selected host's installed skills take the shared policy at the workflow's
// start (`sessionPolicyCapable`), and the request admitted with it
// (`withSessionPolicy`). The policy's meaning and flags are the shared
// definition's (`session-policy.mjs`); the installed start owns what it does.
// A policy that cannot be honored is refused before anything starts, so no
// session silently runs with another location or landing.

import { sessionPolicyFlags } from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import {
  launchKindName,
  type AgentLaunchRequest,
  type LaunchWorkflow,
  type SessionPolicy,
} from "../src/agentLaunch.ts";
import { sessionSummary } from "../src/sessionPolicyWords.ts";
import { installedSkillPath } from "./launchHosts.ts";
import { RefusedRequest } from "./localOrigin.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { isFile } from "./startLaunch.ts";
import { startOf } from "./startWorkflows.ts";

// The installed skill that ships the shared policy every workflow's start
// reads.
const policySkill = "dough-execute-plan";
const policyScript = "session-policy.mjs";

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
    (await isFile(
      installedSkillPath(host, project, policySkill, "scripts", policyScript),
    ))
  );
}

// The default policy is the one no flag selects.
const isDefault = (policy: SessionPolicy) =>
  sessionPolicyFlags(policy).length === 0;

// The request with its policy as the boundary keeps it (none for the default
// policy), or the refusal: a request without a story, a default main or
// automatic landing without one-shot tracking, or an installation that does
// not take the policy at its start.
export async function withSessionPolicy(
  request: AgentLaunchRequest,
  project: ProjectFolder,
): Promise<AgentLaunchRequest> {
  if (request.workflow === "ad-hoc") return request;
  const { policy, ...rest } = request;
  if (policy === undefined || isDefault(policy)) return rest;
  if (policy.tracking !== "one-shot") {
    throw new RefusedRequest(
      400,
      "Default main and Automatically land apply to one-shot sessions; standard tracking publishes through its workflow.",
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
