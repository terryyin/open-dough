// The card's reading of recorded Cursor sessions. It reuses the runner read
// heldCursorSessions already performs. That read does not start the runner
// or an agent. A held client is shown by its screen label. When the runner
// is not running, or cannot be reached, every recorded Cursor session says
// so and shows no screen label. A session the runner does not hold gets no
// observation, so the card keeps the host's unknown wording.
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import { cursorRunnerSentence } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { SessionObservation } from "../../hostLaunch.ts";
import { heldCursorSessions } from "./heldSessions.ts";

export async function observeCursorSessions(
  records: readonly LaunchRecord[],
): Promise<readonly SessionObservation[]> {
  const cursorRecords = records.filter(
    (record) => record.session.host === "cursor",
  );
  const held = await heldCursorSessions();
  if (held.runner !== "running") {
    const label = cursorRunnerSentence(held.runner);
    return cursorRecords.map((record) => labeledUnknown(record, label));
  }
  return cursorRecords.flatMap((record) => {
    const label = held.sessions.find(
      (item) => sessionKey(item.record.session) === sessionKey(record.session),
    )?.label;
    return label === undefined ? [] : [labeledUnknown(record, label)];
  });
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
