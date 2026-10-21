// Whether the dashboard starts the feedback maintenance cycle now: the due
// decision its server check (`../server/feedbackMaintenanceCheck.ts`) takes
// at each observation. It has no Node import, so the decision is
// unit-tested on its own.
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
import type { FeedbackReview } from "./feedbackReview.ts";
import { launchRetentionDays } from "./launchRecord.ts";

// A feedback-maintenance session this machine keeps: the due date its
// automatic launch serves, none for one a developer started by hand, and
// whether it is still open (not marked done, or still starting).
export type MaintenanceSession = {
  readonly due?: string | undefined;
  readonly open: boolean;
};

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

export type DueDecision =
  | { readonly kind: "launch"; readonly due: string }
  | { readonly kind: "read" }
  | {
      readonly kind: "wait";
      readonly reason:
        | "off"
        | "open"
        | "unread"
        | "absent"
        | "invalid"
        | "not-due"
        | "served"
        | "stale";
    };

export function dueDecision({
  authorized,
  sessions,
  today,
  review,
}: DueInputs): DueDecision {
  if (!authorized) return { kind: "wait", reason: "off" };
  if (sessions.some((session) => session.open))
    return { kind: "wait", reason: "open" };
  if (review === undefined) return { kind: "read" };
  if (review.kind !== "scheduled") return { kind: "wait", reason: review.kind };
  const due = review.reviewAfter;
  if (today < due) return { kind: "wait", reason: "not-due" };
  if (sessions.some((session) => session.due === due))
    return { kind: "wait", reason: "served" };
  if (daysBetween(due, today) > launchRetentionDays)
    return { kind: "wait", reason: "stale" };
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
