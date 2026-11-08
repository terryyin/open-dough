// Recover's continuation kept on a scripted PTY instead of a native Cursor
// client. A spec feeds Cursor's reads and inspects what Recover typed.
import type { IPty } from "@lydell/node-pty";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { TerminalAttachments } from "../../server/terminalAttachments.ts";
import { showsCursorComposer } from "../../server/hosts/cursor/idleScreen.ts";
import { cursorSessionId } from "./fakeCursor.ts";

export const continuationInstruction =
  "Continue the recorded Execution.\nWorktree: /tmp.";

export function keepRecoveredCursor(
  attachments: TerminalAttachments,
  name: string,
) {
  let data: ((chunk: string) => void) | undefined;
  const written: string[] = [];
  const pty = {
    cols: 80,
    rows: 24,
    onData: (listener: (chunk: string) => void) => {
      data = listener;
      return { dispose() {} };
    },
    onExit: () => ({ dispose() {} }),
    resize: () => {},
    kill: () => {},
    write: (input: string) => {
      written.push(input);
    },
  } as unknown as IPty;
  const kept = attachments.keep(
    makeMe.aHostSession
      .cursor({
        sessionId: cursorSessionId,
        continuation: { workspace: "/tmp" },
      })
      .named(name)
      .please(),
    pty,
    {
      instruction: continuationInstruction,
      ready: showsCursorComposer,
      onEntered: async () => {},
    },
  );
  return { kept, written, read: (chunk: string) => data?.(chunk) };
}
