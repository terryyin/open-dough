// Durable native launch evidence and current session observations.
import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  recordedLaunchRequestSchema,
  sessionPolicySchema,
} from "./launchRequest.ts";

// The native identity and display name. Claude additionally needs the alias
// its attach/stop commands take; other hosts keep their actual conversation ID.
export const hostSessionSchema = z
  .object({
    host: z.enum(agentHosts),
    sessionId: z.string().min(1),
    shortId: z.string().min(1).optional(),
    name: z.string(),
    continuation: z
      .object({
        workspace: z.string().min(1),
        endpoint: z.string().min(1),
        args: z.array(z.string()),
        // Context for continuing a conversation after native observation ends.
        notice: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((session, context) => {
    if (session.host === "claude" && session.shortId === undefined) {
      context.addIssue({
        code: "custom",
        path: ["shortId"],
        message: "Claude session alias is missing.",
      });
    }
  });

export type HostSession = z.infer<typeof hostSessionSchema>;

export const firstInputSchema = z.object({
  state: z.enum(["awaiting", "confirmed", "uncertain"]),
  turnId: z.string().optional(),
  // Exact launch intent retained for native history reconciliation.
  instruction: z.string().optional(),
  explanation: z.string().optional(),
});
export type FirstInput = z.infer<typeof firstInputSchema>;

// How many days this machine keeps a launch's record after its session is
// marked done.
export const launchRetentionDays = 30;

// What a one-shot start of either workflow established: no assignment was
// published, so it names no publisher, published revision, or agent. It
// names the workspace's actual role (an isolated owned workspace or the
// default checkout taken as it is), the selected landing, and, when the start
// reported them, the revision the result builds on and the fetched trunk.
const oneShotContext = {
  tracking: z.literal("one-shot"),
  identity: z.string().min(1),
  workspace: z.string().min(1),
  role: sessionPolicySchema.shape.workspace,
  branch: z.string().min(1),
  remote: z.string().min(1),
  target: z.string().min(1),
  landing: sessionPolicySchema.shape.landing,
  startingRevision: z.string().min(1).optional(),
};

// The start a workflow established before its session
// (`../server/executionStart.ts`): the published claim and the workspace the
// session runs in, as the installed skill's start command reported them, kept
// with the launch record and handed to the session in its instruction. A
// one-shot start publishes no claim (`tracking: "one-shot"`); a record
// without `tracking` is a published claim's.
const claimedStartSchema = z.object({
  identity: z.string().min(1),
  publisherId: z.string().min(1),
  workspace: z.string().min(1),
  branch: z.string().min(1),
  mode: z.literal("story-branch"),
  remote: z.string().min(1),
  target: z.string().min(1),
  publishedSha: z.string().min(1),
  agent: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
  startingRevision: z.string().min(1).optional(),
  candidateSha: z.string().min(1).optional(),
});

export const establishedStartSchema = z.union([
  z.object({
    ...oneShotContext,
    mode: z.literal("story-branch"),
    fetched: z.string().min(1).optional(),
  }),
  claimedStartSchema,
]);

export type EstablishedStart = z.infer<typeof establishedStartSchema>;

// The preparation a refinement launch established before its session
// (`../server/preparationStart.ts`): the workspace the session runs in and the
// announcement published for it, kept with the launch record. It carries no
// publisher, mode, or plan; `publishedSha` is absent when the workspace
// already held the assignment. A one-shot preparation publishes no
// announcement (`tracking: "one-shot"`).
export const establishedPreparationSchema = z.union([
  z.object(oneShotContext),
  z.object({
    identity: z.string().min(1),
    workspace: z.string().min(1),
    branch: z.string().min(1),
    remote: z.string().min(1),
    target: z.string().min(1),
    publishedSha: z.string().min(1).optional(),
    agent: z.string().min(1).optional(),
  }),
]);

export type EstablishedPreparation = z.infer<
  typeof establishedPreparationSchema
>;

// The facts every established start or preparation shares, with the agent
// its published assignment names, if any: a one-shot one names none.
export type EstablishedContext = EstablishedStart | EstablishedPreparation;

export function assignedAgent(
  established: EstablishedContext,
): string | undefined {
  return "agent" in established ? established.agent : undefined;
}

// A native conversation with first-input evidence, kept until `launchRetentionDays` after
// the developer marked its session done (`./doneMark.ts`), if they ever do,
// with when they did: local evidence only, never a story fact.
export const launchRecordSchema = z.object({
  request: recordedLaunchRequestSchema,
  session: hostSessionSchema,
  // What the launch's start established, for a workflow that has one.
  start: establishedStartSchema.optional(),
  // What a refinement launch's preparation established.
  preparation: establishedPreparationSchema.optional(),
  launchedAt: z.iso.datetime(),
  firstInput: firstInputSchema.optional(),
  doneAt: z.iso.datetime().optional(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

// A recorded session as the host lists it at the moment of asking, never
// stored: `listed` with the host's `state`, only while its process runs its
// `status`, and, when the host reports one, what a blocked session is
// `waitingFor`; `unlisted` once the host no longer lists it; `unknown` when
// the host's listing could not be read.
export const sessionStateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("listed"),
    state: z.string(),
    status: z.string().optional(),
    waitingFor: z.string().optional(),
  }),
  z.object({ kind: z.literal("unlisted") }),
  z.object({ kind: z.literal("unknown") }),
]);

export type SessionState = z.infer<typeof sessionStateSchema>;

// Whether a session offers Open terminal: for every session the host still
// lists, and while its listing is unknown, since the session may still be
// there.
export function attachOpens(sessionState: SessionState): boolean {
  return sessionState.kind !== "unlisted";
}

// Whether a recorded session's record may be deleted: while its listing is
// unknown, or while the host no longer lists it and it is not marked done
// (Session unavailable). A session marked done reads Done, not unavailable.
export function recordDeletable({
  sessionState,
  doneAt,
}: {
  sessionState: SessionState;
  doneAt?: string | undefined;
}): boolean {
  return (
    sessionState.kind === "unknown" ||
    (sessionState.kind === "unlisted" && doneAt === undefined)
  );
}

// A kept launch record joined with its session's state when it was answered;
// the state itself is never kept.
export const launchWithStateSchema = launchRecordSchema.extend({
  sessionState: sessionStateSchema,
});

export type LaunchWithState = z.infer<typeof launchWithStateSchema>;
