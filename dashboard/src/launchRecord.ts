// Durable native launch evidence and current session observations.
import { z } from "zod";
import {
  launchLandingSchema,
  landingReportingSchema,
} from "./launchLanding.ts";
import { completionSchema } from "./completionReport.ts";
export { completionSchema, type CompletionReport } from "./completionReport.ts";
import {
  recordedLaunchRequestSchema,
  sessionPolicySchema,
} from "./launchRequest.ts";

import {
  establishedSessionSchema,
  type EstablishedSession,
} from "./unattachedSession.ts";
import { defaultLaunchStartSchema } from "./defaultLaunchStart.ts";
import { sessionCommitsSchema } from "./sessionCommits.ts";
import { sessionBranchEvidenceSchema } from "./sessionBranchResult.ts";
import { hostSessionSchema } from "./hostSession.ts";
export {
  hostSessionSchema,
  type ClaudeSession,
  type CodexSession,
  type CursorSession,
  type HostSession,
} from "./hostSession.ts";

export const firstInputSchema = z.object({
  // not-requested is intentional blank launch intent, never a retryable input.
  state: z.enum(["awaiting", "confirmed", "uncertain", "not-requested"]),
  // Awaiting blank materialization must never submit a saved empty turn.
  intent: z.literal("blank").optional(),
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
// execution checkout taken as it is), the selected landing, and, when the start
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
  changedSinceReview: z.boolean().optional(),
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
// its published assignment names, if any: a one-shot one, or none
// established, names none.
export type EstablishedContext = EstablishedStart | EstablishedPreparation;

export function assignedAgent(
  established: EstablishedContext | undefined,
): string | undefined {
  return established !== undefined && "agent" in established
    ? established.agent
    : undefined;
}

// Whether established facts name a one-shot context rather than an assignment.
// An established session has no tracking and is never one-shot.
export function isEstablishedOneShot(
  established: EstablishedContext | EstablishedSession,
): established is Extract<EstablishedContext, { tracking: "one-shot" }> {
  return "tracking" in established;
}

export const launchRecordSchema = z.object({
  request: recordedLaunchRequestSchema,
  session: hostSessionSchema,
  // What the launch's start established, for a workflow that has one.
  start: establishedStartSchema.optional(),
  // What a refinement launch's preparation established.
  preparation: establishedPreparationSchema.optional(),
  // What an unattached launch's start established (`./unattachedSession.ts`).
  establishedSession: establishedSessionSchema.optional(),
  // Where a default launch started (`./defaultLaunchStart.ts`).
  defaultStart: defaultLaunchStartSchema.optional(),
  launchedAt: z.iso.datetime(),
  firstInput: firstInputSchema.optional(),
  completion: completionSchema.optional(),
  // The receipt of the quiet report that found its story back in the queue.
  returnedToBacklog: z.uuid().optional(),
  landing: launchLandingSchema.optional(),
  landingReporting: landingReportingSchema.optional(),
  sessionCommits: sessionCommitsSchema.optional(),
  sessionCommitsFailedAt: z.iso.datetime().optional(),
  ...sessionBranchEvidenceSchema.shape,
  // The receipt of the report the developer marked read (`./readMark.ts`);
  // a report with any other receipt is unread while the session is not done.
  reportRead: z.uuid().optional(),
  doneAt: z.iso.datetime().optional(),
  dispositionChangedAt: z.iso.datetime().optional(),
  // Native operations may fail even though local done intent was retained.
  doneProblem: z.string().max(1_200).optional(),
  // A stop the host could not confirm, with the remaining state it named.
  // Retained until a later stop is confirmed; it blocks a replacement
  // writer in the same workspace unless explicitly overridden.
  stopUnconfirmed: z.string().max(1_200).optional(),
});

export type LaunchRecord = z.infer<typeof launchRecordSchema>;

export { establishedPlace, recordedWorkspace } from "./establishedPlace.ts";

// Native availability and activity, normalized by the host. Retained native
// conversations remain resumable. An unreadable or skipped observation
// confirms no absence. This state is never stored.
export const sessionStateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("available"),
    availability: z.enum(["loaded", "retained"]),
    activity: z.enum([
      "working",
      "waiting",
      "review",
      "failed",
      "interrupted",
      "awaiting-instruction",
      "unknown",
    ]),
    waitingFor: z.string().optional(),
    // Host-owned provenance when native activity cannot be recognized.
    description: z.string().optional(),
    // An explicit unfamiliar native answer versus an incomplete activity read.
    unknownReason: z.enum(["unrecognized", "incomplete"]).optional(),
  }),
  z.object({ kind: z.literal("unavailable") }),
  z.object({ kind: z.literal("not-observed") }),
  z.object({
    kind: z.literal("unknown"),
    // Words this observation shows as written. Absent uses the host's
    // unknown wording. These words are not a shared activity.
    label: z.string().min(1).optional(),
  }),
]);
export type SessionState = z.infer<typeof sessionStateSchema>;

// A session can offer Open terminal until the host confirms the conversation
// is unavailable. An unreadable or skipped observation leaves that check open.
export function attachOpens(sessionState: SessionState): boolean {
  return sessionState.kind !== "unavailable";
}

// Whether a recorded session's record may be deleted: while observation is
// unknown, or while the conversation is unavailable and it is not marked done
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
    (sessionState.kind === "unavailable" && doneAt === undefined)
  );
}

// A kept launch record joined with its session's state when it was answered;
// the state itself is never kept.
export const workspaceStateSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("available") }),
  z.object({ kind: z.literal("missing") }),
  z.object({ kind: z.literal("unknown") }),
]);
export type WorkspaceState = z.infer<typeof workspaceStateSchema>;

export const launchWithStateSchema = launchRecordSchema.extend({
  workspaceState: workspaceStateSchema.optional(),
  shownWorkspace: z.string().min(1).optional(),
  sessionState: sessionStateSchema,
  // A Done listing's reporting reference; the history keeps its handoff.
  reportingReference: z.uuid().optional(),
});

export type LaunchWithState = z.infer<typeof launchWithStateSchema>;
