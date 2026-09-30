// How a recorded launch's session reads on the page (`./agentLaunch.ts`):
// the one reading of Claude Code's listed state, shared by every session
// entry (`./SessionEntry.tsx`) wherever it is listed, and by the card that
// says how many of its sessions need attention (`./CardLaunches.tsx`).

import type { LaunchWithState } from "./agentLaunch.ts";

// What a session entry says of its session, and whether the developer is
// needed there: the one reading of the host's state, for every entry and for
// its story's card. Only the host's `state` decides; whether its process
// runs, or is idle, does not. A session not marked done needs attention while
// Claude Code lists it blocked (Needs input, with what it waits for when it
// says), done (Ready for review), failed, or stopped, and not while it is
// working. One marked done never does: it is Working while the host says so,
// and Done otherwise. An unlisted or unknown session, or a state this reading
// does not know, never needs attention.
export type SessionShown = {
  readonly label: string;
  readonly note?: string;
  readonly needsAttention: boolean;
  readonly tone: SessionTone;
};

// Which of the reading's kinds a session is, for an entry that marks its
// kind apart from the others: needing input, ready for review, failed or
// stopped, working, done, or not settled (unknown, unlisted, or a state this
// reading does not know).
export type SessionTone =
  "needs-input" | "ready" | "halted" | "working" | "done" | "unsettled";

// The readings that need the developer, by the host's state: the words and
// the kind each shows.
const attentionReadings: ReadonlyMap<
  string,
  { readonly label: string; readonly tone: SessionTone }
> = new Map([
  ["blocked", { label: "Needs input", tone: "needs-input" }],
  ["done", { label: "Ready for review", tone: "ready" }],
  ["failed", { label: "Session failed", tone: "halted" }],
  ["stopped", { label: "Session stopped", tone: "halted" }],
]);

export function sessionShown({
  sessionState,
  doneAt,
}: Pick<LaunchWithState, "sessionState" | "doneAt">): SessionShown {
  const markedDone = doneAt !== undefined;
  switch (sessionState.kind) {
    case "unknown":
      return {
        label: "State unknown",
        note: "Claude Code's session list could not be read",
        needsAttention: false,
        tone: "unsettled",
      };
    case "unlisted":
      return {
        label: markedDone ? "Done" : "Session unavailable",
        needsAttention: false,
        tone: markedDone ? "done" : "unsettled",
      };
    case "listed": {
      const { state, waitingFor } = sessionState;
      if (state === "working") {
        return { label: "Working", needsAttention: false, tone: "working" };
      }
      if (markedDone) {
        return { label: "Done", needsAttention: false, tone: "done" };
      }
      const attention = attentionReadings.get(state);
      if (attention === undefined) {
        return {
          label: "State not recognized",
          note: `Claude Code lists it as ${state}`,
          needsAttention: false,
          tone: "unsettled",
        };
      }
      return {
        label: attention.label,
        ...(state === "blocked" && waitingFor !== undefined
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
  session: Pick<LaunchWithState, "sessionState" | "doneAt">,
): string | undefined {
  if (session.doneAt !== undefined) return undefined;
  if (session.sessionState.kind === "unknown") return undefined;
  const { label } = sessionShown(session);
  return label === "Working" ? undefined : label;
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
