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
};

const attentionWords: ReadonlyMap<string, string> = new Map([
  ["blocked", "Needs input"],
  ["done", "Ready for review"],
  ["failed", "Session failed"],
  ["stopped", "Session stopped"],
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
      };
    case "unlisted":
      return {
        label: markedDone ? "Done" : "Session unavailable",
        needsAttention: false,
      };
    case "listed": {
      const { state, waitingFor } = sessionState;
      if (state === "working") {
        return { label: "Working", needsAttention: false };
      }
      if (markedDone) {
        return { label: "Done", needsAttention: false };
      }
      const label = attentionWords.get(state);
      if (label === undefined) {
        return {
          label: "State not recognized",
          note: `Claude Code lists it as ${state}`,
          needsAttention: false,
        };
      }
      return {
        label,
        ...(state === "blocked" && waitingFor !== undefined
          ? { note: waitingFor }
          : {}),
        needsAttention: true,
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

// What a story's card says of its listed sessions: how many need attention,
// by the same reading each of their entries shows, or nothing when none do.
export function attentionSummary(
  sessions: readonly Pick<LaunchWithState, "sessionState" | "doneAt">[],
): string | undefined {
  const count = sessions.filter(
    (session) => sessionShown(session).needsAttention,
  ).length;
  if (count === 0) return undefined;
  return count === 1
    ? "1 session needs attention"
    : `${count} sessions need attention`;
}
