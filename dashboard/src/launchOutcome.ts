// Launch results, acceptance and retained attempts share these shapes across
// browser and server, including why no session (or maybe one) was launched.

import { z } from "zod";
import {
  reportingContextSchema,
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  type StoryLaunchRequest,
} from "./launchRequest.ts";
import {
  landingRepositorySchema,
  launchLandingSchema,
} from "./launchLanding.ts";
import { completionReceiptSchema } from "./completionReport.ts";
import { completionSchema, launchWithStateSchema } from "./launchRecord.ts";
import type { HostOperations } from "./sessionCapabilities.ts";
import { sessionHostSchema } from "./sessionReference.ts";
import { existingChangesFoundSchema } from "./existingLaunchChanges.ts";
import { stopUnconfirmedFoundSchema } from "./sessionStop.ts";
export {
  existingChangesFoundSchema,
  existingChangesShown,
  type ExistingChangesFound,
} from "./existingLaunchChanges.ts";

// Why nothing was launched; `not-listed`: host listing names no launched
// session; `session-open`: an open launch record of the story remains.
export const launchFailureReasons = [
  "folder-not-found",
  "not-installed",
  "folder-not-trusted",
  "refused",
  "unavailable",
  "start-refused",
  "already-starting",
  "session-open",
  "unrecorded",
  "not-listed",
] as const;

export const sessionOpenExplanation =
  "This story already has an open session on this machine that must be marked done or have its record deleted first. Nothing was started or launched.";
export const unreadableLaunchRecordsExplanation =
  "This machine's launch records (~/.open-dough/dashboard/agent-launches.json) could not be read, so an earlier session may still be open. Repair or move that file aside before starting; nothing was started.";

// Why a launch may or may not have started a session: timed-out or unconfirmed.
export const launchUncertaintyReasons = ["timed-out", "unconfirmed"] as const;

