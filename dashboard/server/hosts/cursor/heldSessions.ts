// Joins the sessions the Cursor runner holds with their launch records. The
// runner is not started. A runner that is not running, or cannot be reached,
// answers no sessions. The record stays the session identity.
import { homedir } from "node:os";
import type { RunningCursorSessions } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import { keptRecordsByProject } from "../../launchRecordStore.ts";
import { readCursorRunnerSessions } from "./runnerClient.ts";

export async function heldCursorSessions(
  home = homedir(),
): Promise<RunningCursorSessions> {
  const read = await readCursorRunnerSessions(home);
  if (read.kind !== "running") return { runner: read.kind, sessions: [] };
  const records = await keptRecordsByProject();
  const sessions: RunningCursorSessions["sessions"][number][] = [];
  for (const held of read.sessions) {
    const key = sessionKey(held.session);
    for (const kept of records.values()) {
      const record = kept.find((item) => sessionKey(item.session) === key);
      if (record !== undefined) {
        sessions.push({ record, label: held.label });
        break;
      }
    }
  }
  return { runner: "running", sessions };
}
