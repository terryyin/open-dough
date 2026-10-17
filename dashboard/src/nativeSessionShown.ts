// The native session reading, before the page applies completion reports.
import type { LaunchWithState } from "./agentLaunch.ts";
import type { SessionShown, SessionTone } from "./sessionShown.ts";
import { hostDescription } from "./hostDescription.ts";

type NativeSession = Pick<LaunchWithState, "sessionState" | "doneAt"> &
  Partial<Pick<LaunchWithState, "session">>;

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

// The session's own reading, as it is without any report.
export function nativeSessionShown({
  sessionState,
  doneAt,
  session,
}: NativeSession): SessionShown {
  const markedDone = doneAt !== undefined;
  switch (sessionState.kind) {
    case "unknown": {
      if (sessionState.label !== undefined) {
        return {
          label: sessionState.label,
          needsAttention: false,
          tone: "unsettled",
        };
      }
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
