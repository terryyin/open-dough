// How a start's session policy shapes either workflow's start command and a
// kept start's continuation. The flags are the shared definition's
// (`session-policy.mjs`), rendered here where the command is written.

import {
  needsPublicationAuthority,
  sessionPolicyFlags,
} from "../../src/skills/dough-execute-plan/scripts/session-policy.mjs";
import type { SessionPolicy } from "../src/agentLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { Established, PlannedStart } from "./startLaunch.ts";

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
