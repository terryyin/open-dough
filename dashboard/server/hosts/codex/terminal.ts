// Ordinary native resume, using only the persisted conversation identity/context.
import { spawn as spawnPty } from "@lydell/node-pty";
import type { LaunchHost } from "../../launchHosts.ts";

export const attachCodex: NonNullable<LaunchHost["attach"]> = (
  ...[session, , size]
) => {
  if (session.host !== "codex" || session.continuation === undefined)
    throw new Error("This Codex conversation has no saved endpoint.");
  const continuation = session.continuation;
  const pty = spawnPty(
    "codex",
    [
      "resume",
      "--remote",
      continuation.endpoint,
      "--cd",
      continuation.workspace,
      "--no-alt-screen",
      session.sessionId,
    ],
    {
      name: "xterm-256color",
      cwd: continuation.workspace,
      cols: size.cols,
      rows: size.rows,
    },
  );
  return {
    pty,
    ready(screen, cursorVisible) {
      // Completed resume frames remove the provisional startup message and
      // expose the configured composer cursor. Modal/disabled views hide it.
      return (
        cursorVisible &&
        /^\s*›/m.test(screen) &&
        !/^\s*(?:Resuming session(?:…|\.\.\.)|Input disabled\.)\s*$/m.test(
          screen,
        )
      );
    },
  };
};
