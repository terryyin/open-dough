import { completionLabel } from "./completionReport.ts";
// How a recorded launch's session reads on the page (`./agentLaunch.ts`):
// the one reading of normalized native activity, with any completion report
// not yet marked done apart from it, shared by every session entry
// (`./SessionEntry.tsx`) wherever it is listed, and by the card that says
// how many of its sessions need attention and hold unread reports
// (`./CardLaunches.tsx`).

import type { LaunchWithState } from "./agentLaunch.ts";
import { hostDescription } from "./hostDescription.ts";

// What a session entry says of its session, and whether the developer is
// needed there: the same semantic observation for every entry and card.
// Native waiting, review, failure and interruption need attention; working
// and awaiting a first instruction do not. A completion report not yet marked
// done is the unread report, its completion label: it leaves the native
// reading as it is without a report. A reported session marked done reads
// Done, with native Working as its note. Unreported Done retains native
// Working precedence. Availability and unknown observations never infer activity.
export type SessionShown = {
  readonly label: string;
  readonly note?: string;
  readonly needsAttention: boolean;
  readonly tone: SessionTone;
  readonly unreadReport?: string;
};

type ReadableSession = Pick<LaunchWithState, "sessionState" | "doneAt"> &
  Partial<Pick<LaunchWithState, "session" | "completion">>;

// Which of the reading's kinds a session is, for an entry that marks its
// kind apart from the others: needing input, ready for review, failed or
// stopped, working, done, or not settled (unknown, unavailable, or an activity this
// reading does not know).
export type SessionTone =
  "needs-input" | "ready" | "halted" | "working" | "done" | "unsettled";

// The readings that need the developer, by the host's state: the words and
// the kind each shows.
const attentionReadings: ReadonlyMap<
  string,
  { readonly label: string; readonly tone: SessionTone }
> = new Map([
  ["waiting", { label: "Needs input", tone: "needs-input" }],
  ["review", { label: "Ready for review", tone: "ready" }],
  ["failed", { label: "Session failed", tone: "halted" }],
  ["interrupted", { label: "Session stopped", tone: "halted" }],
]);

export function sessionShown(shown: ReadableSession): SessionShown {
  const { sessionState, doneAt, completion } = shown;
  if (completion === undefined) return nativeShown(shown);
  if (doneAt !== undefined) {
    return {
      label: "Done",
      needsAttention: false,
      tone: "done",
      ...(sessionState.kind === "available" &&
      sessionState.activity === "working"
        ? { note: "Native session is still working" }
        : {}),
    };
  }
  return { ...nativeShown(shown), unreadReport: completionLabel(completion) };
}

// The session's own reading, as it is without any report.
function nativeShown({
  sessionState,
  doneAt,
  session,
}: ReadableSession): SessionShown {
  const markedDone = doneAt !== undefined;
  switch (sessionState.kind) {
    case "unknown": {
      const wording =
        session === undefined
          ? undefined
          : hostDescription(session.host).unknownObservation;
      return {
        label: wording?.label ?? "State unknown",
        ...(wording === undefined ? {} : { note: wording.note }),
        needsAttention: false,
        tone: "unsettled",
      };
    }
    case "unavailable":
      return {
        label: markedDone ? "Done" : "Session unavailable",
        needsAttention: false,
        tone: markedDone ? "done" : "unsettled",
      };
    case "available": {
      const { activity, waitingFor, description } = sessionState;
      if (activity === "working") {
        return { label: "Working", needsAttention: false, tone: "working" };
      }
      if (markedDone) {
        return { label: "Done", needsAttention: false, tone: "done" };
      }
      if (activity === "awaiting-instruction") {
        return {
          label: "Awaiting first instruction",
          needsAttention: false,
          tone: "unsettled",
        };
      }
      const attention = attentionReadings.get(activity);
      if (attention === undefined) {
        return {
          label:
            description === undefined
              ? "State unknown"
              : "State not recognized",
          ...(description === undefined ? {} : { note: description }),
          needsAttention: false,
          tone: "unsettled",
        };
      }
      return {
        label: attention.label,
        ...(activity === "waiting" && waitingFor !== undefined
          ? { note: waitingFor }
          : {}),
        needsAttention: true,
        tone: attention.tone,
      };
    }
  }
}

// The words an unread report shows by, wherever it shows or alerts.
export function unreadReportWording(unreadReport: string): string {
  return `Unread report: ${unreadReport}`;
}

// The unread report that tells the developer when it arrives, in its own
// words, apart from the native reading: nothing once marked done.
export function alertUnreadReport(
  session: ReadableSession,
): string | undefined {
  const { unreadReport } = sessionShown(session);
  return unreadReport === undefined
    ? undefined
    : unreadReportWording(unreadReport);
}

// The native reading that tells the developer, when a session enters it,
// whatever its unread report: the label of every reading other than Working,
// for a session not marked done, else nothing. Unlike `needsAttention`, it
// includes an unavailable or explicitly unrecognized state, but not an
// incomplete activity read or an unknown observation: unreadable evidence says
// nothing about the session.
export function alertReading(session: ReadableSession): string | undefined {
  if (session.doneAt !== undefined) return undefined;
  if (session.sessionState.kind === "unknown") return undefined;
  const { label } = sessionShown(session);
  return session.sessionState.kind === "available" &&
    (session.sessionState.activity === "working" ||
      session.sessionState.activity === "awaiting-instruction" ||
      (session.sessionState.activity === "unknown" &&
        session.sessionState.unknownReason !== "unrecognized"))
    ? undefined
    : label;
}

// How many of the listed sessions need attention, by the same reading each
// of their entries shows.
export function attentionCount(sessions: readonly ReadableSession[]): number {
  return sessions.filter((session) => sessionShown(session).needsAttention)
    .length;
}

// What a story's card and the banner's Sessions badge say of listed sessions:
// how many need attention, or nothing when none do.
export function attentionSummary(
  sessions: readonly ReadableSession[],
): string | undefined {
  return countWords(
    attentionCount(sessions),
    "1 session needs attention",
    (count) => `${count} sessions need attention`,
  );
}

// What a story's card says of its listed sessions' unread reports, apart
// from how many need attention: how many hold one, or nothing when none do.
export function unreadReportSummary(
  sessions: readonly ReadableSession[],
): string | undefined {
  return countWords(
    sessions.filter(
      (session) => sessionShown(session).unreadReport !== undefined,
    ).length,
    "1 unread report",
    (count) => `${count} unread reports`,
  );
}

function countWords(
  count: number,
  one: string,
  many: (count: number) => string,
): string | undefined {
  if (count === 0) return undefined;
  return count === 1 ? one : many(count);
}
