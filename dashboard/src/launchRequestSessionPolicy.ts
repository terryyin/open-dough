// Session policy on a launch request: the shared definition's choices
// (`session-policy.mjs`) as Zod schemas and defaults for story and unattached
// launches.
import { z } from "zod";
import {
  sessionPolicy,
  sessionPolicyChoices,
  unattachedSessionChoices,
  unattachedSessionPolicy,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/session-policy.mjs";

// A session's policy as the shared definition spells its three choices:
// tracking, workspace, and landing. A request or record without one has the
// default policy: standard tracking in an isolated workspace, published
// through the workflow's own lifecycle.
export const sessionPolicySchema = z.object({
  tracking: z.enum(sessionPolicyChoices.tracking.values),
  workspace: z.enum(sessionPolicyChoices.workspace.values),
  landing: z.enum(sessionPolicyChoices.landing.values),
});

export type SessionPolicy = z.infer<typeof sessionPolicySchema>;

export const defaultSessionPolicy: SessionPolicy = sessionPolicy({});

// A request's or record's policy, the default when it names none.
export function policyOf(request: {
  readonly policy?: SessionPolicy | undefined;
}): SessionPolicy {
  return request.policy ?? defaultSessionPolicy;
}

// An unattached session's policy, as the shared definition spells the two
// choices of a session with no workflow: workspace and landing, never
// tracking. A request or record without one has the default: the default
// checkout, waiting for review.
export const unattachedSessionPolicySchema = z.strictObject({
  workspace: z.enum(unattachedSessionChoices.workspace.values),
  landing: z.enum(unattachedSessionChoices.landing.values),
});

export type UnattachedSessionPolicy = z.infer<
  typeof unattachedSessionPolicySchema
>;

// An unattached request's or record's policy, the default when it names none.
export function unattachedPolicyOf(request: {
  readonly policy?: UnattachedSessionPolicy | undefined;
}): UnattachedSessionPolicy {
  return unattachedSessionPolicy(request.policy);
}

// Whether two unattached policies make the same choices.
export function sameUnattachedPolicy(
  a: UnattachedSessionPolicy,
  b: UnattachedSessionPolicy,
): boolean {
  return a.workspace === b.workspace && a.landing === b.landing;
}
