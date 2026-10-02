// Interactive resume of one stored Cursor session. The process is the
// continuation the launch recorded (`cursor-agent --workspace <path>
// --resume <uuid>`), not another host's attach command. After the
// conversation loads, the observed prompt is `→ Add a follow-up`. A visible
// cursor and that text admit the terminal. The screen does not include the
// uuid. The result declares keep: closing the socket leaves this process
// running, and a later terminal for the session joins it. It also declares
// the idle end rule: a detached client whose screen stays idle is hung up,
// and the next open starts a new client. While the launch prompt's process
// is still running, the result is a wait: no client starts until it exits.
import { spawn as spawnPty } from "@lydell/node-pty";
import type { LaunchHost } from "../../launchHosts.ts";
import { cursorDetachedIdle, cursorIdleSettleMs } from "./idleScreen.ts";
import { runningPromptExit } from "./runningPrompt.ts";

const launchWaitNotice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";

export const attachCursor: NonNullable<LaunchHost["attach"]> = (
  ...[session, , size]
) => {
  if (session.host !== "cursor") {
    throw new Error("This is not a Cursor session.");
  }
  const wait = runningPromptExit(session.sessionId);
  if (wait !== undefined) {
    return { wait, notice: launchWaitNotice };
  }
  const { continuation } = session;
  const [command, ...args] = continuation.args;
  if (command === undefined) {
    throw new Error("This Cursor conversation has no saved resume command.");
  }
  const pty = spawnPty(command, args, {
    name: "xterm-256color",
    cwd: continuation.workspace,
    cols: size.cols,
    rows: size.rows,
  });
  return {
    pty,
    keep: true,
    detachedIdle: {
      settleMs: cursorIdleSettleMs,
      matches: cursorDetachedIdle,
    },
    ready(screen, cursorVisible) {
      return cursorVisible && screen.includes("Add a follow-up");
    },
  };
};
