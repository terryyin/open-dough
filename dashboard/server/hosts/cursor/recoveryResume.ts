// Shared resume-from-launch-record keep construction for developer Recover
// and post-settle last-held revival. Both paths race keep against the same
// launch wait and type a continuation only when first input is confirmed;
// callers choose ensure-port keep versus accepting-port keep.
import type { LaunchRecord } from "../../../src/agentLaunch.ts";
import { launchTimeoutMs } from "../../launchRun.ts";
import { cursorAgent } from "./exec.ts";
import { cursorRecoveryContinuation } from "./recoveryContinuation.ts";
import type { CursorKeepRequest } from "./runnerWire.ts";
import { cursorTerminalSize } from "./terminal.ts";

export function untilLaunchWait(): Promise<"timed-out"> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("timed-out");
    }, launchTimeoutMs());
  });
}

function resumeCursorArgs(record: LaunchRecord): {
  readonly command: string;
  readonly args: readonly string[];
  readonly cwd: string;
} {
  if (record.session.host !== "cursor") {
    throw new Error("Only a Cursor session can be resumed.");
  }
  const { continuation } = record.session;
  const [command, ...args] = continuation.args;
  return {
    command: command ?? cursorAgent,
    args,
    cwd: continuation.workspace,
  };
}

// The keep body Recover and auto-revive post for one unfinished Cursor record.
export function cursorResumeKeepRequest(
  record: LaunchRecord,
  sourceId: string,
  options: { readonly configScope?: string } = {},
): CursorKeepRequest {
  if (record.session.host !== "cursor") {
    throw new Error("Only a Cursor session can be resumed.");
  }
  const { command, args, cwd } = resumeCursorArgs(record);
  const confirmed = record.firstInput?.state === "confirmed";
  const instruction = confirmed
    ? cursorRecoveryContinuation(record)
    : undefined;
  return {
    command,
    args: [...args],
    cwd,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId,
    session: record.session,
    ...(options.configScope === undefined
      ? {}
      : { configScope: options.configScope }),
    ...(instruction === undefined ? {} : { instruction, idleComposer: true }),
  };
}
