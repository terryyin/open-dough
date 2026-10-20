// The card's reading of recorded Cursor sessions. It reuses the runner read
// heldCursorSessionEvidence already performs. That read does not start the runner
// or an agent. A held client's screen is classified here, at the Cursor
// host boundary, into the shared normalized activities: a proved
// clarifying-question screen reads waiting, the follow-up prompt after a
// confirmed first instruction reads review, a working screen reads
// working, and a follow-up prompt before any confirmed instruction reads
// awaiting-instruction. A workspace-trust screen and any screen no rule
// proves keep the runner label as an unknown reading, which never alerts.
// When the runner is not running, or cannot be reached, every recorded
// Cursor session says so and shows no screen label. An unfinished session
// the runner does not hold says the agent is not running. A finished
// session the runner does not hold gets no observation, so the card keeps
// the host's unknown wording.
import type { LaunchRecord, SessionState } from "../../../src/agentLaunch.ts";
import { cursorHeldLabel } from "../../../src/cursorHeldLabel.ts";
import {
  agentNotRunningLabel,
  sessionUnfinished,
} from "../../../src/sessionRecovery.ts";
import { cursorRunnerSentence } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { SessionObservation } from "../../hostLaunch.ts";
import {
  heldCursorSessionEvidence,
  type HeldCursorSession,
} from "./heldSessions.ts";
import {
  cursorWaitingQuestion,
  showsCursorWaitingQuestion,
} from "./idleScreen.ts";

export async function observeCursorSessions(
  records: readonly LaunchRecord[],
): Promise<readonly SessionObservation[]> {
  const cursorRecords = records.filter(
    (record) => record.session.host === "cursor",
  );
  const held = await heldCursorSessionEvidence();
  if (held.runner !== "running") {
    const label = cursorRunnerSentence(held.runner);
    return cursorRecords.map((record) => labeledUnknown(record, label));
  }
  return cursorRecords.flatMap((record) => {
    const session = held.sessions.find(
      (item) => sessionKey(item.record.session) === sessionKey(record.session),
    );
    if (session !== undefined) return [observed(record, session)];
    if (!sessionUnfinished(record)) return [];
    return [labeledUnknown(record, agentNotRunningLabel)];
  });
}

function observed(
  record: LaunchRecord,
  held: HeldCursorSession,
): SessionObservation {
  // A trust screen labels as waiting for an answer, but it is not the
  // session asking the developer a question.
  if (held.workspaceTrust === true) return labeledUnknown(record, held.label);
  if (held.label === cursorHeldLabel.working) {
    return available(record, "working");
  }
  if (held.label === cursorHeldLabel.followUp) {
    return record.firstInput?.state === "confirmed"
      ? available(record, "review")
      : available(record, "awaiting-instruction");
  }
  const screen = held.screen;
  if (screen !== undefined && showsCursorWaitingQuestion(screen)) {
    return available(record, "waiting", cursorWaitingQuestion(screen));
  }
  return labeledUnknown(record, held.label);
}

function available(
  record: LaunchRecord,
  activity: Extract<SessionState, { kind: "available" }>["activity"],
  waitingFor?: string,
): SessionObservation {
  return {
    session: record.session,
    sessionState: {
      kind: "available",
      availability: "loaded",
      activity,
      ...(waitingFor === undefined ? {} : { waitingFor }),
    },
  };
}

// Words shown as written. They are not a shared activity, so the reading
// stays unknown and carries the words themselves.
function labeledUnknown(
  record: LaunchRecord,
  label: string,
): SessionObservation {
  return {
    session: record.session,
    sessionState: { kind: "unknown", label },
  };
}