// Every answer but a launched session: nothing was started because the
// default checkout holds changes the request did not confirm, or that changed
// since it was confirmed; nothing was launched; or a session may or may not
// have started.
const unlaunchedSchemas = [
  existingChangesFoundSchema,
  z.object({
    kind: z.literal("failed"),
    reason: z.enum(launchFailureReasons),
    // Unattached start kept for Continue or identical Start.
    sessionStartKept: z.literal(true).optional(),
    // Incomplete launch-workspace install: Update worktree and retry / Continue.
    worktreeUpdateNeeded: z.literal(true).optional(),
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

// Accepted launch: exact request kept before side effects. Publication is
// `none`, `unknown`, or `published`. `running`/`owned` observe this server.
export const agentAcceptEndpoint = `${agentLaunchEndpoint}/accept`;

// Wait until the named accepted attempt changes, or answer unchanged.
export const agentChangedEndpoint = `${agentLaunchEndpoint}/changed`;

// Continue one attempt that needs reconciliation under the same identity.
export const agentContinueEndpoint = `${agentLaunchEndpoint}/continue`;

// Apply the verified release updater to that attempt's worktree, then Continue.
export const agentUpdateWorktreeEndpoint = `${agentLaunchEndpoint}/update-worktree-and-retry`;

// A request about one kept attempt, naming its project and attempt: a
// continuation, a reconciliation note or a launch verification.
export const attemptRequestSchema = z.object({
  source: z.string().min(1),
  attempt: z.uuid(),
});

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
  reportingOrigin: z.url().optional(),
  reportingDeletedAt: z.iso.datetime().optional(),
  reportingDeletedSession: z
    .object({ host: sessionHostSchema, sessionId: z.string().min(1) })
    .optional(),
  reporting: reportingContextSchema.optional(),
  completion: completionSchema.optional(),
  landingRepository: landingRepositorySchema.optional(),
  landingPreparations: z.array(launchLandingSchema).optional(),
  landing: launchLandingSchema.optional(),
  completionReceipts: z.array(completionReceiptSchema).optional(),
  request: agentLaunchRequestSchema,
  acceptedAt: z.iso.datetime(),
  worker: z
    .object({
      pid: z.number().int().positive(),
      // The server keeps preparing and consumes the script result across handoff.
      serverPid: z.number().int().positive().optional(),
      step: z.enum(["start", "launch"]),
      notedAt: z.iso.datetime(),
    })
    .optional(),
  // When the start crossed its warning threshold while still running.
  slowSince: z.iso.datetime().optional(),
  publication: publicationReceiptSchema,
  outcome: attemptOutcomeSchema.optional(),
  settledAt: z.iso.datetime().optional(),
  // When a page found the settled attempt reconciled with published state
  // (`./startupReconciliation.ts`), so every page on this machine reads it so.
  reconciledAt: z.iso.datetime().optional(),
});

export type LaunchAttemptRecord = z.infer<typeof launchAttemptSchema>;

export const attemptObservationSchema = launchAttemptSchema.extend({
  owned: z.boolean(),
  running: z.boolean(),
  // For an attempt the answering server runs: how many changes of it that
  // server had told when it answered this, which a wait for its next change
  // names (`agentChangedEndpoint`).
  changes: z.number().int().nonnegative().optional(),
});

export type AttemptObservation = z.infer<typeof attemptObservationSchema>;

export {
  needsReconciliation,
  sessionStartRetained,
  worktreeUpdateNeeded,
  publicationRecordingStopped,
  laterAttempt,
  unresolvedAttempt,
} from "./launchAttemptSelection.ts";

// A page asks here to note that a settled attempt reconciled with the
// published state it shows, naming its project and attempt as a continuation
// does: the attempt keeps when (`reconciledAt`). An attempt this machine does
// not keep, or one that is unsettled or needs reconciliation, is refused,
// kept as it was; noting it again changes nothing.
export const agentReconciledEndpoint = `${agentLaunchEndpoint}/reconciled`;

// A page's Recheck asks here about a story attempt whose launch is uncertain
// after its start settled, naming its project and attempt as a continuation
// does: its host's own session listing is read once, and the attempt settles
// as launched with the one session it names unambiguously, or as not launched
// when the listing names none; otherwise it stays unresolved and the answer
// says why (`../server/launchVerification.ts`).
export const agentVerifyEndpoint = `${agentLaunchEndpoint}/verify`;

export type VerifiedAnswer =
  | { readonly kind: "settled"; readonly attempt: AttemptObservation }
  | { readonly kind: "unresolved"; readonly explanation: string };

export const verifiedAnswerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("settled"), attempt: attemptObservationSchema }),
  z.object({ kind: z.literal("unresolved"), explanation: z.string().min(1) }),
]);

// Whether Recheck asks the local service to verify the attempt's launch: a
// story attempt whose launch is uncertain while its publication is known, so
// its start settled and its session alone may or may not exist, and its
// host boundary offers a listing to verify it against.
export const launchVerifiable = (
  attempt: AttemptObservation,
  operations: HostOperations,
): attempt is AttemptObservation & { readonly request: StoryLaunchRequest } =>
  attempt.request.workflow !== "ad-hoc" &&
  !attempt.running &&
  attempt.outcome?.kind === "uncertain" &&
  attempt.publication.kind !== "unknown" &&
  operations[attempt.request.host]?.launchedSessions === true;

export type ReconciledAnswer =
  | { readonly kind: "reconciled"; readonly attempt: AttemptObservation }
  | { readonly kind: "refused"; readonly explanation: string };

export const changedAnswerSchema = z.object({
  changed: z.boolean(),
  attempt: attemptObservationSchema.optional(),
});

export type ChangedAnswer = z.infer<typeof changedAnswerSchema>;

// What asking for acceptance answers: the accepted attempt, or what was answered before anything was accepted or started.
export const acceptanceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("accepted"), attempt: attemptObservationSchema }),
  ...unlaunchedSchemas,
  stopUnconfirmedFoundSchema,
]);

export type Acceptance = z.infer<typeof acceptanceSchema>;
