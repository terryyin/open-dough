// Interactive resume of one stored Cursor session. The process is the
// continuation the launch recorded (`cursor-agent --workspace <path>
// --resume <uuid>`), not another host's attach command. The real PTY ready
// frame is still unobserved; a visible cursor and the stored session id
// admit the fixture until that frame is recorded.
import { spawn as spawnPty } from "@lydell/node-pty";
import type { LaunchHost } from "../../launchHosts.ts";

export const attachCursor: NonNullable<LaunchHost["attach"]> = (
  ...[session, , size]
) => {
  if (session.host !== "cursor") {
    throw new Error("This is not a Cursor session.");
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
    ready(screen, cursorVisible) {
      return cursorVisible && screen.includes(session.sessionId);
    },
  };
};
