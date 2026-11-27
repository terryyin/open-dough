// Whether the dashboard starts the feedback maintenance cycle now: the due
// decision its server check (`../server/feedbackMaintenanceCheck.ts`) takes
// at each observation, and the reading of this machine's feedback-maintenance
// sessions it and the sessions answer take it from. It has no Node import, so
// both are unit-tested on their own.
//
// The authorization comes first and an open feedback-maintenance session
// second, because neither needs GitHub: only then is the published watch list
// read (`read`), and the decision is taken again with its review. A review
// that cannot be read, is absent or is invalid is not due. A due date is due
// once the local date reaches it, and is served by any launch on this
// machine that recorded it, open or ended however; a served date is never
// launched again. A due date more than `launchRetentionDays` old is never
// launched either: the attempt that would show it served may already have
// been dropped, so such a date stays due until the cycle publishes a later
// one or a developer runs it.
import type {
  AgentLaunchRequest,
  AttemptObservation,
  LaunchWithState,
  RecordedLaunchRequest,
} from "./agentLaunch.ts";
import type { FeedbackReview } from "./feedbackReview.ts";
import { feedbackMaintenanceInstruction } from "./feedbackMaintenanceSetting.ts";
import { launchRetentionDays } from "./launchRecord.ts";
import { sessionKey } from "./sessionReference.ts";

// How a feedback-maintenance session this machine keeps stands
// (`observedSessions`): starting while its worker lives or the answering
// server runs it, or open and not found unavailable (`running`), marked done
// (`done`), or ended otherwise: unavailable while open, its record deleted, no
// session launched, or its start interrupted with no process left running it
// (`ended`). Only a running session is open.
export type MaintenanceProgress = "running" | "done" | "ended";

// A feedback-maintenance session this machine keeps: the due date its
// automatic launch serves, none for one a developer started by hand, and how
// it stands.
export type MaintenanceSession = {
  readonly due?: string | undefined;
  readonly progress: MaintenanceProgress;
};

// One feedback-maintenance session this machine keeps, with when it was
// launched or accepted.
export type ObservedMaintenanceSession = MaintenanceSession & {
  readonly at: string;
};

// Whether a request is a feedback-maintenance session's, with the due date it
// serves: one the check started, which serves its due date, or one a
// developer started by hand with the same invocation, which serves none.
export function maintenanceDue(
  request: AgentLaunchRequest | RecordedLaunchRequest,
): { readonly due?: string } | undefined {
  if (request.workflow !== "ad-hoc") return undefined;
  if (request.maintenance !== undefined)
    return { due: request.maintenance.due };
  return request.instruction?.trim() ===
    feedbackMaintenanceInstruction(request.host)
    ? {}
    : undefined;
}

// The project's feedback-maintenance sessions, from records joined with their
// session's state and the attempts whose session has no record (still
// starting, deleted, or never launched). This is the one reading of whether
// such a session is running (starting, as `AttemptObservation.running`
// observes, or open and not found unavailable), done, or ended: the due check
// takes only a running one as open, and the machine's sessions answer says the
// same. An unsettled start no process runs any more ended: it serves its due
// date, and a later one is launched.
export function observedSessions(
  source: string,
  records: readonly LaunchWithState[],
  attempts: readonly AttemptObservation[],
): ObservedMaintenanceSession[] {
  const kept = records.filter((record) => record.request.source === source);
  const recorded = new Set(kept.map((record) => sessionKey(record.session)));
  return [
    ...kept.flatMap((record) => {
      const serving = maintenanceDue(record.request);
      if (serving === undefined) return [];
      return [
        {
          ...serving,
          at: record.launchedAt,
          progress:
            record.doneAt !== undefined
              ? ("done" as const)
              : record.sessionState.kind === "unavailable"
                ? ("ended" as const)
                : ("running" as const),
        },
      ];
    }),
    ...attempts.flatMap((attempt) => {
      const serving = maintenanceDue(attempt.request);
      const { outcome } = attempt;
      if (
        serving === undefined ||
        attempt.request.source !== source ||
        (outcome?.kind === "launched" &&
          recorded.has(sessionKey(outcome.session)))
      )
        return [];
      return [
        {
          ...serving,
          at: attempt.acceptedAt,
          progress:
            outcome === undefined && attempt.running
              ? ("running" as const)
              : ("ended" as const),
        },
      ];
    }),
  ];
}

export type DueInputs = {
  // Whether the standing authorization is on; a setting that cannot be read
  // authorizes nothing.
  readonly authorized: boolean;
  readonly sessions: readonly MaintenanceSession[];
  // The local date, as `YYYY-MM-DD`.
  readonly today: string;
  // What the published watch list says, `unread` when the read failed, and
  // undefined before it is read.
  readonly review?: FeedbackReview | { readonly kind: "unread" } | undefined;
};

// A reached due date is launched, or waits because it is served or stale.
export type DueDecision =
  | { readonly kind: "launch"; readonly due: string }
  | { readonly kind: "read" }
  | {
      readonly kind: "wait";
      readonly reason: "served" | "stale";
      readonly due: string;
    }
  | {
      readonly kind: "wait";
      readonly reason:
        "off" | "open" | "unread" | "absent" | "invalid" | "not-due";
    };

export function dueDecision({
  authorized,
  sessions,
  today,
  review,
}: DueInputs): DueDecision {
  if (!authorized) return { kind: "wait", reason: "off" };
  if (sessions.some((session) => session.progress === "running"))
    return { kind: "wait", reason: "open" };
  if (review === undefined) return { kind: "read" };
  if (review.kind !== "scheduled") return { kind: "wait", reason: review.kind };
  const due = review.reviewAfter;
  if (today < due) return { kind: "wait", reason: "not-due" };
  if (sessions.some((session) => session.due === due))
    return { kind: "wait", reason: "served", due };
  if (daysBetween(due, today) > launchRetentionDays)
    return { kind: "wait", reason: "stale", due };
  return { kind: "launch", due };
}

// Whole calendar days from one `YYYY-MM-DD` date to a later one.
function daysBetween(from: string, to: string): number {
  return (Date.parse(to) - Date.parse(from)) / 86_400_000;
}

// The local calendar date of `at`, as `YYYY-MM-DD`.
export function localDate(at: Date): string {
  return [at.getFullYear(), at.getMonth() + 1, at.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");
}
