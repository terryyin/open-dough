// How a start's session policy shapes either workflow's start command and a
// kept start's continuation, and whether an installation ships the shared
// definition its starts read. The flags are that definition's
// (`session-policy.mjs`), rendered here where the command is written.

import {
  needsPublicationAuthority,
  sessionPolicyFlags,
} from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import type { AgentLaunchRequest, SessionPolicy } from "../src/agentLaunch.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { isFile, type Established, type PlannedStart } from "./startLaunch.ts";

// The installed skill that ships the shared policy every start reads.
const policySkill = "dough-execute-plan";
const policyScript = "session-policy.mjs";

// Whether the selected host's installation in the project ships the shared
// policy its starts read.
export function shipsSessionPolicy(
  project: ProjectFolder,
  host: AgentLaunchRequest["host"],
): Promise<boolean> {
  return isFile(
    installedSkillPath(host, project, policySkill, "scripts", policyScript),
  );
}

// The arguments a policy adds to a start command: the integration checkout
// unless the default checkout is the workspace itself, publication authority
// only when the policy publishes, and the policy's own flags.
export function policyArguments(
  policy: SessionPolicy,
  project: ProjectFolder,
): string[] {
  return [
    ...(policy.workspace === "default-checkout"
      ? []
      : ["--integration", project.path]),
    ...(needsPublicationAuthority(policy) ? ["--push-authorized"] : []),
    ...sessionPolicyFlags(policy),
  ];
}

// A kept one-shot start that established its context goes on from it as it
// is, without rerunning its script: its workspace may already hold the
// result.
export function continuedStart(
  place: {
    readonly workspace: ProjectFolder;
    readonly branch: string;
    readonly policy: SessionPolicy;
  },
  established: Established,
): PlannedStart {
  return {
    kind: "running",
    ...place,
    attempt: Promise.resolve({ kind: "established", ...established }),
  };
}
