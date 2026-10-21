// What this machine's feedback maintenance stands at, as the machine's
// sessions answer it (`./agentLaunch.ts`) and Open Dough's project row
// (`./ProjectActions.tsx`) and the System settings section
// (`./FeedbackMaintenanceSettings.tsx`) say it. The server's due check
// (`../server/feedbackMaintenanceCheck.ts`) keeps its last observation, the
// authorization, the watch list's review it last read and a launch its gates
// held, and composes it at each answer with this machine's
// feedback-maintenance sessions as they stand then, so no answer asks GitHub
// anything. It has no Node import, so it is unit-tested on its own.
//
// The row says the cycle is running while any feedback-maintenance session is
// (an automatic one, or a developer's with the cycle's invocation); otherwise,
// once the last read due date is reached, that it is due since then and either
// that its automatic session did not complete (a launch served the date and
// ended, was marked done, or was deleted without the date advancing) or why
// it was not started. Otherwise the row says nothing. The settings line names
// the next due date read and the last automatic launch's outcome.
import { z } from "zod";
import type { Acceptance } from "./launchOutcome.ts";
import type { FeedbackReview } from "./feedbackReview.ts";
import {
  dueDecision,
  type MaintenanceSession,
} from "./feedbackMaintenanceDue.ts";
import { launchRetentionDays } from "./launchRecord.ts";

// One feedback-maintenance session this machine keeps
// (`./feedbackMaintenanceDue.ts`), with when it was launched or accepted.
export type ObservedMaintenanceSession = MaintenanceSession & {
  readonly at: string;
};

// What the due check last observed: whether the standing authorization was
// on, the watch list's review it last read (kept while later checks do not
// read it), and the due date whose launch the launch gates held, with why.
export type MaintenanceObservation = {
  readonly authorized: boolean;
  readonly review?: FeedbackReview | { readonly kind: "unread" } | undefined;
  readonly held?: { readonly due: string; readonly reason: string } | undefined;
};

const date = z.iso.date();

export const maintenanceRowSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("running") }),
  z.object({ kind: z.literal("incomplete"), due: date }),
  z.object({
    kind: z.literal("not-started"),
    due: date,
    reason: z.string().min(1),
  }),
]);
export type MaintenanceRow = z.infer<typeof maintenanceRowSchema>;

export const lastMaintenanceLaunchSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("running"), due: date }),
  z.object({ kind: z.literal("done"), due: date }),
  z.object({ kind: z.literal("incomplete"), due: date }),
  z.object({ kind: z.literal("held"), due: date, reason: z.string().min(1) }),
]);
export type LastMaintenanceLaunch = z.infer<typeof lastMaintenanceLaunchSchema>;

// The project the cycle runs in, the next due date last read and whether the
// local date has reached it, what the project row says, if anything, and the
// last automatic launch.
export const feedbackMaintenanceStateSchema = z.object({
  source: z.string().min(1),
  nextDue: z.object({ date, reached: z.boolean() }).optional(),
  row: maintenanceRowSchema.optional(),
  lastLaunch: lastMaintenanceLaunchSchema,
});
export type FeedbackMaintenanceState = z.infer<
  typeof feedbackMaintenanceStateSchema
>;

export const maintenanceOffReason =
  "feedback maintenance is off in System settings";
export const staleDueReason = `the due date is more than ${launchRetentionDays} days old, so it does not start automatically`;
export const nextCheckReason = "it starts at the dashboard's next check";

export function feedbackMaintenanceState(
  source: string,
  { authorized, review, held }: MaintenanceObservation,
  sessions: readonly ObservedMaintenanceSession[],
  today: string,
): FeedbackMaintenanceState {
  const scheduled =
    review?.kind === "scheduled" ? review.reviewAfter : undefined;
  const reached = scheduled !== undefined && scheduled <= today;
  const automatic = sessions.filter(
    (session): session is ObservedMaintenanceSession & { due: string } =>
      session.due !== undefined,
  );
  return {
    source,
    ...(scheduled !== undefined && {
      nextDue: { date: scheduled, reached },
    }),
    ...rowOf(),
    lastLaunch: lastLaunchOf(),
  };

  // The due check's decision were it authorized names whether a session is
  // open and whether the date read is reached, served or too old; the
  // authorization and a held launch only say why a reached date did not start.
  function rowOf(): { row?: MaintenanceRow } {
    const decision = dueDecision({ authorized: true, sessions, today, review });
    if (decision.kind === "launch") return notStarted(decision.due, false);
    if (decision.kind === "read") return {};
    switch (decision.reason) {
      case "open":
        return { row: { kind: "running" } };
      case "served":
        return { row: { kind: "incomplete", due: decision.due } };
      case "stale":
        return notStarted(decision.due, true);
      default:
        return {};
    }
  }

  function notStarted(due: string, stale: boolean): { row: MaintenanceRow } {
    const reason =
      held?.due === due
        ? held.reason
        : !authorized
          ? maintenanceOffReason
          : stale
            ? staleDueReason
            : nextCheckReason;
    return { row: { kind: "not-started", due, reason } };
  }

  function lastLaunchOf(): LastMaintenanceLaunch {
    if (held !== undefined) return { kind: "held", ...held };
    const [last] = [...automatic].sort((a, b) => b.at.localeCompare(a.at));
    if (last === undefined) return { kind: "none" };
    const { due, progress } = last;
    if (progress === "running") return { kind: "running", due };
    // Done counts as done unless the date read since has not advanced.
    return progress === "done" && (scheduled === undefined || scheduled > due)
      ? { kind: "done", due }
      : { kind: "incomplete", due };
  }
}

// Why the launch gates held an automatic launch, in the row's words.
export function heldReason(
  refused: Exclude<Acceptance, { readonly kind: "accepted" }>,
): string {
  if (refused.kind !== "existing-changes") return refused.explanation;
  const paths =
    refused.count === 1 ? "1 changed path" : `${refused.count} changed paths`;
  return `default main has existing changes (${paths})`;
}

// What Open Dough's project row says beside Start session.
export function maintenanceRowText(row: MaintenanceRow): string {
  switch (row.kind) {
    case "running":
      return "Feedback maintenance is running";
    case "incomplete":
      return `Feedback maintenance due since ${row.due}; its automatic session did not complete`;
    case "not-started":
      return `Feedback maintenance due since ${row.due}; not started: ${row.reason}`;
  }
}

function lastLaunchText(last: LastMaintenanceLaunch): string {
  switch (last.kind) {
    case "none":
      return "none yet";
    case "running":
      return `running (due ${last.due})`;
    case "done":
      return `done (due ${last.due})`;
    case "incomplete":
      return `did not complete (due ${last.due})`;
    case "held":
      return `not started (due ${last.due}): ${last.reason}`;
  }
}

// The System settings section's status line: the next due date read and the
// last automatic launch's outcome.
export function maintenanceStatusText({
  nextDue,
  lastLaunch,
}: FeedbackMaintenanceState): string {
  const due =
    nextDue === undefined
      ? "Next due date not read yet"
      : nextDue.reached
        ? `Due since ${nextDue.date}`
        : `Next due ${nextDue.date}`;
  return `${due}. Last automatic launch: ${lastLaunchText(lastLaunch)}.`;
}
