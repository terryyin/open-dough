// An unattached session's establishment (`../server/unattachedStart.ts`): the
// one decision of whether a launch with no workflow establishes its session
// before the native session starts, and what that start established, kept
// with the launch record and handed to the session in its first input.

import { z } from "zod";
import {
  sameUnattachedPolicy,
  unattachedPolicyOf,
  unattachedSessionPolicySchema,
  type UnattachedSessionPolicy,
} from "./launchRequest.ts";

// What an unattached launch decides its establishment from.
type UnattachedChoices = {
  readonly policy?: UnattachedSessionPolicy | undefined;
  readonly instruction?: string | undefined;
  readonly attachments?: readonly string[] | undefined;
};

// Whether the policy is the one no selection makes: the default checkout,
// waiting for review.
export function isDefaultUnattachedPolicy(
  policy: UnattachedSessionPolicy,
): boolean {
  return sameUnattachedPolicy(policy, unattachedPolicyOf({}));
}

// Whether an unattached launch establishes its session: the shared start
// runs for its place and the session is handed the "Established session"
// block. A launch with the default choices establishes none and starts as an
// unattached session always did, whatever it is asked.
export function establishesSession(request: UnattachedChoices): boolean {
  return !isDefaultUnattachedPolicy(unattachedPolicyOf(request));
}

// Whether an unattached launch sends a first input: the developer's text, any
// attached images (their path list alone when text is blank), or the block of
// the session it establishes. One that sends none stays a blank native launch.
export function sendsFirstInput(request: UnattachedChoices): boolean {
  return (
    Boolean(request.instruction?.trim()) ||
    (request.attachments?.length ?? 0) > 0 ||
    establishesSession(request)
  );
}

// What an unattached session's start established, as the installed start
// reported it: where the session works (an isolated owned workspace or the
// default checkout taken as it is), its branch and trunk target, the landing
// the developer chose, the revision its results build on, and the fetched trunk.
// It names no tracking, identity, or agent: nothing was published or assigned.
export const establishedSessionSchema = z.object({
  workspace: z.string().min(1),
  role: unattachedSessionPolicySchema.shape.workspace,
  branch: z.string().min(1),
  remote: z.string().min(1),
  target: z.string().min(1),
  landing: unattachedSessionPolicySchema.shape.landing,
  startingRevision: z.string().min(1).optional(),
  fetched: z.string().min(1).optional(),
});

export type EstablishedSession = z.infer<typeof establishedSessionSchema>;
