// Dashboard calls into the Cursor runner: exec, keep, hangup, handoff
// release, and a sessions read that starts nothing (see runnerProcess.ts).
// Bridging a terminal to a held client lives in `./terminalBridge.ts`.
// Accepting-port keep/hangup/sessions live in ./runnerWire.ts so revival
// can reuse them without the current-runner ensure path.
import { homedir } from "node:os";
import {
  cursorRunnerExecResult,
  type CursorRunnerExec,
} from "./runnerProtocol.ts";
import { currentCursorRunnerPort } from "./runnerCurrent.ts";
import {
  acceptingCursorRunnerPort,
  ensureCursorRunner,
  stopCursorRunner,
} from "./runnerProcess.ts";
import {
  hangupCursorClient,
  keepCursorClientAtPort,
  postJson,
  readCursorRunnerSessions,
  type CursorKeepRequest,
  type CursorKeepResult,
  type CursorRunnerSessionsRead,
} from "./runnerWire.ts";
export type { CursorRunnerExec };
export type { CursorKeepRequest, CursorKeepResult, CursorRunnerSessionsRead };
export {
  ensureCursorRunner,
  hangupCursorClient,
  keepCursorClientAtPort,
  readCursorRunnerSessions,
  stopCursorRunner,
};

// Drops launch handoffs on this server's way out without starting a runner.
export async function releaseCursorHandoffs(home = homedir()): Promise<void> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return;
  try {
    await postJson(port, "/release-handoffs", {});
  } catch {
    // The runner is already gone.
  }
}

// One finished `cursor-agent` run inside the runner. This is new work, so
// it runs only on a current runner: a stale-but-answering runner is
// replaced first. Undefined when the runner cannot be reached, so the
// caller starts no local agent.
export async function execOnRunner(
  args: readonly string[],
  cwd: string | undefined,
  signal: AbortSignal,
  home = homedir(),
): Promise<CursorRunnerExec | undefined> {
  const port = await currentCursorRunnerPort(home);
  if (port === undefined) return undefined;
  try {
    const parsed = cursorRunnerExecResult.safeParse(
      await postJson(port, "/exec", { args, cwd }, signal),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

// Keeping a client is new work, so it too runs only on a current runner:
// a stale-but-answering runner is replaced first.
export async function keepCursorClient(
  request: CursorKeepRequest,
  home = homedir(),
): Promise<CursorKeepResult> {
  const port = await currentCursorRunnerPort(home);
  if (port === undefined) return { kind: "unreachable" };
  return keepCursorClientAtPort(port, request);
}
