// How a recorded launch's session reads on the page (`./agentLaunch.ts`):
// the one reading of normalized native activity, shared by every session
// entry (`./SessionEntry.tsx`) wherever it is listed, and by the card that
// says how many of its sessions need attention (`./CardLaunches.tsx`).

import type { LaunchWithState } from "./agentLaunch.ts";

// What a session entry says of its session, and whether the developer is
// needed there: the same semantic observation for every entry and card.
// Native waiting, review, failure and interruption need attention; working
// and awaiting a first instruction do not. Availability does not infer activity. One marked done never does: it is Working while the host says so,
// and Done otherwise. An unavailable or unknown session, or a state this reading
// does not know, never needs attention.
export type SessionShown = {
  readonly label: string;
  readonly note?: string;
  readonly needsAttention: boolean;
  readonly tone: SessionTone;
};

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

export function sessionShown({
  sessionState,
  doneAt,
  session,
}: Pick<LaunchWithState, "sessionState" | "doneAt"> &
  Partial<Pick<LaunchWithState, "session">>): SessionShown {
  const markedDone = doneAt !== undefined;
  switch (sessionState.kind) {
    case "unknown":
      return {
        label:
          session?.host === "codex"
            ? "Live observation unavailable"
            : "State unknown",
        note:
          session?.host === "codex"
            ? "Continue this conversation in Codex"
            : "Claude Code's session list could not be read",
        needsAttention: false,
        tone: "unsettled",
      };
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

// The reading that tells the developer, when a session enters it: the label
// of every reading other than Working, for a session not marked done, else
// nothing. Unlike `needsAttention`, it includes an unavailable or
// unrecognized state, but not an unknown one: an unreadable listing says
// nothing about the session.
export function alertReading(
  session: Pick<LaunchWithState, "sessionState" | "doneAt"> &
    Partial<Pick<LaunchWithState, "session">>,
): string | undefined {
  if (session.doneAt !== undefined) return undefined;
  if (session.sessionState.kind === "unknown") return undefined;
  if (
    session.session?.host === "codex" &&
    session.sessionState.kind === "available" &&
    session.sessionState.activity === "unknown"
  )
    return undefined;
  const { label } = sessionShown(session);
  return session.sessionState.kind === "available" &&
    (session.sessionState.activity === "working" ||
      session.sessionState.activity === "awaiting-instruction" ||
      (session.sessionState.activity === "unknown" &&
        session.sessionState.description === undefined))
    ? undefined
    : label;
}

// How many of the listed sessions need attention, by the same reading each
// of their entries shows.
export function attentionCount(
  sessions: readonly Pick<LaunchWithState, "sessionState" | "doneAt">[],
): number {
  return sessions.filter((session) => sessionShown(session).needsAttention)
    .length;
}

// What a story's card and the banner's Sessions badge say of listed sessions:
// how many need attention, or nothing when none do.
export function attentionSummary(
  sessions: readonly Pick<LaunchWithState, "sessionState" | "doneAt">[],
): string | undefined {
  const count = attentionCount(sessions);
  if (count === 0) return undefined;
  return count === 1
    ? "1 session needs attention"
    : `${count} sessions need attention`;
}
