// What a launch answers (`./agentLaunch.ts`): its result once it settles, its
// acceptance by the local service, and the attempt that service keeps
// (`../server/agentLaunches.ts`). Why nothing (or maybe nothing) was launched
// is spelled once here for all three. No Node import, so the browser and the
// server read the same shapes.

import { z } from "zod";
import {
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  existingChangesSchema,
} from "./launchRequest.ts";
import { launchWithStateSchema } from "./launchRecord.ts";
import { sessionHostSchema } from "./sessionReference.ts";

// Why nothing was launched.
export const launchFailureReasons = [
  "folder-not-found",
  "not-installed",
  "folder-not-trusted",
  "refused",
  "unavailable",
  "start-refused",
  "already-starting",
  "unrecorded",
] as const;

// Why a launch may or may not have started a session: the launch wait
// expired, or the host exited without a session this boundary could confirm.
export const launchUncertaintyReasons = ["timed-out", "unconfirmed"] as const;

// The uncommitted changes the default checkout holds, observed before a
// launch selecting it starts anything: the changed paths (at most
// `existingChangesShown`, never their content), how many there are, and the
// fingerprint a confirmation names (`existingChangesSchema`).
export const existingChangesShown = 50;

export const existingChangesFoundSchema = z.object({
  kind: z.literal("existing-changes"),
  paths: z.array(z.string().min(1)).max(existingChangesShown),
  count: z.number().int().positive(),
  fingerprint: existingChangesSchema,
});

export type ExistingChangesFound = z.infer<typeof existingChangesFoundSchema>;

// Every answer but a launched session: nothing was started because the
// default checkout holds changes the request did not confirm, or that changed
// since it was confirmed; nothing was launched; or a session may or may not
// have started.
const unlaunchedSchemas = [
  existingChangesFoundSchema,
  z.object({
    kind: z.literal("failed"),
    reason: z.enum(launchFailureReasons),
    explanation: z.string().min(1),
  }),
  z.object({
    kind: z.literal("uncertain"),
    reason: z.enum(launchUncertaintyReasons),
    explanation: z.string().min(1),
  }),
] as const;

export const launchResultSchema = z.discriminatedUnion("kind", [
  // The record kept, with its session as the host listed it when confirming
  // the launch.
  z.object({ kind: z.literal("launched"), record: launchWithStateSchema }),
  ...unlaunchedSchemas,
]);

export type LaunchResult = z.infer<typeof launchResultSchema>;

// A launch the local service accepted: its exact request, kept on this
// machine before any side effect, under an identity independent of the
// caller that asked for it. Its publication receipt tells absent publication
// (`none`: no assignment is published by this launch) from one not yet known
// (`unknown`) and an accepted one (`published`, with the revision when the
// start reported it). Its outcome names the launched session by reference,
// or why nothing (or maybe nothing) was launched. `owned` says the answering
// server is running it now; an unsettled attempt nobody owns needs
// reconciliation, never a fresh start.
export const agentAcceptEndpoint = `${agentLaunchEndpoint}/accept`;

// A page following an accepted attempt asks here, naming it as `attempt`:
// the answer comes once the attempt this server runs changes (its
// publication receipt is noted or it settles), at once when the server runs
// no such unsettled attempt, or after a bounded wait, and says whether it
// changed, with the attempt as the server running it knows it (none when no
// server runs it). The machine's sessions tell the rest, such as a launched
// session's record.
export const agentChangedEndpoint = `${agentLaunchEndpoint}/changed`;

// A page asks here to continue one accepted attempt that needs
// reconciliation (`needsReconciliation`), naming its project and attempt:
// its exact kept request runs again under the same attempt identity and the
// existing recovery rules, or the answer says why it does not, the attempt
// kept as it was.
export const agentContinueEndpoint = `${agentLaunchEndpoint}/continue`;

export const continueRequestSchema = z.object({
  source: z.string().min(1),
  attempt: z.uuid(),
});

export type ContinueRequest = z.infer<typeof continueRequestSchema>;

export const publicationReceiptSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("unknown") }),
  z.object({
    kind: z.literal("published"),
    revision: z.string().min(1).optional(),
  }),
]);

export type PublicationReceipt = z.infer<typeof publicationReceiptSchema>;

export const attemptOutcomeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("launched"),
    session: z.object({
      host: sessionHostSchema,
      sessionId: z.string().min(1),
    }),
  }),
  ...unlaunchedSchemas,
]);

export type AttemptOutcome = z.infer<typeof attemptOutcomeSchema>;

export const launchAttemptSchema = z.object({
  id: z.uuid(),
  request: agentLaunchRequestSchema,
  acceptedAt: z.iso.datetime(),
  publication: publicationReceiptSchema,
  outcome: attemptOutcomeSchema.optional(),
  settledAt: z.iso.datetime().optional(),
});

export type LaunchAttemptRecord = z.infer<typeof launchAttemptSchema>;

export const attemptObservationSchema = launchAttemptSchema.extend({
  owned: z.boolean(),
});

export type AttemptObservation = z.infer<typeof attemptObservationSchema>;

// Whether an accepted attempt needs reconciliation before its story's
// startup is known: unsettled while no server runs it, or settled while its
// session or its publication may or may not exist. Elapsed time never
// settles it; recheck or continuation does.
export function needsReconciliation(attempt: AttemptObservation): boolean {
  return attempt.outcome === undefined
    ? !attempt.owned
    : attempt.outcome.kind === "uncertain" ||
        attempt.publication.kind === "unknown";
}

export const changedAnswerSchema = z.object({
  changed: z.boolean(),
  attempt: attemptObservationSchema.optional(),
});

export type ChangedAnswer = z.infer<typeof changedAnswerSchema>;

// What asking for acceptance answers: the accepted attempt, or what was
// answered before anything was accepted or started.
export const acceptanceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("accepted"), attempt: attemptObservationSchema }),
  ...unlaunchedSchemas,
]);

export type Acceptance = z.infer<typeof acceptanceSchema>;
