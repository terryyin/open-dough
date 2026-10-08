// Interactive resume of one stored Cursor session, run inside the Cursor
// runner rather than the dashboard server. The process is the continuation
// the launch recorded (`cursor-agent --workspace <path> --resume <uuid>`),
// not another host's attach command. After the conversation loads, the
// observed prompt is `→ Add a follow-up` or `→ Plan, search, build anything`.
// That text admits the terminal even when the cursor is hidden. The screen
// does not include the uuid. The result declares keep: closing the socket
// leaves this process running, including when the screen is the follow-up
// prompt, and a later terminal for the session joins it. A launch that
// already kept a client is joined instead of started again. Closing the
// dashboard does not hang this process up. It runs in the developer's shell
// environment (`../../developerShellEnvironment.ts`).
import { spawn as spawnPty, type IPty } from "@lydell/node-pty";
import type { LaunchHost } from "../../launchHosts.ts";
import { developerShellEnvironment } from "../../developerShellEnvironment.ts";
import { showsCursorComposer } from "./idleScreen.ts";

export const cursorTerminalSize = { cols: 80, rows: 24 } as const;

export function cursorReady(screen: string): boolean {
  return showsCursorComposer(screen);
}

// Attach and an instructed launch share this declaration. The empty composer
// text admits the terminal. A detached client stays, including on that prompt.
export const cursorKeptTerminal = {
  ready: cursorReady,
};

export function spawnCursorPty(
  command: string,
  args: readonly string[],
  cwd: string,
  size: { readonly cols: number; readonly rows: number },
): IPty {
  return spawnPty(command, [...args], {
    name: "xterm-256color",
    cwd,
    env: developerShellEnvironment(process.env),
    cols: size.cols,
    rows: size.rows,
  });
}

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
  return {
    pty: spawnCursorPty(command, args, continuation.workspace, size),
    keep: true,
    ...cursorKeptTerminal,
  };
};
