// Launch results, acceptance and retained attempts share these shapes across
// browser and server, including why no session (or maybe one) was launched.

import { z } from "zod";
import {
  reportingContextSchema,
  agentLaunchEndpoint,
  agentLaunchRequestSchema,
  type StoryLaunchRequest,
} from "./launchRequest.ts";
import { completionReceiptSchema } from "./completionReport.ts";
import { completionSchema, launchWithStateSchema } from "./launchRecord.ts";
import type { HostOperations } from "./sessionCapabilities.ts";
import { sessionHostSchema } from "./sessionReference.ts";
import { existingChangesFoundSchema } from "./existingLaunchChanges.ts";
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
  reporting: reportingContextSchema.optional(),
  completion: completionSchema.optional(),
  completionReceipts: z.array(completionReceiptSchema).optional(),
  request: agentLaunchRequestSchema,
  acceptedAt: z.iso.datetime(),
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

export const laterAttempt = (
  one: AttemptObservation | undefined,
  other: AttemptObservation,
): AttemptObservation =>
  one === undefined || one.acceptedAt < other.acceptedAt ? other : one;

// A story's unresolved attempt among its attempts on this machine (`ofStory`),
// which no fresh start of that story may duplicate and only its own
// continuation resumes: one a server runs now, else one that never settled
// and no server runs, else its latest attempt when that needs reconciliation.
export function unresolvedAttempt(
  ofStory: readonly AttemptObservation[],
): AttemptObservation | undefined {
  const unsettled = ofStory.filter((attempt) => attempt.outcome === undefined);
  const latest = ofStory.reduce<AttemptObservation | undefined>(
    laterAttempt,
    undefined,
  );
  return (
    unsettled.find((attempt) => attempt.owned) ??
    unsettled[0] ??
    (latest !== undefined && needsReconciliation(latest) ? latest : undefined)
  );
}

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
  !attempt.owned &&
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

// What asking for acceptance answers: the accepted attempt, or what was
// answered before anything was accepted or started.
export const acceptanceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("accepted"), attempt: attemptObservationSchema }),
  ...unlaunchedSchemas,
]);

export type Acceptance = z.infer<typeof acceptanceSchema>;
