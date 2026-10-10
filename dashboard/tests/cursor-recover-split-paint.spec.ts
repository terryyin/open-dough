// Drive the kept-client registry, launch instruction, and Cursor screen label
// with a native PTY replaced, so one working paint arrives in two reads split
// at its line break, as a Linux PTY can deliver it. The first read alone looks
// like the idle composer, but its synchronized update has not finished.
import { expect, test } from "./support/pageTest.ts";
import { TerminalAttachments } from "../server/terminalAttachments.ts";
import { cursorSessionLabel } from "../server/hosts/cursor/idleScreen.ts";
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";
import { keepRecoveredCursor } from "./support/recoveredCursorPty.ts";

const followUpRead = "\x1b[?2026h\x1b[?25h\x1b[2J\x1b[H→ Add a follow-up\r\n";
const workingRead = "ctrl+c to stop\r\n\x1b[?2026l";

test("Recover types nothing into a working paint split at its line break, and reads it as working", async () => {
  const attachments = new TerminalAttachments();
  try {
    const recovered = keepRecoveredCursor(attachments, "Split paint");
    recovered.read(followUpRead);
    // The registry's screen has the first read before the second arrives.
    await expect
      .poll(async () => (await attachments.held())[0]?.screen ?? "")
      .toContain("Add a follow-up");
    recovered.read(workingRead);
    await recovered.kept;
    const [held] = await attachments.held();
    expect({
      typed: recovered.written,
      label: cursorSessionLabel(held?.screen ?? ""),
    }).toEqual({ typed: [], label: cursorHeldLabel.working });
  } finally {
    attachments.close();
  }
});
