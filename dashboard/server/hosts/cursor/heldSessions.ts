// Joins the sessions the Cursor runner holds with their launch records. The
// runner is not started. A runner that is not running, or cannot be reached,
// answers no sessions. The record stays the session identity.
import { homedir } from "node:os";
import type { CursorHeldLabel } from "../../../src/cursorHeldLabel.ts";
import type { LaunchRecord } from "../../../src/launchRecord.ts";
import type { RunningCursorSessions } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import { keptRecordsByProject } from "../../launchRecordStore.ts";
import { readCursorRunnerSessions } from "./runnerClient.ts";

// One held client with the evidence session observation classifies: its
// screen label, whether that screen is the workspace-trust prompt, and, for
// a waiting-labeled screen only, the held screen text itself. The Running
// Cursor sessions list reads only record and label from this evidence.
export type HeldCursorSession = {
  readonly record: LaunchRecord;
  readonly label: CursorHeldLabel;
  readonly workspaceTrust?: boolean | undefined;
  readonly screen?: string | undefined;
};

export type HeldCursorSessions = {
  readonly runner: RunningCursorSessions["runner"];
  readonly sessions: readonly HeldCursorSession[];
};

export async function heldCursorSessionEvidence(
  home = homedir(),
): Promise<HeldCursorSessions> {
  const read = await readCursorRunnerSessions(home);
  if (read.kind !== "running") return { runner: read.kind, sessions: [] };
  const records = await keptRecordsByProject();
  const sessions: HeldCursorSession[] = [];
  for (const held of read.sessions) {
    const key = sessionKey(held.session);
    for (const kept of records.values()) {
      const record = kept.find((item) => sessionKey(item.session) === key);
      if (record !== undefined) {
        sessions.push({
          record,
          label: held.label,
          workspaceTrust: held.workspaceTrust,
          screen: held.screen,
        });
        break;
      }
    }
  }
  return { runner: "running", sessions };
}

// The Running Cursor sessions read: record and screen label only. Held
// screen text and trust evidence stay on this side of the boundary.
export async function heldCursorSessions(
  home = homedir(),
): Promise<RunningCursorSessions> {
  const held = await heldCursorSessionEvidence(home);
  return {
    runner: held.runner,
    sessions: held.sessions.map(({ record, label }) => ({ record, label })),
  };
}
