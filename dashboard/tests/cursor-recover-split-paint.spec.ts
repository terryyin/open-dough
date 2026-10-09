// Drive the kept-client registry, launch instruction, and Cursor screen label
// with a native PTY replaced, so one working paint arrives in two reads split
// at its line break, as a Linux PTY can deliver it. The first read alone looks
// like the idle composer, but its synchronized update has not finished.
import type { IPty } from "@lydell/node-pty";
import { expect, test } from "./support/pageTest.ts";
import { TerminalAttachments } from "../server/terminalAttachments.ts";
import {
  cursorSessionLabel,
  showsCursorComposer,
} from "../server/hosts/cursor/idleScreen.ts";
import type { CursorSession } from "../src/hostSession.ts";
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";
import { cursorSessionId } from "./support/fakeCursor.ts";

const followUpRead = "\x1b[?2026h\x1b[?25h\x1b[2J\x1b[H→ Add a follow-up\r\n";
const workingRead = "ctrl+c to stop\r\n\x1b[?2026l";

function nativeTerminal() {
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
  return { pty, written, read: (chunk: string) => data?.(chunk) };
}

const session: CursorSession = {
  host: "cursor",
  sessionId: cursorSessionId,
  name: "Split paint",
  continuation: { workspace: "/tmp", args: ["cursor-agent"] },
};

test("Recover types nothing into a working paint split at its line break, and reads it as working", async () => {
  const attachments = new TerminalAttachments();
  const native = nativeTerminal();
  try {
    const kept = attachments.keep(session, native.pty, {
      instruction: "Continue the recorded Execution.\nWorktree: /tmp.",
      ready: showsCursorComposer,
      onEntered: async () => {},
    });
    native.read(followUpRead);
    // The registry's screen has the first read before the second arrives.
    await expect
      .poll(async () => (await attachments.held())[0]?.screen ?? "")
      .toContain("Add a follow-up");
    native.read(workingRead);
    await kept;
    const [held] = await attachments.held();
    expect({
      typed: native.written,
      label: cursorSessionLabel(held?.screen ?? ""),
    }).toEqual({ typed: [], label: cursorHeldLabel.working });
  } finally {
    attachments.close();
  }
});
