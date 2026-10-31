// Joins the sessions the Cursor runner holds with their launch records. The
// runner is not started. A runner that is not running, or cannot be reached,
// answers no sessions. The record stays the session identity. Every reader on
// this server (the Running Cursor sessions list, session admission, and Cursor
// session observation) joins the one read running for its home, so
// overlapping asks share one runner read; a settled read answers nobody later,
// so the next ask reads the runner again.
import { homedir } from "node:os";
import type { CursorHeldLabel } from "../../../src/cursorHeldLabel.ts";
import type { LaunchRecord } from "../../../src/launchRecord.ts";
import type { RunningCursorSessions } from "../../../src/cursorRunnerSessions.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import { readWaitLimitMs } from "../../../src/authenticatedReadRules.ts";
import { keptRecordsByProject } from "../../launchRecordStore.ts";
import { SharedObservation } from "../../sharedObservation.ts";
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

// The read now running answers whoever asks while it runs; none is reused.
// One not answered within the read wait says the runner cannot be reached,
// as a silent runner does; a failed one fails each reader it was answering.
const sharedRead = new SharedObservation(
  ([home]: readonly [string]) => readHeldCursorSessions(home),
  () => 0,
);
// Nobody abandons this read early: each reader waits for its answer.
const staying = new AbortController().signal;

export async function heldCursorSessionEvidence(
  home = homedir(),
): Promise<HeldCursorSessions> {
  const demanded = await sharedRead.demand([home], readWaitLimitMs, staying);
  return demanded.kind === "observed"
    ? demanded.value
    : { runner: "unreachable", sessions: [] };
}

async function readHeldCursorSessions(
  home: string,
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
